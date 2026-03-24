<script setup lang="ts">
import type { ResearchDefinition } from '~/types/game'

const props = defineProps<{ tech: ResearchDefinition }>()

const { formatNumber } = useNumberFormat()
const {
  isResearchComplete,
  isResearchAvailable,
  isResearching,
  activeResearchDef,
  researchProgress,
  startResearch
} = useResearchActions()
const { researchTree } = useResearchConfig()
const { state } = useGameState()

const isComplete = computed(() => isResearchComplete(props.tech.id))
const isActive = computed(() => isResearching.value && activeResearchDef.value?.id === props.tech.id)
const isAvailable = computed(() => isResearchAvailable(props.tech.id))

const missingPrereqs = computed(() =>
  props.tech.prerequisites
    .filter(id => !isResearchComplete(id))
    .map(id => researchTree.find(r => r.id === id)?.name ?? id)
)

const rpInvested = computed(() => {
  if (!isActive.value) return 0
  return state.value.activeResearch?.rpInvested ?? 0
})

function effectLabel(effect: ResearchDefinition['effects'][number]): string {
  if (effect.type === 'multiplier') return `${effect.stat.replace(/Multiplier$/, '')} x${effect.value}`
  if (effect.type === 'researchSpeed') return `Research speed x${effect.value}`
  if (effect.type === 'unlockMegastructure') return `Unlocks megastructure`
  return ''
}
</script>

<template>
  <div
    class="rounded-lg border p-3 transition-all"
    :class="{
      'bg-green-950/20 border-green-500/30': isComplete,
      'bg-violet-950/20 border-violet-500/40 shadow-lg shadow-violet-500/10': isActive,
      'bg-white/[0.03] border-white/10': isAvailable && !isActive && !isComplete,
      'bg-white/[0.02] border-white/5 opacity-60': !isComplete && !isActive && !isAvailable,
    }"
  >
    <!-- Header row -->
    <div class="flex items-start gap-2">
      <UIcon
        :name="tech.icon"
        class="text-lg mt-0.5 shrink-0"
        :class="{
          'text-green-400': isComplete,
          'text-violet-400': isActive,
          'text-white': isAvailable && !isActive && !isComplete,
          'text-zinc-600': !isComplete && !isActive && !isAvailable,
        }"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="text-sm font-semibold"
            :class="isComplete ? 'text-green-300' : isActive ? 'text-violet-200' : isAvailable ? 'text-white' : 'text-zinc-500'"
          >
            {{ tech.name }}
          </span>
          <UBadge v-if="isComplete" color="success" variant="subtle" size="xs">Complete</UBadge>
          <UBadge v-else-if="isActive" color="secondary" variant="subtle" size="xs">Researching</UBadge>
          <UBadge v-else-if="!isAvailable" color="neutral" variant="subtle" size="xs">
            <UIcon name="i-lucide-lock" class="mr-0.5" />Locked
          </UBadge>
        </div>
        <p class="text-xs text-zinc-400 mt-0.5 line-clamp-2">{{ tech.description }}</p>
      </div>
    </div>

    <!-- Active: progress bar + RP invested info -->
    <template v-if="isActive">
      <div class="mt-3 space-y-1.5">
        <UProgress :value="researchProgress * 100" size="xs" color="secondary" />
        <div class="flex justify-between text-xs text-zinc-400">
          <span class="text-violet-300">
            <UIcon name="i-lucide-flask-conical" class="align-middle" />
            {{ formatNumber(rpInvested) }} / {{ formatNumber(tech.researchCost) }} RP
          </span>
          <span>{{ Math.round(researchProgress * 100) }}%</span>
        </div>
      </div>
    </template>

    <!-- Complete: show effects -->
    <template v-else-if="isComplete">
      <div class="mt-2 flex flex-wrap gap-1">
        <UBadge
          v-for="(effect, i) in tech.effects"
          :key="i"
          color="success"
          variant="subtle"
          size="xs"
        >
          {{ effectLabel(effect) }}
        </UBadge>
      </div>
    </template>

    <!-- Available: cost + research button -->
    <template v-else-if="isAvailable">
      <div class="mt-2 flex items-center justify-between gap-2">
        <div class="text-xs text-zinc-400">
          <UIcon name="i-lucide-flask-conical" class="align-middle text-violet-400" />
          {{ formatNumber(tech.researchCost) }} RP
        </div>
        <UButton
          size="xs"
          color="primary"
          :disabled="isResearching"
          @click="startResearch(tech.id)"
        >
          Research
        </UButton>
      </div>
    </template>

    <!-- Locked: missing prereqs -->
    <template v-else>
      <div class="mt-2 text-xs text-zinc-500">
        <span class="font-medium">Requires: </span>
        <span>{{ missingPrereqs.join(', ') }}</span>
      </div>
    </template>
  </div>
</template>
