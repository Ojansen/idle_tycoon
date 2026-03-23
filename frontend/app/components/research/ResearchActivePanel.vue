<script setup lang="ts">
const { state } = useGameState()
const { formatNumber } = useNumberFormat()
const {
  isResearching,
  activeResearchDef,
  researchProgress,
  creditsDrainPerSecond,
  getResearchSpeedMultiplier,
  cancelResearch
} = useResearchActions()

const eta = computed(() => {
  if (!isResearching.value || !activeResearchDef.value) return 0
  const active = state.value.activeResearch!
  const def = activeResearchDef.value
  const remaining = ('researchTime' in def ? def.researchTime : def.baseResearchTime) - active.elapsed
  return Math.max(0, remaining / getResearchSpeedMultiplier())
})

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60)
    const s = Math.ceil(seconds % 60)
    return `${m}m ${s}s`
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.ceil((seconds % 3600) / 60)
  return `${h}h ${m}m`
}
</script>

<template>
  <div
    v-if="isResearching && activeResearchDef"
    class="rounded-lg bg-violet-950/20 border border-violet-500/30 p-4"
  >
    <div class="flex items-center justify-between gap-3">
      <!-- Left: icon + name + description -->
      <div class="flex items-center gap-3 min-w-0">
        <div class="rounded-lg bg-violet-500/10 p-2 shrink-0">
          <UIcon :name="activeResearchDef.icon" class="text-xl text-violet-400" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-white">{{ activeResearchDef.name }}</span>
            <UBadge color="secondary" variant="subtle" size="xs" class="animate-pulse">Active</UBadge>
          </div>
          <p class="text-xs text-zinc-400 truncate">{{ activeResearchDef.description }}</p>
        </div>
      </div>

      <!-- Right: cancel -->
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        class="shrink-0"
        @click="cancelResearch()"
      >
        Cancel
      </UButton>
    </div>

    <!-- Progress bar -->
    <div class="mt-3 space-y-1.5">
      <UProgress :value="researchProgress * 100" size="xs" color="secondary" />
      <div class="flex justify-between text-xs text-zinc-400">
        <span>
          <UIcon name="i-lucide-banknote" class="align-middle text-amber-400" />
          Draining ₢{{ formatNumber(creditsDrainPerSecond) }}/s
        </span>
        <span>
          {{ Math.round(researchProgress * 100) }}% — ETA
          <span class="text-violet-300 font-medium">{{ formatTime(eta) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
