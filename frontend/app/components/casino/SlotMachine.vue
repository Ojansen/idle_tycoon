<script setup lang="ts">
const { canWager, placeWager, collectWinnings } = useCasino()
const { formatNumber } = useNumberFormat()

const symbols = ['⛏️', '⚡', '🌍', '💎', '🌟']
const payouts: Record<string, number> = {
  '⛏️': 3,
  '⚡': 5,
  '🌍': 8,
  '💎': 15,
  '🌟': 50
}

const wager = ref(0)
const playing = ref(false)
const reels = ref(['⛏️', '⛏️', '⛏️'])
const spinning = ref([false, false, false])
const result = ref<{ won: boolean; payout: number; multiplier: number } | null>(null)

function randomSymbol(): string {
  // Weighted: common symbols more likely
  const weights = [30, 25, 20, 15, 10] // ⛏️ most common, 🌟 rarest
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < symbols.length; i++) {
    r -= weights[i]!
    if (r <= 0) return symbols[i]!
  }
  return symbols[0]!
}

async function play() {
  if (!canWager(wager.value) || playing.value) return
  if (!placeWager(wager.value)) return

  playing.value = true
  result.value = null
  spinning.value = [true, true, true]

  // Determine final symbols
  const finalReels = [randomSymbol(), randomSymbol(), randomSymbol()]

  // Staggered stop: 0.6s, 1.0s, 1.4s
  // Rapid visual cycling during spin
  const intervals = spinning.value.map((_, i) => {
    return setInterval(() => {
      reels.value[i] = symbols[Math.floor(Math.random() * symbols.length)]!
    }, 80)
  })

  for (let i = 0; i < 3; i++) {
    await new Promise(r => setTimeout(r, i === 0 ? 600 : 400))
    clearInterval(intervals[i])
    reels.value[i] = finalReels[i]!
    spinning.value[i] = false
  }

  // Calculate payout
  const [a, b, c] = finalReels as [string, string, string]
  let multiplier = 0
  if (a === b && b === c) {
    multiplier = payouts[a] ?? 5
  } else if (a === b || b === c || a === c) {
    multiplier = 1.5
  }

  const payout = Math.floor(wager.value * multiplier)
  if (payout > 0) collectWinnings(payout)

  result.value = { won: payout > 0, payout, multiplier }
  playing.value = false
}
</script>

<template>
  <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4 space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-cherry" class="text-xl text-pink-400" />
      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Slots</h3>
      <span class="text-xs text-zinc-500">up to 50x</span>
    </div>

    <!-- Reels -->
    <div class="flex justify-center gap-2 py-4">
      <div
        v-for="(symbol, i) in reels"
        :key="i"
        class="w-16 h-16 rounded-lg flex items-center justify-center text-3xl border-2 transition-all"
        :class="[
          spinning[i] ? 'border-yellow-400 bg-yellow-500/10' : 'border-zinc-600 bg-zinc-800',
          result?.won && !spinning[i] ? 'border-green-400 bg-green-500/10' : ''
        ]"
      >
        {{ symbol }}
      </div>
    </div>

    <CasinoWagerInput v-model="wager" :disabled="playing" />

    <UButton
      block
      color="primary"
      :disabled="!canWager(wager) || playing"
      :loading="playing"
      @click="play"
    >
      Spin
    </UButton>

    <!-- Result -->
    <div v-if="result" class="text-center text-sm">
      <span v-if="result.won" class="text-green-400 font-bold">
        {{ result.multiplier }}x — Won ₢{{ formatNumber(result.payout) }}!
      </span>
      <span v-else class="text-red-400">
        No match — lost
      </span>
    </div>
  </div>
</template>
