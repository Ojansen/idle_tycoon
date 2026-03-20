<script setup lang="ts">
const { state } = useGameState()
const {
  energyToCreditsRate,
  creditsToEnergyRate,
  energyMarketHealth,
  creditsMarketHealth,
  previewSellEnergy,
  previewSellCredits,
  sellEnergy,
  sellCredits,
  BASE_RATE
} = useResourceExchange()
const { formatNumber } = useNumberFormat()

// Sell energy side
const energyAmount = ref(0)
const energyPreview = computed(() => previewSellEnergy(energyAmount.value))

function setEnergyPercent(pct: number) {
  energyAmount.value = Math.floor(state.value.energy * pct)
}

function doSellEnergy() {
  if (energyAmount.value <= 0) return
  sellEnergy(energyAmount.value)
  energyAmount.value = 0
}

// Sell credits side
const creditsAmount = ref(0)
const creditsPreview = computed(() => previewSellCredits(creditsAmount.value))

function setCreditsPercent(pct: number) {
  creditsAmount.value = Math.floor(state.value.credits * pct)
}

function doSellCredits() {
  if (creditsAmount.value <= 0) return
  sellCredits(creditsAmount.value)
  creditsAmount.value = 0
}
</script>

<template>
  <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4 space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-arrow-left-right" class="text-xl text-violet-400" />
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Resource Exchange</h2>
      <span class="text-xs text-zinc-500 ml-auto">Base: 1 ⚡ = ₢{{ BASE_RATE }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Sell Energy → Credits -->
      <div class="rounded-lg bg-white/[0.02] border border-white/5 p-3 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Sell Energy → Credits</span>
        </div>

        <!-- Current rate & market health -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Spot rate</span>
            <span class="text-white font-medium">1 ⚡ = ₢{{ formatNumber(energyToCreditsRate) }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Market demand</span>
            <span :class="energyMarketHealth >= 80 ? 'text-green-400' : energyMarketHealth >= 50 ? 'text-amber-400' : 'text-red-400'" class="font-medium">
              {{ energyMarketHealth }}%
            </span>
          </div>
          <UProgress
            :model-value="energyMarketHealth"
            size="xs"
            :color="energyMarketHealth >= 80 ? 'success' : energyMarketHealth >= 50 ? 'warning' : 'error'"
          />
        </div>

        <!-- Amount input -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UInput
              v-model.number="energyAmount"
              type="number"
              :min="0"
              :max="Math.floor(state.energy)"
              placeholder="Amount"
              size="sm"
              class="flex-1"
            />
            <span class="text-xs text-zinc-500 shrink-0">/ {{ formatNumber(state.energy) }} ⚡</span>
          </div>
          <div class="flex gap-1">
            <UButton
              v-for="pct in [0.01, 0.1, 0.25, 0.5, 1]"
              :key="pct"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="setEnergyPercent(pct)"
            >
              {{ pct === 1 ? 'All' : `${Math.round(pct * 100)}%` }}
            </UButton>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="energyAmount > 0" class="rounded bg-white/[0.03] p-2 space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-zinc-400">You receive</span>
            <span class="text-emerald-400 font-medium">₢{{ formatNumber(energyPreview.received) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-400">Avg rate</span>
            <span class="text-zinc-300">₢{{ formatNumber(energyPreview.avgRate) }}/⚡</span>
          </div>
        </div>

        <!-- Sell button -->
        <UButton
          block
          size="sm"
          color="warning"
          variant="outline"
          :disabled="energyAmount <= 0 || energyAmount > state.energy"
          @click="doSellEnergy"
        >
          Sell {{ formatNumber(energyAmount) }} Energy
        </UButton>
      </div>

      <!-- Sell Credits → Energy -->
      <div class="rounded-lg bg-white/[0.02] border border-white/5 p-3 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Buy Energy ← Credits</span>
        </div>

        <!-- Current rate & market health -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Spot rate</span>
            <span class="text-white font-medium">1 ⚡ = ₢{{ formatNumber(1 / creditsToEnergyRate) }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Market demand</span>
            <span :class="creditsMarketHealth >= 80 ? 'text-green-400' : creditsMarketHealth >= 50 ? 'text-amber-400' : 'text-red-400'" class="font-medium">
              {{ creditsMarketHealth }}%
            </span>
          </div>
          <UProgress
            :model-value="creditsMarketHealth"
            size="xs"
            :color="creditsMarketHealth >= 80 ? 'success' : creditsMarketHealth >= 50 ? 'warning' : 'error'"
          />
        </div>

        <!-- Amount input -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UInput
              v-model.number="creditsAmount"
              type="number"
              :min="0"
              :max="Math.floor(state.credits)"
              placeholder="Amount"
              size="sm"
              class="flex-1"
            />
            <span class="text-xs text-zinc-500 shrink-0">/ ₢{{ formatNumber(state.credits) }}</span>
          </div>
          <div class="flex gap-1">
            <UButton
              v-for="pct in [0.01, 0.1, 0.25, 0.5, 1]"
              :key="pct"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="setCreditsPercent(pct)"
            >
              {{ pct === 1 ? 'All' : `${Math.round(pct * 100)}%` }}
            </UButton>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="creditsAmount > 0" class="rounded bg-white/[0.03] p-2 space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-zinc-400">You receive</span>
            <span class="text-amber-400 font-medium">{{ formatNumber(creditsPreview.received) }} ⚡</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-400">Avg rate</span>
            <span class="text-zinc-300">₢{{ formatNumber(creditsPreview.avgRate) }}/⚡</span>
          </div>
        </div>

        <!-- Buy button -->
        <UButton
          block
          size="sm"
          color="primary"
          variant="outline"
          :disabled="creditsAmount <= 0 || creditsAmount > state.credits"
          @click="doSellCredits"
        >
          Buy Energy for ₢{{ formatNumber(creditsAmount) }}
        </UButton>
      </div>
    </div>
  </div>
</template>
