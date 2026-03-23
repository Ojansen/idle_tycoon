<script setup lang="ts">
const { state, creditsPerSecond, energyPerSecond, cgPerSecond } = useGameState()
const { energyDrainPerSecond, isResearching } = useResearchActions()
const { netCreditsPerSecond, netEnergyPerSecond, totalEnergyUpkeep, effectiveCgProduction, totalCgConsumption, cgThrottle, energyThrottle, hasUpkeep } = useUpkeep()
const { convertedTradeValue, isTradeDisabled } = useTrade()
const { formatNumber } = useNumberFormat()

const hasTradeValue = computed(() => !isTradeDisabled.value && convertedTradeValue.value > 0)

const totalEnergyNeed = computed(() => totalEnergyUpkeep.value + energyDrainPerSecond.value)
const isThrottled = computed(() => cgThrottle.value < 1 || energyThrottle.value < 1)
const efficiencyPct = computed(() => Math.round(Math.min(cgThrottle.value, energyThrottle.value) * 100))
const cgBalance = computed(() => effectiveCgProduction.value - totalCgConsumption.value)
const hasCgBuildings = computed(() => cgPerSecond.value > 0 || totalCgConsumption.value > 0)

const energyStatus = computed(() => {
  if (energyThrottle.value < 1) return 'deficit'
  if (totalEnergyNeed.value > 0 && energyPerSecond.value < totalEnergyNeed.value * 1.25) return 'tight'
  return 'healthy'
})

const cgStatus = computed(() => {
  if (cgThrottle.value < 1) return 'deficit'
  if (totalCgConsumption.value > 0 && effectiveCgProduction.value < totalCgConsumption.value * 1.25) return 'tight'
  return 'healthy'
})

const statusColor: Record<string, string> = {
  healthy: 'text-emerald-400',
  tight: 'text-amber-400',
  deficit: 'text-red-400',
}
</script>

<template>
  <div class="bg-zinc-950/95 backdrop-blur-sm border-b border-white/10 px-4 py-1.5">
    <div class="max-w-6xl mx-auto flex items-center gap-4 sm:gap-6 text-xs">
      <!-- Credits -->
      <div class="flex items-center gap-1.5 shrink-0">
        <UIcon name="i-lucide-banknote" class="text-emerald-400 text-sm" />
        <span class="text-white font-semibold">₢{{ formatNumber(state.credits) }}</span>
        <span class="text-zinc-500">
          {{ formatNumber(hasUpkeep ? netCreditsPerSecond : creditsPerSecond) }}/s
        </span>
      </div>

      <!-- Energy -->
      <div class="flex items-center gap-1.5 shrink-0">
        <UIcon name="i-lucide-zap" class="text-amber-400 text-sm" />
        <span class="text-white font-semibold">{{ formatNumber(state.energy) }} TW</span>
        <span class="font-semibold" :class="statusColor[energyStatus]">
          {{ formatNumber(netEnergyPerSecond) }}/s
        </span>
        <span class="text-zinc-500 hidden sm:inline">
          {{ formatNumber(energyPerSecond) }}<span v-if="totalEnergyNeed > 0" class="text-zinc-600">/{{ formatNumber(totalEnergyNeed) }}</span>
        </span>
      </div>

      <!-- Consumer Goods -->
      <div v-if="hasCgBuildings" class="flex items-center gap-1.5 shrink-0">
        <UIcon name="i-lucide-package" class="text-amber-600 text-sm" />
        <span class="font-semibold" :class="statusColor[cgStatus]">
          {{ formatNumber(cgBalance) }}/s
        </span>
        <span class="text-zinc-500 hidden sm:inline">
          {{ formatNumber(effectiveCgProduction) }}<span v-if="totalCgConsumption > 0" class="text-zinc-600">/{{ formatNumber(totalCgConsumption) }}</span>
        </span>
      </div>

      <!-- Trade Value -->
      <div v-if="hasTradeValue" class="flex items-center gap-1.5 shrink-0">
        <UIcon name="i-lucide-handshake" class="text-violet-400 text-sm" />
        <span class="text-violet-300 font-semibold">{{ formatNumber(convertedTradeValue) }}/s</span>
      </div>

      <!-- Efficiency badge -->
      <div v-if="isThrottled" class="ml-auto shrink-0">
        <UBadge size="xs" :color="efficiencyPct >= 75 ? 'warning' : 'error'" variant="subtle">
          {{ efficiencyPct }}%
        </UBadge>
      </div>
    </div>
  </div>
</template>
