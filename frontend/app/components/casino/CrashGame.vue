<script setup lang="ts">
const { canWager, placeWager, collectWinnings, generateCrashPoint } = useCasino()
const { formatNumber } = useNumberFormat()

const wager = ref(0)
const playing = ref(false)
const multiplier = ref(1.0)
const crashed = ref(false)
const cashedOut = ref(false)
const result = ref<{ won: boolean; payout: number; crashAt: number; cashOutAt: number } | null>(null)

let crashPoint = 1.0
let startTime = 0
let animFrame = 0

function tick() {
  if (!playing.value || crashed.value || cashedOut.value) return

  const elapsed = (Date.now() - startTime) / 1000
  // Exponential growth: starts slow, accelerates
  multiplier.value = Math.pow(Math.E, elapsed * 0.5)

  if (multiplier.value >= crashPoint) {
    // Crash!
    multiplier.value = crashPoint
    crashed.value = true
    playing.value = false
    result.value = {
      won: false,
      payout: 0,
      crashAt: Math.floor(crashPoint * 100) / 100,
      cashOutAt: 0
    }
    return
  }

  animFrame = requestAnimationFrame(tick)
}

function play() {
  if (!canWager(wager.value) || playing.value) return
  if (!placeWager(wager.value)) return

  playing.value = true
  crashed.value = false
  cashedOut.value = false
  result.value = null
  multiplier.value = 1.0
  crashPoint = generateCrashPoint()
  startTime = Date.now()

  animFrame = requestAnimationFrame(tick)
}

function cashOut() {
  if (!playing.value || crashed.value || cashedOut.value) return

  cancelAnimationFrame(animFrame)
  cashedOut.value = true
  playing.value = false

  const payout = Math.floor(wager.value * multiplier.value)
  collectWinnings(payout)

  result.value = {
    won: true,
    payout,
    crashAt: Math.floor(crashPoint * 100) / 100,
    cashOutAt: Math.floor(multiplier.value * 100) / 100
  }
}

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})

const displayMultiplier = computed(() => {
  return (Math.floor(multiplier.value * 100) / 100).toFixed(2)
})
</script>

<template>
  <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4 space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-trending-up" class="text-xl text-emerald-400" />
      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Crash</h3>
      <span class="text-xs text-zinc-500">cash out before crash</span>
    </div>

    <!-- Multiplier display -->
    <div
      class="flex items-center justify-center py-6 rounded-lg border-2 transition-all"
      :class="[
        crashed ? 'border-red-500 bg-red-500/10' : cashedOut ? 'border-green-500 bg-green-500/10' : playing ? 'border-emerald-400 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-800/50'
      ]"
    >
      <div class="text-center">
        <div
          class="text-4xl font-mono font-bold transition-colors"
          :class="crashed ? 'text-red-400' : cashedOut ? 'text-green-400' : playing ? 'text-emerald-400' : 'text-zinc-400'"
        >
          {{ displayMultiplier }}x
        </div>
        <div v-if="crashed" class="text-xs text-red-400 mt-1">CRASHED</div>
        <div v-else-if="cashedOut" class="text-xs text-green-400 mt-1">CASHED OUT</div>
        <div v-else-if="playing" class="text-xs text-emerald-300 mt-1 animate-pulse">RISING...</div>
      </div>
    </div>

    <CasinoWagerInput v-model="wager" :disabled="playing" />

    <div class="flex gap-2">
      <UButton
        v-if="!playing"
        block
        color="primary"
        :disabled="!canWager(wager)"
        @click="play"
      >
        Start
      </UButton>
      <UButton
        v-else
        block
        color="success"
        @click="cashOut"
      >
        Cash Out (₢{{ formatNumber(Math.floor(wager * multiplier)) }})
      </UButton>
    </div>

    <!-- Result -->
    <div v-if="result" class="text-center text-sm">
      <span v-if="result.won" class="text-green-400 font-bold">
        Cashed out at {{ result.cashOutAt }}x — Won ₢{{ formatNumber(result.payout) }}!
      </span>
      <span v-else class="text-red-400">
        Crashed at {{ result.crashAt }}x
      </span>
    </div>
  </div>
</template>
