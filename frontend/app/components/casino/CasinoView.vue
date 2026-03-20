<script setup lang="ts">
const { state } = useGameState()
const { formatNumber } = useNumberFormat()
const { casinoDisabled } = useCasino()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-dice-5" class="text-xl text-yellow-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">{{ state.companyName || 'MegaCorp' }} Casino</h2>
      </div>
      <div class="flex gap-3 text-xs text-zinc-500">
        <span>Games: {{ state.casinoStats.gamesPlayed }}</span>
        <span>Wagered: ₢{{ formatNumber(state.casinoStats.totalWagered) }}</span>
        <span :class="state.casinoStats.totalWon > state.casinoStats.totalWagered ? 'text-green-400' : 'text-red-400'">
          P/L: ₢{{ formatNumber(state.casinoStats.totalWon - state.casinoStats.totalWagered) }}
        </span>
      </div>
    </div>

    <!-- Casino disabled by Risk Averse trait -->
    <div v-if="casinoDisabled" class="rounded-lg bg-white/[0.03] border border-white/10 p-8 text-center">
      <UIcon name="i-lucide-shield" class="text-4xl text-zinc-500 mb-3" />
      <h3 class="text-lg font-bold text-white mb-2">Casino Disabled</h3>
      <p class="text-sm text-zinc-400">Your corporation's <span class="text-amber-400">Risk Averse</span> policy prohibits all gambling activities.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CasinoCoinFlip />
      <CasinoSlotMachine />
      <CasinoCrashGame />
    </div>
  </div>
</template>
