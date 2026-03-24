<script setup lang="ts">
import { CurveType } from '@unovis/ts'

const { creditsPerSecond } = useGameState()
const { netCreditsPerSecond, effectiveCgProduction, totalCgConsumption, cgThrottle, hasUpkeep, getFullUpkeepReduction, empireSize, adminCap, sprawlPenalty, totalMaintenanceWithSprawl } = useUpkeep()
const { tradeConversion } = useTrade()
const { cgChartData, growthChartData } = useProductionHistory()
const { formatNumber } = useNumberFormat()

const cgEffPct = computed(() => Math.round(cgThrottle.value * 100))
const upkeepReduction = computed(() => {
  const reduction = getFullUpkeepReduction()
  return Math.round((1 - reduction) * 100)
})

const sprawlPct = computed(() => Math.round((sprawlPenalty.value - 1) * 100))

const cgCategories = {
  production: { name: 'Production', color: '#4ade80', label: 'Production' },
  consumption: { name: 'Consumption', color: '#f87171', label: 'Consumption' }
}

const growthCategories = {
  credits: { name: 'Credits/s', color: '#a78bfa', label: 'Credits/s' }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Credits Balance -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-banknote" class="text-lg text-emerald-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Credits Balance</h3>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-3 text-center">
        <div>
          <div class="text-sm font-bold text-emerald-400">₢{{ formatNumber(creditsPerSecond) }}/s</div>
          <div class="text-xs text-zinc-500">Gross Production</div>
        </div>
        <div>
          <div class="text-sm font-bold text-red-400">-₢{{ formatNumber(totalMaintenanceWithSprawl) }}/s</div>
          <div class="text-xs text-zinc-500">Maintenance</div>
        </div>
        <div>
          <div class="text-sm font-bold" :class="netCreditsPerSecond >= 0 ? 'text-violet-300' : 'text-red-400'">
            ₢{{ formatNumber(netCreditsPerSecond) }}/s
          </div>
          <div class="text-xs text-zinc-500">Net</div>
        </div>
      </div>

      <div v-if="growthChartData.length >= 2" class="h-32 w-full">
        <AreaChart
          :data="growthChartData"
          :categories="growthCategories"
          x-label=""
          y-label=""
          :hide-x-axis="true"
          :hide-legend="false"
          :hide-tooltip="true"
          :duration="0"
          :height="128"
          :line-width="2"
          :curve-type="CurveType.MonotoneX"
        />
      </div>
      <div v-else class="h-32 flex items-center justify-center text-xs text-zinc-600">
        Collecting data...
      </div>
    </div>

    <!-- Consumer Goods Balance -->
    <div v-if="totalCgConsumption > 0 || effectiveCgProduction > 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-package" class="text-lg text-amber-600" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Consumer Goods Balance</h3>
        <UBadge v-if="cgThrottle < 1" size="xs" :color="cgEffPct >= 75 ? 'warning' : 'error'" variant="subtle">
          {{ cgEffPct }}% efficiency
        </UBadge>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-3 text-center">
        <div>
          <div class="text-sm font-bold text-emerald-400">{{ formatNumber(effectiveCgProduction) }}/s</div>
          <div class="text-xs text-zinc-500">Production</div>
        </div>
        <div>
          <div class="text-sm font-bold text-red-400">{{ formatNumber(totalCgConsumption) }}/s</div>
          <div class="text-xs text-zinc-500">Consumption</div>
        </div>
        <div>
          <div class="text-sm font-bold" :class="effectiveCgProduction >= totalCgConsumption ? 'text-amber-500' : 'text-red-400'">
            {{ effectiveCgProduction >= totalCgConsumption ? '+' : '' }}{{ formatNumber(effectiveCgProduction - totalCgConsumption) }}/s
          </div>
          <div class="text-xs text-zinc-500">Balance</div>
        </div>
      </div>

      <p v-if="tradeConversion.consumerGoods > 0" class="text-xs text-violet-400/80">
        Trade contributing +{{ formatNumber(tradeConversion.consumerGoods) }} CG/s
      </p>
      <p v-if="sprawlPct > 0" class="text-xs text-amber-500/80">
        Empire sprawl: +{{ sprawlPct }}% maintenance (size {{ empireSize }} / {{ adminCap }} cap). Invest in admin research to increase cap.
      </p>
      <p v-if="cgThrottle < 1" class="text-xs text-orange-400/80">
        CG deficit is throttling credit and pop production.
      </p>

      <div v-if="cgChartData.length >= 2" class="h-32 w-full mt-3">
        <AreaChart
          :data="cgChartData"
          :categories="cgCategories"
          x-label=""
          y-label=""
          :hide-x-axis="true"
          :hide-legend="false"
          :hide-tooltip="true"
          :duration="0"
          :height="128"
          :line-width="2"
          :curve-type="CurveType.MonotoneX"
        />
      </div>
      <div v-else class="h-32 flex items-center justify-center text-xs text-zinc-600 mt-3">
        Collecting data...
      </div>
    </div>

    <!-- Trade Value -->
    <div v-if="tradeConversion.credits > 0 || tradeConversion.consumerGoods > 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-handshake" class="text-lg text-violet-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Trade Value</h3>
      </div>
      <div class="grid grid-cols-2 gap-4 text-center">
        <div v-if="tradeConversion.credits > 0">
          <div class="text-sm font-bold text-violet-300">₢{{ formatNumber(tradeConversion.credits) }}/s</div>
          <div class="text-xs text-zinc-500">Credits from Trade</div>
        </div>
        <div v-if="tradeConversion.consumerGoods > 0">
          <div class="text-sm font-bold text-amber-500">{{ formatNumber(tradeConversion.consumerGoods) }} CG/s</div>
          <div class="text-xs text-zinc-500">CG from Trade</div>
        </div>
      </div>
    </div>

    <!-- Upkeep Reduction -->
    <div v-if="hasUpkeep" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-2">
        <UIcon name="i-lucide-trending-down" class="text-lg text-green-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Upkeep Reduction</h3>
      </div>
      <div class="text-sm text-zinc-400">
        <span v-if="upkeepReduction > 0" class="text-green-400">-{{ upkeepReduction }}%</span>
        <span v-else class="text-zinc-500">No reductions active</span>
        <span class="text-zinc-600 ml-2">from research & prestige upgrades</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!hasUpkeep" class="rounded-lg bg-white/[0.03] border border-white/10 p-8 text-center">
      <UIcon name="i-lucide-gauge" class="text-3xl text-zinc-600 mb-2" />
      <p class="text-sm text-zinc-500">Build Consumer Goods factories to sustain your empire.</p>
      <p class="text-xs text-zinc-600 mt-1">Every pop consumes consumer goods — expand responsibly.</p>
    </div>
  </div>
</template>
