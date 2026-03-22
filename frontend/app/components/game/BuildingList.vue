<script setup lang="ts">
const { buildings, kardashevLevels } = useGameConfig()
const { state, getBuildingCost, getMaxBuyableCount } = useGameState()
const { buyBuilding, isBuildingUnlocked } = useGameActions()

const buyQuantity = ref<number | 'max'>(1)

const unlockedBuildings = computed(() =>
  buildings.filter(b => isBuildingUnlocked(b.id))
)

const autoclickBuildings = computed(() =>
  unlockedBuildings.value.filter(b => b.resource === 'autoclick')
)

const creditBuildings = computed(() =>
  unlockedBuildings.value.filter(b => b.resource === 'credits')
)

const energyBuildings = computed(() =>
  unlockedBuildings.value.filter(b => b.resource === 'energy')
)

function groupByTier(blds: typeof buildings) {
  const groups: { name: string; buildings: typeof buildings }[] = []
  for (const k of kardashevLevels) {
    const tierBuildings = blds.filter(b => b.unlockKardashev === k.level)
    if (tierBuildings.length > 0) groups.push({ name: k.name, buildings: tierBuildings })
  }
  return groups
}

const creditTiers = computed(() => groupByTier(creditBuildings.value))
const energyTiers = computed(() => groupByTier(energyBuildings.value))

function getEffectiveQuantity(buildingId: string): number {
  if (buyQuantity.value === 'max') {
    return Math.max(1, getMaxBuyableCount(buildingId))
  }
  return buyQuantity.value
}

function getCost(buildingId: string): number {
  return getBuildingCost(buildingId, getEffectiveQuantity(buildingId))
}

function isAffordable(buildingId: string): boolean {
  if (buyQuantity.value === 'max') {
    return getMaxBuyableCount(buildingId) >= 1
  }
  return state.value.credits >= getBuildingCost(buildingId, buyQuantity.value)
}

function handleBuy(buildingId: string) {
  buyBuilding(buildingId, getEffectiveQuantity(buildingId))
}
</script>

<template>
  <div class="space-y-4">
    <!-- Buy multiplier selector -->
    <div class="flex gap-1 justify-end">
      <UButton
        v-for="q in [1, 10, 100]"
        :key="q"
        size="xs"
        :color="buyQuantity === q ? 'primary' : 'neutral'"
        :variant="buyQuantity === q ? 'solid' : 'ghost'"
        @click="buyQuantity = q"
      >
        {{ q }}x
      </UButton>
      <UButton
        size="xs"
        :color="buyQuantity === 'max' ? 'primary' : 'neutral'"
        :variant="buyQuantity === 'max' ? 'solid' : 'ghost'"
        @click="buyQuantity = 'max'"
      >
        MAX
      </UButton>
    </div>

    <!-- 2-column grid for credits + energy, pops spans full width -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left: Pops + Credit Generators -->
      <div class="space-y-4">
        <div v-if="autoclickBuildings.length">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 px-1">
            Pops
          </h3>
          <div class="space-y-1">
            <GameBuildingCard
              v-for="b in autoclickBuildings"
              :key="b.id"
              :building="b"
              :owned="state.buildings[b.id] || 0"
              :cost="getCost(b.id)"
              :affordable="isAffordable(b.id)"
              :quantity="getEffectiveQuantity(b.id)"
              @buy="handleBuy(b.id)"
            />
          </div>
        </div>

        <div v-if="creditBuildings.length" class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400 px-1">
            Credit Generators
          </h3>
        <div v-for="tier in creditTiers" :key="tier.name">
          <h4 class="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5 px-1">
            {{ tier.name }}
          </h4>
          <div class="space-y-1">
            <GameBuildingCard
              v-for="b in tier.buildings"
              :key="b.id"
              :building="b"
              :owned="state.buildings[b.id] || 0"
              :cost="getCost(b.id)"
              :affordable="isAffordable(b.id)"
              :quantity="getEffectiveQuantity(b.id)"
              @buy="handleBuy(b.id)"
            />
          </div>
        </div>
        </div>
      </div>

      <!-- Right: Energy Generators -->
      <div>
        <div v-if="energyBuildings.length" class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-amber-400 px-1">
            Energy Generators
          </h3>
        <div v-for="tier in energyTiers" :key="tier.name">
          <h4 class="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5 px-1">
            {{ tier.name }}
          </h4>
          <div class="space-y-1">
            <GameBuildingCard
              v-for="b in tier.buildings"
              :key="b.id"
              :building="b"
              :owned="state.buildings[b.id] || 0"
              :cost="getCost(b.id)"
              :affordable="isAffordable(b.id)"
              :quantity="getEffectiveQuantity(b.id)"
              @buy="handleBuy(b.id)"
            />
          </div>
        </div>
        </div>
      </div>
    </div>

    <p v-if="!unlockedBuildings.length" class="text-sm text-zinc-500 text-center py-4">
      No buildings available yet. Start clicking!
    </p>
  </div>
</template>
