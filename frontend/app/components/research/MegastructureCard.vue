<script setup lang="ts">
import type { MegastructureDefinition, ResearchEffect } from '~/types/game'

const props = defineProps<{ mega: MegastructureDefinition }>()

const { state } = useGameState()
const { formatNumber } = useNumberFormat()
const { getMegastructureState, startMegastructure, startNextMegastructureStage } = useResearchActions()
const { researchTree } = useResearchConfig()

const megaState = computed(() => getMegastructureState(props.mega.id))
const progress = computed(() => state.value.megastructures[props.mega.id] ?? null)

const stageProgress = computed(() => {
  const p = progress.value
  if (!p || p.stageElapsed < 0) return 0
  return Math.min(p.stageElapsed / props.mega.buildTimePerStage, 1)
})

const currentStageDisplay = computed(() => {
  const p = progress.value
  if (!p) return 1
  return p.currentStage + 1
})

const nextStageNumber = computed(() => {
  const p = progress.value
  if (!p) return 1
  return p.currentStage + 1
})

const missingResearch = computed(() =>
  props.mega.requiredResearch
    .filter(id => !state.value.completedResearch.includes(id))
    .map(id => researchTree.find(r => r.id === id)?.name ?? id)
)

function effectLabel(effect: ResearchEffect): string {
  if (effect.type === 'multiplier') return `${effect.stat.replace(/Multiplier$/, '')} x${effect.value}`
  if (effect.type === 'researchSpeed') return `Research speed x${effect.value}`
  if (effect.type === 'unlockMegastructure') return `Unlocks megastructure`
  return ''
}

const hasMegaUpkeep = computed(() => (props.mega.energyUpkeepPerSecond ?? 0) > 0 || (props.mega.creditsUpkeepPerSecond ?? 0) > 0 || (props.mega.cgUpkeepPerSecond ?? 0) > 0)

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

const canAfford = computed(() =>
  state.value.credits >= props.mega.creditsCostPerStage &&
  state.value.energy >= props.mega.energyCostPerStage
)
</script>

<template>
  <div
    class="rounded-lg border p-4 transition-all"
    :class="{
      'bg-green-950/20 border-green-500/30 shadow-lg shadow-green-500/5': megaState === 'complete',
      'bg-amber-950/10 border-amber-500/20': megaState === 'building' || megaState === 'awaiting_stage',
      'bg-white/[0.03] border-white/10': megaState === 'available',
      'bg-white/[0.02] border-white/5 opacity-60': megaState === 'locked',
    }"
  >
    <!-- Header -->
    <div class="flex items-start gap-3">
      <div
        class="rounded-lg p-2 shrink-0"
        :class="{
          'bg-green-500/10': megaState === 'complete',
          'bg-amber-500/10': megaState === 'building' || megaState === 'awaiting_stage' || megaState === 'available',
          'bg-white/5': megaState === 'locked',
        }"
      >
        <UIcon
          :name="mega.icon"
          class="text-xl"
          :class="{
            'text-green-400': megaState === 'complete',
            'text-amber-400': megaState !== 'complete' && megaState !== 'locked',
            'text-zinc-600': megaState === 'locked',
          }"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="text-sm font-bold"
            :class="{
              'text-green-300': megaState === 'complete',
              'text-white': megaState !== 'complete' && megaState !== 'locked',
              'text-zinc-500': megaState === 'locked',
            }"
          >
            {{ mega.name }}
          </span>
          <UBadge v-if="megaState === 'complete'" color="success" variant="subtle" size="xs">Complete</UBadge>
          <UBadge v-else-if="megaState === 'building'" color="warning" variant="subtle" size="xs">Building</UBadge>
          <UBadge v-else-if="megaState === 'awaiting_stage'" color="warning" variant="subtle" size="xs">Stage Ready</UBadge>
          <UBadge v-else-if="megaState === 'locked'" color="neutral" variant="subtle" size="xs">
            <UIcon name="i-lucide-lock" class="mr-0.5" />Locked
          </UBadge>
        </div>
        <p class="text-xs text-zinc-400 mt-0.5">{{ mega.description }}</p>
      </div>
    </div>

    <!-- Complete: show effects and ongoing upkeep -->
    <template v-if="megaState === 'complete'">
      <div class="mt-3 flex flex-wrap gap-1.5">
        <UBadge
          v-for="(effect, i) in mega.effects"
          :key="i"
          color="success"
          variant="subtle"
          size="xs"
        >
          {{ effectLabel(effect) }}
        </UBadge>
      </div>
      <div v-if="hasMegaUpkeep" class="mt-2 text-xs text-red-400/70">
        Ongoing:
        <span v-if="mega.energyUpkeepPerSecond">{{ formatNumber(mega.energyUpkeepPerSecond) }} TW/s</span>
        <span v-if="mega.energyUpkeepPerSecond && mega.creditsUpkeepPerSecond"> + </span>
        <span v-if="mega.creditsUpkeepPerSecond">₢{{ formatNumber(mega.creditsUpkeepPerSecond) }}/s</span>
        <span v-if="mega.cgUpkeepPerSecond && (mega.energyUpkeepPerSecond || mega.creditsUpkeepPerSecond)"> + </span>
        <span v-if="mega.cgUpkeepPerSecond">{{ formatNumber(mega.cgUpkeepPerSecond) }} CG/s</span>
      </div>
    </template>

    <!-- Building: stage progress bar -->
    <template v-else-if="megaState === 'building'">
      <div class="mt-3 space-y-1.5">
        <div class="flex justify-between text-xs text-zinc-400">
          <span>Stage {{ currentStageDisplay }} / {{ mega.stages }}</span>
          <span>{{ formatTime(mega.buildTimePerStage * (1 - stageProgress)) }} remaining</span>
        </div>
        <UProgress :value="stageProgress * 100" size="xs" color="warning" />
      </div>
    </template>

    <!-- Awaiting next stage: build button -->
    <template v-else-if="megaState === 'awaiting_stage'">
      <div class="mt-3 space-y-2">
        <div class="text-xs text-zinc-400">
          Stage {{ nextStageNumber - 1 }} complete. Ready to begin stage {{ nextStageNumber }} / {{ mega.stages }}.
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="text-xs text-zinc-400 space-x-2">
            <span><UIcon name="i-lucide-coins" class="align-middle text-amber-400" /> ₢{{ formatNumber(mega.creditsCostPerStage) }}</span>
            <span><UIcon name="i-lucide-zap" class="align-middle text-amber-300" /> {{ formatNumber(mega.energyCostPerStage) }} TW</span>
          </div>
          <UButton
            size="xs"
            color="warning"
            :disabled="!canAfford"
            @click="startNextMegastructureStage(mega.id)"
          >
            Build Stage {{ nextStageNumber }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- Available: begin construction -->
    <template v-else-if="megaState === 'available'">
      <div class="mt-3 space-y-2">
        <div class="text-xs text-zinc-400">
          {{ mega.stages }}-stage project — {{ formatTime(mega.buildTimePerStage) }} per stage
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="text-xs text-zinc-400 space-x-2">
            <span><UIcon name="i-lucide-coins" class="align-middle text-amber-400" /> ₢{{ formatNumber(mega.creditsCostPerStage) }}/stage</span>
            <span><UIcon name="i-lucide-zap" class="align-middle text-amber-300" /> {{ formatNumber(mega.energyCostPerStage) }} TW/stage</span>
          </div>
          <UButton
            size="xs"
            color="warning"
            :disabled="!canAfford"
            @click="startMegastructure(mega.id)"
          >
            Begin Construction
          </UButton>
        </div>
      </div>
    </template>

    <!-- Locked: show missing research -->
    <template v-else>
      <div class="mt-2 text-xs text-zinc-500">
        <span class="font-medium">Requires: </span>
        <span>{{ missingResearch.join(', ') }}</span>
      </div>
    </template>
  </div>
</template>
