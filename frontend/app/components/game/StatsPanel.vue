<script setup lang="ts">
const { state } = useGameState()
const { totalPops, totalDivisionLevels, grossCreditsPerSecond, grossRpPerSecond } = usePlanets()
const { netCreditsPerSecond, effectiveCgProduction, totalCgConsumption, cgThrottle, empireSize, adminCap, sprawlPenalty, totalMaintenanceWithSprawl, getFullUpkeepReduction } = useUpkeep()
const { tradeConversion } = useTrade()
const { totalStarCredits, totalStarRp, claimedSystemCount } = useGalaxy()
const { researchTree, megastructures } = useResearchConfig()
const { isResearching, activeResearchDef, researchProgress, getResearchSpeedMultiplier } = useResearchActions()
const { formatNumber } = useNumberFormat()

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const colonizedPlanetCount = computed(() =>
  (state.value.systems ?? []).reduce((n, s) => n + (s.status === 'claimed' ? s.planets.length : 0), 0)
)

const completedMegaCount = computed(() =>
  Object.values(state.value.megastructures).filter(m => m.completed).length
)

const sprawlPct = computed(() => Math.round((sprawlPenalty.value - 1) * 100))
const upkeepReductionPct = computed(() => Math.round((1 - getFullUpkeepReduction()) * 100))
const cgEffPct = computed(() => Math.round(cgThrottle.value * 100))
const researchSpeedMult = computed(() => getResearchSpeedMultiplier())
const completedResearchCount = computed(() => state.value.completedResearch.length)
const totalResearchCount = computed(() => researchTree.length)
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-activity" class="text-xl text-violet-400" />
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Empire Overview</h2>
    </div>

    <!-- Credit flow -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-banknote" class="text-base text-emerald-400" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Credit Flow</h3>
        <span class="ml-auto text-sm font-bold" :class="netCreditsPerSecond >= 0 ? 'text-emerald-400' : 'text-red-400'">
          {{ netCreditsPerSecond >= 0 ? '+' : '' }}₢{{ formatNumber(netCreditsPerSecond) }}/s
        </span>
      </div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-zinc-500">Planet production</span>
          <span class="text-zinc-300">+₢{{ formatNumber(grossCreditsPerSecond) }}/s</span>
        </div>
        <div v-if="totalStarCredits > 0" class="flex justify-between">
          <span class="text-zinc-500">Star bonuses</span>
          <span class="text-zinc-300">+₢{{ formatNumber(totalStarCredits) }}/s</span>
        </div>
        <div v-if="tradeConversion.credits > 0" class="flex justify-between">
          <span class="text-zinc-500">Trade income</span>
          <span class="text-zinc-300">+₢{{ formatNumber(tradeConversion.credits) }}/s</span>
        </div>
        <div v-if="cgThrottle < 1" class="flex justify-between">
          <span class="text-zinc-500">CG efficiency</span>
          <span class="text-zinc-300">{{ cgEffPct }}%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Maintenance</span>
          <span class="text-zinc-300">-₢{{ formatNumber(totalMaintenanceWithSprawl) }}/s</span>
        </div>
      </div>
    </div>

    <!-- Consumer Goods flow -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-package" class="text-base text-amber-500" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Consumer Goods</h3>
        <span class="ml-auto text-sm font-bold" :class="effectiveCgProduction >= totalCgConsumption ? 'text-zinc-300' : 'text-red-400'">
          {{ effectiveCgProduction >= totalCgConsumption ? '+' : '' }}{{ formatNumber(effectiveCgProduction - totalCgConsumption) }}/s
        </span>
      </div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-zinc-500">Production</span>
          <span class="text-zinc-300">+{{ formatNumber(effectiveCgProduction) }}/s</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Consumption</span>
          <span class="text-zinc-300">-{{ formatNumber(totalCgConsumption) }}/s</span>
        </div>
        <div v-if="cgThrottle < 1" class="flex justify-between">
          <span class="text-zinc-500">Throttle on production</span>
          <span class="text-zinc-300">{{ cgEffPct }}%</span>
        </div>
      </div>
    </div>

    <!-- Empire Sprawl -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-expand" class="text-base text-cyan-400" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Empire Sprawl</h3>
        <span class="ml-auto text-sm font-bold text-zinc-300">
          {{ empireSize }} / {{ adminCap }}
        </span>
      </div>
      <UProgress
        :model-value="Math.min(empireSize / adminCap * 100, 100)"
        size="xs"
        color="primary"
        class="mb-2"
      />
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-zinc-500">Planets ({{ colonizedPlanetCount }})</span>
          <span class="text-zinc-300">{{ colonizedPlanetCount * 10 }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Division levels ({{ formatNumber(totalDivisionLevels) }})</span>
          <span class="text-zinc-300">{{ formatNumber(totalDivisionLevels * 0.5) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Pops ({{ formatNumber(totalPops) }})</span>
          <span class="text-zinc-300">{{ Math.floor(totalPops / 100) }}</span>
        </div>
        <div v-if="completedMegaCount > 0" class="flex justify-between">
          <span class="text-zinc-500">Megastructures ({{ completedMegaCount }})</span>
          <span class="text-zinc-300">{{ completedMegaCount * 5 }}</span>
        </div>
        <div class="flex justify-between border-t border-white/5 pt-1 mt-1">
          <span class="text-zinc-500">Cost penalty</span>
          <span class="text-zinc-300">+{{ sprawlPct }}%</span>
        </div>
        <div v-if="upkeepReductionPct > 0" class="flex justify-between">
          <span class="text-zinc-500">Upkeep reduction</span>
          <span class="text-zinc-300">-{{ upkeepReductionPct }}%</span>
        </div>
      </div>
    </div>

    <!-- Research -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-flask-conical" class="text-base text-purple-400" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Research</h3>
        <span class="ml-auto text-xs text-zinc-400">{{ completedResearchCount }}/{{ totalResearchCount }}</span>
      </div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-zinc-500">RP from planets</span>
          <span class="text-zinc-300">{{ formatNumber(grossRpPerSecond) }}/s</span>
        </div>
        <div v-if="totalStarRp > 0" class="flex justify-between">
          <span class="text-zinc-500">RP from stars</span>
          <span class="text-zinc-300">{{ formatNumber(totalStarRp) }}/s</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Speed multiplier</span>
          <span class="text-zinc-300">{{ researchSpeedMult.toFixed(2) }}x</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Sprawl slowdown</span>
          <span class="text-zinc-300">{{ sprawlPenalty.toFixed(2) }}x</span>
        </div>
        <div class="flex justify-between border-t border-white/5 pt-1 mt-1">
          <span class="text-zinc-500">Effective RP/s</span>
          <span class="text-zinc-300">{{ formatNumber((grossRpPerSecond + totalStarRp) * researchSpeedMult / sprawlPenalty) }}/s</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">RP stockpile</span>
          <span class="text-zinc-300">{{ formatNumber(state.researchPoints) }}</span>
        </div>
        <div v-if="isResearching && activeResearchDef" class="border-t border-white/5 pt-2 mt-2">
          <div class="flex justify-between mb-1">
            <span class="text-zinc-400">{{ (activeResearchDef as any).name }}</span>
            <span class="text-zinc-300">{{ Math.round(researchProgress * 100) }}%</span>
          </div>
          <UProgress :model-value="researchProgress * 100" size="xs" color="secondary" />
        </div>
        <div v-else-if="completedResearchCount < totalResearchCount" class="border-t border-white/5 pt-2 mt-2 text-zinc-500 italic">
          Idle
        </div>
      </div>
    </div>

    <!-- Megastructures -->
    <div v-if="Object.keys(state.megastructures).length > 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-hexagon" class="text-base text-amber-400" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Megastructures</h3>
        <span class="ml-auto text-xs text-zinc-400">{{ completedMegaCount }}/{{ megastructures.length }}</span>
      </div>
      <div class="space-y-1 text-xs">
        <div
          v-for="mega in megastructures.filter(m => m.id in state.megastructures)"
          :key="mega.id"
          class="flex justify-between"
        >
          <span class="text-zinc-400">{{ mega.name }}</span>
          <UBadge
            v-if="state.megastructures[mega.id]?.completed"
            color="success" variant="subtle" size="xs"
          >
            Complete
          </UBadge>
          <span v-else class="text-zinc-400">
            Stage {{ state.megastructures[mega.id]?.currentStage }}/{{ mega.stages }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empire summary -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-crown" class="text-base text-zinc-400" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Empire</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <div class="text-zinc-500">Systems</div>
          <div class="text-white font-medium">{{ claimedSystemCount }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Planets</div>
          <div class="text-white font-medium">{{ colonizedPlanetCount }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Pops</div>
          <div class="text-white font-medium">{{ formatNumber(totalPops) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Credits Earned</div>
          <div class="text-white font-medium">₢{{ formatNumber(state.totalCreditsEarned) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Balance</div>
          <div class="text-white font-medium">₢{{ formatNumber(state.credits) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Play Time</div>
          <div class="text-white font-medium">{{ formatTime(state.totalPlayTime) }}</div>
        </div>
      </div>
    </div>

    <!-- Multiplier breakdown -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5">
      <GameMultiplierBreakdown />
    </div>

    <!-- Achievements -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5">
      <GameAchievementGrid />
    </div>
  </div>
</template>
