<script setup lang="ts">
import type { StarSystemState } from '~/types/galaxy'

const props = defineProps<{ systemIndex: number }>()

const { state } = useGameState()
const { getStarType, getSystemTrait } = useGalaxyConfig()
const { canStartSurvey, startSurvey, canClaimSystem, claimSystem, canColonizePlanet, colonizePlanet } = useGalaxyActions()
const { getPlanetType, getPlanetSize } = usePlanetConfig()
const { formatNumber } = useNumberFormat()

const system = computed(() => state.value.systems[props.systemIndex])

const starColorMap: Record<string, string> = {
  yellow: 'bg-yellow-500 shadow-yellow-500/50',
  red: 'bg-red-500 shadow-red-500/50',
  blue: 'bg-blue-500 shadow-blue-500/50',
  zinc: 'bg-zinc-400 shadow-zinc-400/50',
  violet: 'bg-violet-500 shadow-violet-500/50',
  amber: 'bg-amber-500 shadow-amber-500/50',
}

const borderMap: Record<string, string> = {
  undiscovered: 'border-zinc-700/50',
  surveyed: 'border-amber-500/30',
  claimed: 'border-emerald-500/30',
}

const totalStarCredits = computed(() => {
  if (!system.value) return 0
  return system.value.stars.reduce((s, star) => s + star.output.credits, 0)
})

const totalStarCg = computed(() => {
  if (!system.value) return 0
  return system.value.stars.reduce((s, star) => s + star.output.cg, 0)
})

const surveyPercent = computed(() => {
  if (!system.value || system.value.surveyTime <= 0) return 0
  return Math.min(100, Math.round((system.value.surveyProgress / system.value.surveyTime) * 100))
})

const isSurveying = computed(() => {
  return system.value?.status === 'undiscovered' && system.value.surveyProgress > 0
})

// Expanded state for claimed systems
const expanded = ref(false)
</script>

<template>
  <div v-if="system" class="rounded-xl overflow-hidden border" :class="borderMap[system.status]">
    <!-- Undiscovered system -->
    <div v-if="system.status === 'undiscovered'" class="p-4 bg-zinc-900/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500 text-sm">?</div>
          <div>
            <div class="text-sm font-medium text-zinc-400">Unknown System</div>
            <div class="text-[10px] text-zinc-600">Tier {{ system.tier }}</div>
          </div>
        </div>
        <div v-if="!isSurveying">
          <button
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            :class="canStartSurvey(systemIndex) ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'"
            :disabled="!canStartSurvey(systemIndex)"
            @click="startSurvey(systemIndex)"
          >
            Survey ₢{{ formatNumber(system.surveyCost) }}
          </button>
        </div>
        <div v-else class="text-right">
          <div class="text-[10px] text-amber-400">Surveying... {{ surveyPercent }}%</div>
          <div class="w-24 h-1 bg-zinc-800 rounded-full mt-1">
            <div class="h-full bg-amber-500 rounded-full transition-all" :style="{ width: surveyPercent + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Surveyed system (revealed but not claimed) -->
    <div v-else-if="system.status === 'surveyed'" class="bg-gradient-to-b from-amber-950/20 to-transparent">
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Star orbs -->
            <div class="flex -space-x-1">
              <div v-for="(star, i) in system.stars" :key="i"
                class="w-6 h-6 rounded-full shadow-md border border-zinc-900"
                :class="starColorMap[getStarType(star.type)?.color ?? 'zinc']"
              />
            </div>
            <div>
              <div class="text-sm font-bold text-white">{{ system.name }}</div>
              <div class="text-[10px] text-zinc-500">{{ system.stars.length }} star{{ system.stars.length > 1 ? 's' : '' }} · {{ system.planetSlots.length }} planet{{ system.planetSlots.length !== 1 ? 's' : '' }}</div>
            </div>
          </div>
          <button
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            :class="canClaimSystem(systemIndex) ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'"
            :disabled="!canClaimSystem(systemIndex)"
            @click="claimSystem(systemIndex)"
          >
            Claim ₢{{ formatNumber(system.claimCost) }}
          </button>
        </div>

        <!-- Star output preview -->
        <div class="flex gap-3 text-[10px]">
          <span v-if="totalStarCredits > 0" class="text-amber-400">+₢{{ formatNumber(totalStarCredits) }}/s</span>
          <span v-if="totalStarCg > 0" class="text-emerald-400">+{{ formatNumber(totalStarCg) }} CG/s</span>
        </div>

        <!-- Traits -->
        <div v-if="system.traits.length" class="flex gap-1">
          <span v-for="tid in system.traits" :key="tid" class="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/50 text-violet-300">
            {{ getSystemTrait(tid)?.name ?? tid }}
          </span>
        </div>
      </div>
    </div>

    <!-- Claimed system -->
    <div v-else class="bg-gradient-to-b from-emerald-950/15 to-transparent">
      <div class="p-4">
        <button class="w-full flex items-center justify-between" @click="expanded = !expanded">
          <div class="flex items-center gap-3">
            <!-- Star orbs -->
            <div class="flex -space-x-1">
              <div v-for="(star, i) in system.stars" :key="i"
                class="w-5 h-5 rounded-full shadow-md border border-zinc-900"
                :class="starColorMap[getStarType(star.type)?.color ?? 'zinc']"
              />
            </div>
            <div class="text-left">
              <div class="text-sm font-bold text-white">{{ system.name }}</div>
              <div class="text-[10px] text-zinc-500">
                {{ system.stars.length }} star{{ system.stars.length > 1 ? 's' : '' }}
                · {{ system.planets.length }}/{{ system.planetSlots.length }} colonized
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right text-[10px]">
              <span v-if="totalStarCredits > 0" class="text-amber-400">+₢{{ formatNumber(totalStarCredits) }}/s</span>
              <span v-if="totalStarCg > 0" class="ml-2 text-emerald-400">+{{ formatNumber(totalStarCg) }} CG/s</span>
            </div>
            <span class="text-zinc-500 text-xs">{{ expanded ? '▲' : '▼' }}</span>
          </div>
        </button>
      </div>

      <!-- Expanded: planets -->
      <div v-if="expanded" class="px-4 pb-4 space-y-3">
        <!-- Colonized planets -->
        <PlanetCard
          v-for="(_, pi) in system.planets"
          :key="pi"
          :system-index="systemIndex"
          :planet-index="pi"
        />

        <!-- Uncolonized planet slots -->
        <div v-for="(slot, si) in system.planetSlots.filter(s => !s.colonized)" :key="si"
          class="flex items-center justify-between border border-dashed border-zinc-700 rounded-lg p-3"
        >
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full"
              :class="'bg-' + (getPlanetType(slot.type)?.color ?? 'zinc') + '-500/50'"
            />
            <div>
              <div class="text-xs text-zinc-300">{{ slot.name }}</div>
              <div class="text-[10px] text-zinc-600">{{ getPlanetType(slot.type)?.name ?? slot.type }} · {{ slot.size }}</div>
            </div>
          </div>
          <button
            class="text-xs px-2 py-1 rounded transition-colors"
            :class="canColonizePlanet(systemIndex, system.planetSlots.indexOf(slot)) ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'"
            :disabled="!canColonizePlanet(systemIndex, system.planetSlots.indexOf(slot))"
            @click="colonizePlanet(systemIndex, system.planetSlots.indexOf(slot))"
          >
            Colonize ₢{{ formatNumber(slot.colonyCost) }}
          </button>
        </div>

        <!-- Traits -->
        <div v-if="system.traits.length" class="flex gap-1">
          <span v-for="tid in system.traits" :key="tid" class="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/50 text-violet-300">
            {{ getSystemTrait(tid)?.name ?? tid }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
