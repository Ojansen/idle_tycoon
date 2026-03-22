<script setup lang="ts">
const { state } = useGameState()
const { canPrestige, getPrestigeInfluenceGain, performPrestige, buyPrestigeUpgrade, getRepeatableCost, buyRepeatableUpgrade } = useGameActions()
const { prestigeUpgrades, repeatablePrestigeUpgrades, kardashevLevels } = useGameConfig()
const { formatNumber } = useNumberFormat()

const showConfirm = ref(false)

const currentInfluenceGain = computed(() => getPrestigeInfluenceGain())

const prestigeTiers = computed(() => {
  const tiers: { level: number; name: string; unlocked: boolean; upgrades: typeof prestigeUpgrades.value[] }[] = []
  const tierMap = new Map<number, typeof prestigeUpgrades.value[]>()

  for (const upgrade of prestigeUpgrades) {
    const k = upgrade.requiredKardashev ?? 0
    if (!tierMap.has(k)) tierMap.set(k, [])
    tierMap.get(k)!.push(upgrade)
  }

  for (const [level, upgrades] of [...tierMap.entries()].sort((a, b) => a[0] - b[0])) {
    const kDef = kardashevLevels.find(k => k.level === level)
    tiers.push({
      level,
      name: level === 0 ? 'Starter' : `Requires ${kDef?.name ?? `Type ${level}`}`,
      unlocked: state.value.kardashevHighWaterMark >= level,
      upgrades
    })
  }
  return tiers
})

function handlePrestige() {
  showConfirm.value = false
  performPrestige()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Ascension Perks -->
    <GameAscensionPerks />

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-star" class="text-xl text-amber-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Corporate Restructuring</h2>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="text-amber-400 font-bold">
          <UIcon name="i-lucide-star" class="align-middle" />
          {{ formatNumber(state.influence) }} Influence
        </span>
        <span class="text-zinc-500">Prestiges: {{ state.prestigeCount }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Restructure action -->
      <div class="rounded-lg bg-gradient-to-b from-amber-950/30 to-zinc-900/30 border border-amber-500/20 p-5 text-center">
        <UIcon name="i-lucide-refresh-cw" class="text-4xl text-amber-400 mb-3" />
        <h3 class="text-lg font-bold text-white mb-2">Restructure</h3>
        <p class="text-sm text-zinc-400 mb-4">
          Reset your Credits, Energy, buildings, and click upgrades.
        </p>
        <p class="text-sm text-zinc-300 mb-2">
          You will gain
          <span class="text-amber-300 font-bold text-lg">{{ formatNumber(currentInfluenceGain) }} Influence</span>
        </p>
        <p class="text-xs text-zinc-500 mb-4">
          Total energy earned: {{ formatNumber(state.totalEnergyEarned) }} TW
        </p>

        <UButton
          color="warning"
          size="lg"
          :disabled="!canPrestige()"
          @click="showConfirm = true"
        >
          Restructure Empire
        </UButton>
        <p v-if="!canPrestige()" class="text-xs text-zinc-500 mt-3">
          Earn more Energy to gain at least 1 Influence
        </p>
      </div>

      <!-- Prestige shop -->
      <div class="lg:col-span-2 rounded-lg bg-white/[0.03] border border-white/10 p-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">Prestige Shop</h3>
        <div v-for="tier in prestigeTiers" :key="tier.level" class="mb-4 last:mb-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider" :class="tier.unlocked ? 'text-zinc-400' : 'text-zinc-600'">
              {{ tier.name }}
            </span>
            <UBadge v-if="!tier.unlocked" color="neutral" variant="subtle" size="xs">
              <UIcon name="i-lucide-lock" class="mr-1" />Locked
            </UBadge>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" :class="{ 'opacity-40 pointer-events-none': !tier.unlocked }">
            <div
              v-for="upgrade in tier.upgrades"
              :key="upgrade.id"
              class="flex items-center justify-between px-3 py-3 rounded-lg"
              :class="state.prestigeUpgradesBought.includes(upgrade.id) ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-white/5'"
            >
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-white">{{ upgrade.name }}</div>
                <div class="text-xs text-zinc-400">{{ upgrade.description }}</div>
              </div>
              <UBadge v-if="state.prestigeUpgradesBought.includes(upgrade.id)" color="success" variant="subtle" size="xs" class="ml-2 shrink-0">
                Owned
              </UBadge>
              <UButton
                v-else
                size="xs"
                color="warning"
                variant="outline"
                :disabled="state.influence < upgrade.cost || !tier.unlocked"
                class="ml-2 shrink-0"
                @click="buyPrestigeUpgrade(upgrade.id)"
              >
                {{ formatNumber(upgrade.cost) }} Inf
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Repeatable upgrades -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">Repeatable Upgrades</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="upgrade in repeatablePrestigeUpgrades"
          :key="upgrade.id"
          class="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 border border-white/5"
        >
          <UIcon :name="upgrade.icon" class="text-lg text-amber-400 shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-white">{{ upgrade.name }}</span>
              <UBadge size="xs" color="neutral" variant="subtle">
                Lv {{ state.prestigeRepeatables[upgrade.id] || 0 }}/{{ upgrade.maxLevel }}
              </UBadge>
            </div>
            <div class="text-xs text-zinc-400">{{ upgrade.description }}</div>
          </div>
          <UButton
            v-if="(state.prestigeRepeatables[upgrade.id] || 0) < upgrade.maxLevel"
            size="xs"
            color="warning"
            variant="outline"
            :disabled="state.influence < getRepeatableCost(upgrade.id)"
            class="shrink-0"
            @click="buyRepeatableUpgrade(upgrade.id)"
          >
            {{ formatNumber(getRepeatableCost(upgrade.id)) }} Inf
          </UButton>
          <UBadge v-else color="success" variant="subtle" size="xs" class="shrink-0">
            MAX
          </UBadge>
        </div>
      </div>
    </div>

    <!-- What you keep / what you lose -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="rounded-lg bg-red-950/20 border border-red-500/10 p-4">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">Reset on Restructure</h4>
        <ul class="text-xs text-zinc-400 space-y-1">
          <li>• Credits (₢{{ formatNumber(state.credits) }})</li>
          <li>• Energy ({{ formatNumber(state.energy) }} TW)</li>
          <li>• All buildings</li>
          <li>• Click upgrades (click power resets to 1)</li>
          <li>• Stock portfolio</li>
          <li>• Ascension perks</li>
          <li>• Research &amp; megastructures</li>
        </ul>
      </div>
      <div class="rounded-lg bg-green-950/20 border border-green-500/10 p-4">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">Kept After Restructure</h4>
        <ul class="text-xs text-zinc-400 space-y-1">
          <li>• Influence ({{ state.influence }} + {{ getPrestigeInfluenceGain() }} = {{ state.influence + getPrestigeInfluenceGain() }})</li>
          <li>• Prestige shop purchases</li>
          <li>• Achievements</li>
          <li>• Kardashev high-water mark (Type {{ state.kardashevHighWaterMark }})</li>
          <li>• Casino stats</li>
        </ul>
      </div>
    </div>

    <!-- Confirm modal -->
    <UModal v-model:open="showConfirm" title="Confirm Restructuring" description="Reset your empire for Influence">
      <template #content>
        <div class="p-6 text-center">
          <UIcon name="i-lucide-alert-triangle" class="text-4xl text-amber-400 mb-3" />
          <h3 class="text-lg font-bold text-white mb-2">Corporate Restructuring</h3>
          <p class="text-sm text-zinc-400 mb-4">
            This will reset all your Credits, Energy, and buildings.
            You will gain <span class="text-amber-300 font-bold">{{ getPrestigeInfluenceGain() }} Influence</span>.
          </p>
          <div class="flex gap-3 justify-center">
            <UButton color="neutral" variant="outline" @click="showConfirm = false">
              Cancel
            </UButton>
            <UButton color="warning" @click="handlePrestige">
              Restructure
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
