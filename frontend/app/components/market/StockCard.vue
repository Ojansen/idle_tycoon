<script setup lang="ts">
import type { StockCompany } from '~/types/game'

const props = defineProps<{
  company: StockCompany
  price: number
  prevPrice: number
  history: number[]
  owned: number
}>()

const { state } = useGameState()
const { buyShares, sellShares } = useStockMarket()
const { formatNumber } = useNumberFormat()

const buyQty = ref(1)
const isSubsidiary = computed(() => props.owned >= props.company.totalShares)
const ownershipPct = computed(() => Math.floor((props.owned / props.company.totalShares) * 100))
const priceUp = computed(() => props.price >= props.prevPrice)
const priceChange = computed(() => {
  const diff = props.price - props.prevPrice
  return diff >= 0 ? `+${formatNumber(diff)}` : `-${formatNumber(Math.abs(diff))}`
})
const dividendPerSec = computed(() => {
  if (!isSubsidiary.value) return 0
  return props.company.dividendRate * props.company.totalShares
})
const holdingValue = computed(() => Math.floor(props.owned * props.price))
const costBasis = computed(() => props.owned * props.company.basePrice) // rough estimate
const buyableQty = computed(() => Math.min(buyQty.value, props.company.totalShares - props.owned))
const buyCost = computed(() => Math.floor(props.price * buyableQty.value))
const canBuy = computed(() => buyableQty.value > 0 && state.value.credits >= buyCost.value)
const sellableQty = computed(() => Math.min(buyQty.value, props.owned))
</script>

<template>
  <div
    class="rounded-lg border p-3 space-y-2"
    :class="isSubsidiary ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.03] border-white/10'"
  >
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon :name="props.company.icon" class="text-lg" :class="isSubsidiary ? 'text-amber-400' : 'text-zinc-400'" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-white truncate">{{ props.company.name }}</span>
          <UBadge v-if="isSubsidiary" color="warning" variant="subtle" size="xs">SUBSIDIARY</UBadge>
        </div>
        <span class="text-xs text-zinc-500">{{ props.company.sector }}</span>
      </div>
      <MarketPriceSparkline :history="props.history" :up="priceUp" />
    </div>

    <!-- Price + change -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-sm font-bold text-white">₢{{ formatNumber(props.price) }}</span>
        <span class="text-xs ml-1" :class="priceUp ? 'text-green-400' : 'text-red-400'">
          {{ priceChange }}
        </span>
      </div>
      <div v-if="isSubsidiary" class="text-xs text-amber-400 font-medium">
        +₢{{ formatNumber(dividendPerSec) }}/s dividends
      </div>
      <div v-else-if="props.owned > 0" class="text-xs text-zinc-400">
        Holding: ₢{{ formatNumber(holdingValue) }}
      </div>
    </div>

    <!-- Ownership bar -->
    <div class="flex items-center gap-2">
      <UProgress :model-value="ownershipPct" size="xs" :color="isSubsidiary ? 'warning' : 'primary'" class="flex-1" />
      <span class="text-xs text-zinc-400 shrink-0">{{ props.owned }}/{{ props.company.totalShares }}</span>
    </div>

    <!-- Buy/Sell -->
    <div v-if="!isSubsidiary" class="flex items-center gap-2">
      <div class="flex gap-1">
        <UButton
          v-for="q in [1, 10, 100]"
          :key="q"
          size="xs"
          :color="buyQty === q ? 'primary' : 'neutral'"
          :variant="buyQty === q ? 'solid' : 'ghost'"
          @click="buyQty = q"
        >
          {{ q }}
        </UButton>
      </div>
      <UButton
        size="xs"
        color="success"
        variant="outline"
        :disabled="!canBuy"
        @click="buyShares(props.company.id, buyableQty)"
      >
        Buy ₢{{ formatNumber(buyCost) }}
      </UButton>
      <UButton
        v-if="props.owned > 0"
        size="xs"
        color="error"
        variant="outline"
        @click="sellShares(props.company.id, sellableQty)"
      >
        Sell {{ sellableQty }}
      </UButton>
    </div>
  </div>
</template>
