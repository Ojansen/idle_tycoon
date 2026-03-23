<script setup lang="ts">
import { CurveType } from '@unovis/ts'

const { creditsPerSecond, energyPerSecond, state, getUpkeepMultiplier, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
const { totalEnergyUpkeep, effectiveCgProduction, totalCgConsumption, energyThrottle, cgThrottle, netEnergyPerSecond, hasUpkeep, getFullUpkeepReduction, empirePressure, totalBuildings } = useUpkeep()
const { tradeConversion, convertedTradeValue, conversionEfficiency, isTradeDisabled } = useTrade()
const { energyChartData, cgChartData, growthChartData } = useProductionHistory()
const { buildings } = useGameConfig()
const { megastructures } = useResearchConfig()
const { getAscensionMultiplier } = useAscensionPerks()
const { getResearchMultiplier } = useResearchActions()
const { formatNumber } = useNumberFormat()

const energyEffPct = computed(() => Math.round(energyThrottle.value * 100))
const cgEffPct = computed(() => Math.round(cgThrottle.value * 100))
const upkeepReduction = computed(() => {
  const reduction = getFullUpkeepReduction()
  return Math.round((1 - reduction) * 100)
})

const empirePressurePct = computed(() => Math.round((empirePressure.value - 1) * 100))

const energyCategories = {
  production: { name: 'Production', color: '#4ade80', label: 'Production' },
  upkeep: { name: 'Upkeep', color: '#f87171', label: 'Upkeep' }
}

const cgCategories = {
  production: { name: 'Production', color: '#4ade80', label: 'Production' },
  consumption: { name: 'Consumption', color: '#f87171', label: 'Consumption' }
}

const growthCategories = {
  energy: { name: 'Energy/s', color: '#fbbf24', label: 'Energy/s' },
  credits: { name: 'Credits/s', color: '#a78bfa', label: 'Credits/s' }
}

// Per-building upkeep breakdown
interface UpkeepEntry {
  name: string
  icon: string
  count: number
  energyUpkeep: number
  cgUpkeep: number
}

const buildingUpkeepBreakdown = computed(() => {
  const entries: UpkeepEntry[] = []

  const reduction = getFullUpkeepReduction()

  // CG buildings: show energy upkeep
  // All other buildings: show CG upkeep
  for (const b of buildings) {
    const owned = state.value.buildings[b.id] || 0
    if (owned === 0) continue
    if (!b.energyUpkeep && !b.cgUpkeep) continue

    const milestone = getUpkeepMultiplier(b.id)
    entries.push({
      name: b.name,
      icon: b.icon,
      count: owned,
      energyUpkeep: (b.energyUpkeep ?? 0) * owned * milestone * reduction,
      cgUpkeep: (b.cgUpkeep ?? 0) * owned * milestone * reduction
    })
  }

  // Megastructure upkeep (energy + credits + CG)
  for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
    if (!progress.completed) continue
    const def = megastructures.find(m => m.id === megaId)
    if (!def) continue
    if (!def.energyUpkeepPerSecond && !def.creditsUpkeepPerSecond && !def.cgUpkeepPerSecond) continue

    entries.push({
      name: def.name,
      icon: def.icon,
      count: 1,
      energyUpkeep: (def.energyUpkeepPerSecond ?? 0) * reduction,
      cgUpkeep: (def.cgUpkeepPerSecond ?? 0) * reduction
    })
  }

  // Sort by total upkeep descending
  entries.sort((a, b) => (b.energyUpkeep + b.cgUpkeep) - (a.energyUpkeep + a.cgUpkeep))

  return entries
})
</script>

<template>
  <div class="space-y-4">
    <!-- All-Time Growth -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-trending-up" class="text-lg text-emerald-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">All-Time Growth</h3>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-3 text-center">
        <div>
          <div class="text-sm font-bold text-amber-300">{{ formatNumber(energyPerSecond) }} TW/s</div>
          <div class="text-xs text-zinc-500">Energy Production</div>
        </div>
        <div>
          <div class="text-sm font-bold text-violet-300">₢{{ formatNumber(creditsPerSecond) }}/s</div>
          <div class="text-xs text-zinc-500">Credits Production</div>
        </div>
      </div>

      <div v-if="growthChartData.length >= 2" class="h-40 w-full">
        <AreaChart
          :data="growthChartData"
          :categories="growthCategories"
          x-label=""
          y-label=""
          :hide-x-axis="true"
          :hide-legend="false"
          :hide-tooltip="true"
          :duration="0"
          :height="160"
          :line-width="2"
          :curve-type="CurveType.MonotoneX"
        />
      </div>
      <div v-else class="h-40 flex items-center justify-center text-xs text-zinc-600">
        Collecting data...
      </div>
    </div>

    <!-- Energy Balance -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-zap" class="text-lg text-amber-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Energy Balance</h3>
        <UBadge v-if="energyThrottle < 1" size="xs" :color="energyEffPct >= 75 ? 'warning' : 'error'" variant="subtle">
          {{ energyEffPct }}% efficiency
        </UBadge>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-3 text-center">
        <div>
          <div class="text-sm font-bold text-emerald-400">{{ formatNumber(energyPerSecond) }} TW/s</div>
          <div class="text-xs text-zinc-500">Production</div>
        </div>
        <div>
          <div class="text-sm font-bold text-red-400">-{{ formatNumber(totalEnergyUpkeep) }} TW/s</div>
          <div class="text-xs text-zinc-500">Upkeep</div>
        </div>
        <div>
          <div class="text-sm font-bold" :class="netEnergyPerSecond >= 0 ? 'text-amber-300' : 'text-red-400'">
            {{ formatNumber(netEnergyPerSecond) }} TW/s
          </div>
          <div class="text-xs text-zinc-500">Net</div>
        </div>
      </div>

      <div v-if="energyChartData.length >= 2" class="h-32 w-full">
        <AreaChart
          :data="energyChartData"
          :categories="energyCategories"
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

      <p v-if="!isTradeDisabled && tradeConversion.consumerGoods > 0" class="text-xs text-violet-400/80">
        Trade contributing +{{ formatNumber(tradeConversion.consumerGoods) }} CG/s ({{ Math.round(conversionEfficiency * 100) }}% efficiency)
      </p>
      <p v-if="empirePressurePct > 0" class="text-xs text-amber-500/80">
        Empire scale pressure: +{{ empirePressurePct }}% CG demand ({{ totalBuildings }} buildings). Invest in efficiency research and prestige upgrades.
      </p>
      <p v-if="cgThrottle < 1" class="text-xs text-orange-400/80">
        CG deficit is throttling credit and pop production.
      </p>
      <p v-if="energyThrottle < 1" class="text-xs text-red-400/80">
        Energy deficit is reducing CG production. Build more energy generators.
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

    <!-- Top Consumers -->
    <div v-if="buildingUpkeepBreakdown.length > 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-list" class="text-lg text-zinc-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Top Consumers</h3>
      </div>

      <div class="space-y-1">
        <div
          v-for="entry in buildingUpkeepBreakdown.slice(0, 10)"
          :key="entry.name"
          class="flex items-center gap-2 py-1 text-sm"
        >
          <UIcon :name="entry.icon" class="text-base text-zinc-500 shrink-0" />
          <span class="text-zinc-300 flex-1 truncate">
            {{ entry.name }}
            <span v-if="entry.count > 1" class="text-zinc-600">×{{ entry.count }}</span>
          </span>
          <span v-if="entry.energyUpkeep > 0" class="text-red-400/70 text-xs tabular-nums">
            -{{ formatNumber(entry.energyUpkeep) }} TW/s
          </span>
          <span v-if="entry.cgUpkeep > 0" class="text-amber-600/70 text-xs tabular-nums">
            -{{ formatNumber(entry.cgUpkeep) }} CG/s
          </span>
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
      <p class="text-xs text-zinc-600 mt-1">Every building consumes consumer goods — expand responsibly.</p>
    </div>
  </div>
</template>
