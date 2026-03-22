<script setup lang="ts">
const { state, dividendIncome } = useGameState()
const { companies, prices, prevPrices, priceHistory, portfolioValue } = useStockMarket()
const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="space-y-4">
    <!-- Resource Exchange -->
    <MarketResourceExchangePanel />

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-trending-up" class="text-xl text-emerald-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Galactic Stock Exchange</h2>
      </div>
      <div class="flex gap-4 text-xs text-zinc-500">
        <span>Portfolio: <span class="text-white font-medium">₢{{ formatNumber(portfolioValue) }}</span></span>
        <span>Dividends: <span class="text-green-400 font-medium">+₢{{ formatNumber(dividendIncome) }}/s</span></span>
      </div>
    </div>

    <!-- Stock grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <MarketStockCard
        v-for="company in companies"
        :key="company.id"
        :company="company"
        :price="prices[company.id] || company.basePrice"
        :prev-price="prevPrices[company.id] || company.basePrice"
        :history="[...(priceHistory[company.id] || [company.basePrice])]"
        :owned="state.stocks[company.id] || 0"
      />
    </div>
  </div>
</template>
