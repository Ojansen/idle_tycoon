<script setup lang="ts">
import { CurveType } from '@unovis/ts'

const { creditsPerSecond, energyPerSecond, state, getBuildingMultiplier, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
const { totalEnergyUpkeep, totalCreditsUpkeep, creditThrottle, energyThrottle, netCreditsPerSecond, netEnergyPerSecond, hasUpkeep, getFullUpkeepReduction } = useUpkeep()
const { energyChartData, creditsChartData } = useProductionHistory()
const { buildings } = useGameConfig()
const { megastructures } = useResearchConfig()
const { getAscensionMultiplier } = useAscensionPerks()
const { getResearchMultiplier } = useResearchActions()
const { formatNumber } = useNumberFormat()

const energyEffPct = computed(() => Math.round(creditThrottle.value * 100))
const creditsEffPct = computed(() => Math.round(energyThrottle.value * 100))
const upkeepReduction = computed(() => {
  const reduction = getFullUpkeepReduction()
  return Math.round((1 - reduction) * 100)
})

const energyCategories = {
  production: { name: 'Production', color: '#4ade80', label: 'Production' },
  upkeep: { name: 'Upkeep', color: '#f87171', label: 'Upkeep' }
}

const creditsCategories = {
  production: { name: 'Production', color: '#a78bfa', label: 'Production' },
  upkeep: { name: 'Upkeep', color: '#f87171', label: 'Upkeep' }
}

// Per-building upkeep breakdown
interface UpkeepEntry {
  name: string
  icon: string
  count: number
  energyUpkeep: number
  creditsUpkeep: number
}

const buildingUpkeepBreakdown = computed(() => {
  const entries: UpkeepEntry[] = []

  // Get production multiplier stacks (same as useUpkeep uses)
  const energyMultStack = getPrestigeMultiplier('energyMultiplier')
    * getTraitMultiplier('energyMultiplier')
    * getAscensionMultiplier('energyMultiplier')
    * getRepeatableMultiplier('energyMultiplier')
    * getResearchMultiplier('energyMultiplier')
  const creditsMultStack = getPrestigeMultiplier('creditsMultiplier')
    * getTraitMultiplier('creditsMultiplier')
    * getAscensionMultiplier('creditsMultiplier')
    * getRepeatableMultiplier('creditsMultiplier')
    * getResearchMultiplier('creditsMultiplier')

  const reduction = getFullUpkeepReduction()

  for (const b of buildings) {
    const owned = state.value.buildings[b.id] || 0
    if (owned === 0) continue
    if (!b.energyUpkeep && !b.creditsUpkeep) continue

    const milestone = getBuildingMultiplier(b.id)
    entries.push({
      name: b.name,
      icon: b.icon,
      count: owned,
      energyUpkeep: (b.energyUpkeep ?? 0) * owned * milestone * energyMultStack * reduction,
      creditsUpkeep: (b.creditsUpkeep ?? 0) * owned * milestone * creditsMultStack * reduction
    })
  }

  // Megastructure upkeep
  for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
    if (!progress.completed) continue
    const def = megastructures.find(m => m.id === megaId)
    if (!def) continue
    if (!def.energyUpkeepPerSecond && !def.creditsUpkeepPerSecond) continue

    entries.push({
      name: def.name,
      icon: def.icon,
      count: 1,
      energyUpkeep: (def.energyUpkeepPerSecond ?? 0) * energyMultStack * reduction,
      creditsUpkeep: (def.creditsUpkeepPerSecond ?? 0) * creditsMultStack * reduction
    })
  }

  // Sort by total upkeep descending
  entries.sort((a, b) => (b.energyUpkeep + b.creditsUpkeep) - (a.energyUpkeep + a.creditsUpkeep))

  return entries
})
</script>

<template>
  <div class="space-y-4">
    <!-- Energy Balance -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-zap" class="text-lg text-amber-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Energy Balance</h3>
        <UBadge v-if="creditThrottle < 1" size="xs" :color="energyEffPct >= 75 ? 'warning' : 'error'" variant="subtle">
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

    <!-- Credits Balance -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-banknote" class="text-lg text-violet-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Credits Balance</h3>
        <UBadge v-if="energyThrottle < 1" size="xs" :color="creditsEffPct >= 75 ? 'warning' : 'error'" variant="subtle">
          {{ creditsEffPct }}% efficiency
        </UBadge>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-3 text-center">
        <div>
          <div class="text-sm font-bold text-emerald-400">₢{{ formatNumber(creditsPerSecond) }}/s</div>
          <div class="text-xs text-zinc-500">Production</div>
        </div>
        <div>
          <div class="text-sm font-bold text-red-400">-₢{{ formatNumber(totalCreditsUpkeep) }}/s</div>
          <div class="text-xs text-zinc-500">Upkeep</div>
        </div>
        <div>
          <div class="text-sm font-bold" :class="netCreditsPerSecond >= 0 ? 'text-violet-300' : 'text-red-400'">
            ₢{{ formatNumber(netCreditsPerSecond) }}/s
          </div>
          <div class="text-xs text-zinc-500">Net</div>
        </div>
      </div>

      <div v-if="creditsChartData.length >= 2" class="h-32 w-full">
        <AreaChart
          :data="creditsChartData"
          :categories="creditsCategories"
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
          <span v-if="entry.creditsUpkeep > 0" class="text-red-400/70 text-xs tabular-nums">
            -₢{{ formatNumber(entry.creditsUpkeep) }}/s
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
      <p class="text-sm text-zinc-500">Upkeep activates at Type II (Stellar) civilization.</p>
      <p class="text-xs text-zinc-600 mt-1">Build energy and credit buildings to reach 10<sup>14</sup> TW/s.</p>
    </div>
  </div>
</template>
