<script setup lang="ts">
const { canWager, placeWager, collectWinnings } = useCasino()
const { formatNumber } = useNumberFormat()

const wager = ref(0)
const pick = ref<'heads' | 'tails'>('heads')
const playing = ref(false)
const result = ref<{ won: boolean; side: string; payout: number } | null>(null)
const flipping = ref(false)

async function play() {
  if (!canWager(wager.value) || playing.value) return
  if (!placeWager(wager.value)) return

  playing.value = true
  result.value = null
  flipping.value = true

  // Determine result
  const coinSide = Math.random() < 0.5 ? 'heads' : 'tails'
  const won = coinSide === pick.value
  const payout = won ? Math.floor(wager.value * 1.9) : 0

  // Wait for animation
  await new Promise(r => setTimeout(r, 1000))
  flipping.value = false

  if (won) collectWinnings(payout)

  result.value = { won, side: coinSide, payout }
  playing.value = false
}
</script>

<template>
  <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4 space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-circle-dollar-sign" class="text-xl text-yellow-400" />
      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Coin Flip</h3>
      <span class="text-xs text-zinc-500">1.9x payout</span>
    </div>

    <!-- Coin display -->
    <div class="flex justify-center py-4">
      <div
        class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-2 transition-all duration-300"
        :class="[
          flipping ? 'animate-spin border-yellow-400 bg-yellow-500/20' : 'border-zinc-600 bg-zinc-800',
          result?.won ? 'border-green-400 bg-green-500/20' : result && !result.won ? 'border-red-400 bg-red-500/20' : ''
        ]"
      >
        {{ flipping ? '?' : result ? (result.side === 'heads' ? 'H' : 'T') : '₢' }}
      </div>
    </div>

    <!-- Pick -->
    <div class="flex gap-2 justify-center">
      <UButton
        :color="pick === 'heads' ? 'primary' : 'neutral'"
        :variant="pick === 'heads' ? 'solid' : 'ghost'"
        :disabled="playing"
        size="sm"
        @click="pick = 'heads'"
      >
        Heads
      </UButton>
      <UButton
        :color="pick === 'tails' ? 'primary' : 'neutral'"
        :variant="pick === 'tails' ? 'solid' : 'ghost'"
        :disabled="playing"
        size="sm"
        @click="pick = 'tails'"
      >
        Tails
      </UButton>
    </div>

    <CasinoWagerInput v-model="wager" :disabled="playing" />

    <UButton
      block
      color="primary"
      :disabled="!canWager(wager) || playing"
      :loading="playing"
      @click="play"
    >
      Flip
    </UButton>

    <!-- Result -->
    <div v-if="result" class="text-center text-sm">
      <span v-if="result.won" class="text-green-400 font-bold">
        Won ₢{{ formatNumber(result.payout) }}!
      </span>
      <span v-else class="text-red-400">
        Lost — it was {{ result.side }}
      </span>
    </div>
  </div>
</template>
