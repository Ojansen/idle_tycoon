<script setup lang="ts">
const { buildings } = useGameConfig()
const { state, getBuildingCost } = useGameState()
const { buyBuilding, isBuildingUnlocked } = useGameActions()

const buyQuantity = ref(1)

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
              :cost="getBuildingCost(b.id, buyQuantity)"
              :affordable="state.credits >= getBuildingCost(b.id, buyQuantity)"
              :quantity="buyQuantity"
              @buy="buyBuilding(b.id, buyQuantity)"
            />
          </div>
        </div>

        <div v-if="creditBuildings.length">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2 px-1">
            Credit Generators
          </h3>
          <div class="space-y-1">
            <GameBuildingCard
              v-for="b in creditBuildings"
              :key="b.id"
              :building="b"
              :owned="state.buildings[b.id] || 0"
              :cost="getBuildingCost(b.id, buyQuantity)"
              :affordable="state.credits >= getBuildingCost(b.id, buyQuantity)"
              :quantity="buyQuantity"
              @buy="buyBuilding(b.id, buyQuantity)"
            />
          </div>
        </div>
      </div>

      <!-- Right: Energy Generators -->
      <div>
        <div v-if="energyBuildings.length">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 px-1">
            Energy Generators
          </h3>
          <div class="space-y-1">
            <GameBuildingCard
              v-for="b in energyBuildings"
              :key="b.id"
              :building="b"
              :owned="state.buildings[b.id] || 0"
              :cost="getBuildingCost(b.id, buyQuantity)"
              :affordable="state.credits >= getBuildingCost(b.id, buyQuantity)"
              :quantity="buyQuantity"
              @buy="buyBuilding(b.id, buyQuantity)"
            />
          </div>
        </div>
      </div>
    </div>

    <p v-if="!unlockedBuildings.length" class="text-sm text-zinc-500 text-center py-4">
      No buildings available yet. Start clicking!
    </p>
  </div>
</template>
