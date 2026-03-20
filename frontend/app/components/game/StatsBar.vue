<script setup lang="ts">
const { state, creditsPerSecond, energyPerSecond } = useGameState()
const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold text-white">₢{{ formatNumber(state.credits) }}</div>
      <div class="text-xs text-zinc-400">Credits</div>
    </div>
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold text-violet-400">{{ formatNumber(creditsPerSecond) }}/s</div>
      <div class="text-xs text-zinc-400">Credits/sec</div>
    </div>
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold text-amber-400">{{ formatNumber(state.energy) }} TW</div>
      <div class="text-xs text-zinc-400">Energy</div>
    </div>
    <div class="rounded-lg bg-white/5 px-3 py-2 text-center">
      <div class="text-lg font-bold text-amber-300">{{ formatNumber(energyPerSecond) }} TW/s</div>
      <div class="text-xs text-zinc-400">Energy/sec</div>
    </div>
  </div>
</template>
