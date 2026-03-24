<script setup lang="ts">
const { state } = useGameState()
const { totalPops, totalDivisionLevels } = usePlanets()
const { formatNumber } = useNumberFormat()

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-bar-chart-3" class="text-xl text-violet-400" />
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Statistics</h2>
    </div>

    <!-- Stats summary -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <div class="text-zinc-500">Total Credits Earned</div>
          <div class="text-white font-medium">₢{{ formatNumber(state.totalCreditsEarned) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Prestige Count</div>
          <div class="text-white font-medium">{{ state.prestigeCount }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Influence</div>
          <div class="text-amber-400 font-medium">{{ state.influence }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Kardashev Record</div>
          <div class="text-white font-medium">Type {{ state.kardashevHighWaterMark }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Total Planets</div>
          <div class="text-white font-medium">{{ state.systems.filter(s => s.status === 'claimed').reduce((n, s) => n + s.planets.length, 0) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Total Pops</div>
          <div class="text-white font-medium">{{ formatNumber(totalPops) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Total Division Levels</div>
          <div class="text-white font-medium">{{ formatNumber(totalDivisionLevels) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Run Time</div>
          <div class="text-white font-medium">{{ formatTime(state.runPlayTime) }}</div>
        </div>
        <div>
          <div class="text-zinc-500">Total Play Time</div>
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
