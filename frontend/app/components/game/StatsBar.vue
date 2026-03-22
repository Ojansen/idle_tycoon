<script setup lang="ts">
const { state, creditsPerSecond, energyPerSecond } = useGameState()
const { energyDrainPerSecond, isResearching } = useResearchActions()
const { netCreditsPerSecond, netEnergyPerSecond, totalEnergyUpkeep, totalCreditsUpkeep, creditThrottle, energyThrottle, hasUpkeep } = useUpkeep()
const { formatNumber } = useNumberFormat()

const netEnergy = computed(() => netEnergyPerSecond.value - energyDrainPerSecond.value)
const isThrottled = computed(() => creditThrottle.value < 1 || energyThrottle.value < 1)
const efficiencyPct = computed(() => Math.round(Math.min(creditThrottle.value, energyThrottle.value) * 100))
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold text-white">₢{{ formatNumber(state.credits) }}</div>
      <div class="text-xs text-zinc-400">Credits</div>
    </div>
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold" :class="hasUpkeep && netCreditsPerSecond < creditsPerSecond ? 'text-violet-300' : 'text-violet-400'">
        {{ formatNumber(hasUpkeep ? netCreditsPerSecond : creditsPerSecond) }}/s
      </div>
      <div class="text-xs text-zinc-400">
        Credits/sec
        <span v-if="totalCreditsUpkeep > 0" class="text-zinc-500 ml-0.5">(upkeep: {{ formatNumber(totalCreditsUpkeep) }})</span>
      </div>
    </div>
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold text-amber-400">{{ formatNumber(state.energy) }} TW</div>
      <div class="text-xs text-zinc-400">Energy</div>
    </div>
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold" :class="(isResearching && netEnergy < 0) || isThrottled ? 'text-red-400' : hasUpkeep && netEnergyPerSecond < energyPerSecond ? 'text-amber-300' : 'text-amber-300'">
        {{ formatNumber(hasUpkeep ? netEnergyPerSecond : energyPerSecond) }} TW/s
      </div>
      <div class="text-xs text-zinc-400">
        Energy/sec
        <span v-if="totalEnergyUpkeep > 0" class="text-zinc-500 ml-0.5">(upkeep: {{ formatNumber(totalEnergyUpkeep) }})</span>
        <span v-if="isResearching" class="text-zinc-500 ml-0.5">(net: {{ formatNumber(netEnergy) }})</span>
      </div>
      <div v-if="isThrottled" class="mt-0.5">
        <UBadge size="xs" :color="efficiencyPct >= 75 ? 'warning' : 'error'" variant="subtle">
          {{ efficiencyPct }}% efficiency
        </UBadge>
      </div>
    </div>
  </div>
</template>
