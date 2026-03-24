<script setup lang="ts">
const { state } = useGameState()
const { formatNumber } = useNumberFormat()
const {
  isResearching,
  activeResearchDef,
  researchProgress,
  getRepeatableResearchCost,
  cancelResearch
} = useResearchActions()

const { grossRpPerSecond } = usePlanets()
const { totalStarRp } = useGalaxy()

const totalRpPerSecond = computed(() => grossRpPerSecond.value + totalStarRp.value)

const activeResearchCost = computed(() => {
  const active = state.value.activeResearch
  if (!active || !activeResearchDef.value) return 0
  if (active.techId.startsWith('rep:')) {
    const repId = active.techId.slice(4)
    return getRepeatableResearchCost(repId)
  }
  const def = activeResearchDef.value as { researchCost: number }
  return def.researchCost ?? 0
})

const rpInvested = computed(() => state.value.activeResearch?.rpInvested ?? 0)
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
          <UIcon name="i-lucide-flask-conical" class="align-middle text-violet-400" />
          {{ formatNumber(rpInvested) }} / {{ formatNumber(activeResearchCost) }} RP
          <span class="text-zinc-500 ml-1">({{ formatNumber(totalRpPerSecond) }} RP/s)</span>
        </span>
        <span>
          {{ Math.round(researchProgress * 100) }}%
        </span>
      </div>
    </div>
  </div>
</template>
