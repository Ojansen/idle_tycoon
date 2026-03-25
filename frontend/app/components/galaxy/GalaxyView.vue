<script setup lang="ts">
const { state } = useGameState()
const { claimedSystems, surveyedSystems, undiscoveredSystems, canStartSurvey, startSurvey, canClaimSystem, claimSystem, canColonizePlanet, colonizePlanet } = useGalaxyActions()
const { totalStarCredits, totalStarCg, totalSystemMaintenance, claimedSystemCount, totalStarCount, allPlanets, frontierIds } = useGalaxy()
const { getStarType } = useGalaxyConfig()
const { formatNumber } = useNumberFormat()

const selectedSystemIndex = ref<number | null>(null)
const selectedSystem = computed(() => {
  if (selectedSystemIndex.value === null) return null
  return state.value.systems[selectedSystemIndex.value] ?? null
})

function onSelectSystem(index: number) {
  selectedSystemIndex.value = index
}

function doSurvey() {
  if (selectedSystemIndex.value !== null && canStartSurvey(selectedSystemIndex.value)) {
    startSurvey(selectedSystemIndex.value)
  }
}

function doClaim() {
  if (selectedSystemIndex.value !== null && canClaimSystem(selectedSystemIndex.value)) {
    claimSystem(selectedSystemIndex.value)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Galaxy Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-2">
        <div class="text-sm font-bold text-violet-400">{{ claimedSystemCount }}</div>
        <div class="text-[10px] text-zinc-500">Systems</div>
      </div>
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-2">
        <div class="text-sm font-bold text-yellow-400">{{ totalStarCount }}</div>
        <div class="text-[10px] text-zinc-500">Stars</div>
      </div>
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-2">
        <div class="text-sm font-bold text-amber-400">+₢{{ formatNumber(totalStarCredits) }}/s</div>
        <div class="text-[10px] text-zinc-500">Star Income</div>
      </div>
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-2">
        <div class="text-sm font-bold text-emerald-400">{{ allPlanets.length }}</div>
        <div class="text-[10px] text-zinc-500">Colonies</div>
      </div>
    </div>

    <!-- Galaxy Map -->
    <GalaxyMap @select-system="onSelectSystem" />

    <!-- Selected System Detail -->
    <div v-if="selectedSystem" class="rounded-xl border p-4 space-y-3"
      :class="selectedSystem.status === 'claimed' ? 'border-emerald-500/30 bg-emerald-950/10'
        : selectedSystem.status === 'surveyed' ? 'border-amber-500/30 bg-amber-950/10'
        : 'border-indigo-500/30 bg-indigo-950/10'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-white">
            {{ selectedSystem.status === 'undiscovered' ? 'Unknown System' : selectedSystem.name }}
          </div>
          <div class="text-[10px] text-zinc-500">Tier {{ selectedSystem.tier }} · {{ selectedSystem.edges.length }} connection{{ selectedSystem.edges.length !== 1 ? 's' : '' }}</div>
        </div>

        <!-- Actions -->
        <div>
          <button v-if="selectedSystem.status === 'undiscovered' && frontierIds.includes(selectedSystem.id) && selectedSystem.surveyProgress === 0"
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            :class="canStartSurvey(selectedSystemIndex!) ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-zinc-800 text-zinc-600'"
            :disabled="!canStartSurvey(selectedSystemIndex!)"
            @click="doSurvey"
          >
            Survey ₢{{ formatNumber(selectedSystem.surveyCost) }}
          </button>
          <div v-else-if="selectedSystem.status === 'undiscovered' && selectedSystem.surveyProgress > 0"
            class="text-xs text-amber-400"
          >
            Surveying... {{ Math.round((selectedSystem.surveyProgress / selectedSystem.surveyTime) * 100) }}%
          </div>
          <button v-else-if="selectedSystem.status === 'surveyed'"
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            :class="canClaimSystem(selectedSystemIndex!) ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-zinc-800 text-zinc-600'"
            :disabled="!canClaimSystem(selectedSystemIndex!)"
            @click="doClaim"
          >
            Claim ₢{{ formatNumber(selectedSystem.claimCost) }}
          </button>
          <span v-else-if="selectedSystem.status === 'claimed'" class="text-xs text-emerald-400">Your Territory</span>
        </div>
      </div>

      <!-- Revealed info (surveyed or claimed) -->
      <template v-if="selectedSystem.status !== 'undiscovered'">
        <!-- Stars -->
        <div class="flex flex-wrap gap-2">
          <div v-for="(star, i) in selectedSystem.stars" :key="i"
            class="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-[10px]"
          >
            <div class="w-3 h-3 rounded-full"
              :class="'bg-' + (getStarType(star.type)?.color ?? 'zinc') + '-500'"
            />
            <span class="text-zinc-300">{{ getStarType(star.type)?.name ?? star.type }}</span>
            <span v-if="star.output.credits > 0" class="text-amber-400">+₢{{ formatNumber(star.output.credits) }}</span>
            <span v-if="star.output.cg > 0" class="text-emerald-400">+{{ formatNumber(star.output.cg) }}CG</span>
            <span v-if="star.output.rp > 0" class="text-purple-400">+{{ formatNumber(star.output.rp) }}RP</span>
          </div>
        </div>

        <!-- Planets -->
        <div v-if="selectedSystem.planetSlots.length > 0" class="space-y-1">
          <div v-for="(slot, i) in selectedSystem.planetSlots" :key="i"
            class="flex items-center justify-between text-xs px-2 py-1 rounded bg-white/[0.03]"
          >
            <div class="flex items-center gap-2">
              <span class="text-zinc-300">{{ slot.name }}</span>
              <span class="text-[10px] text-zinc-600">{{ slot.type }} · {{ slot.size }}</span>
            </div>
            <span v-if="slot.colonized" class="text-emerald-400 text-[10px]">Colonized</span>
            <button v-else
              class="text-[10px] px-2 py-0.5 rounded transition-colors"
              :class="selectedSystemIndex !== null && canColonizePlanet(selectedSystemIndex, selectedSystem!.planetSlots.indexOf(slot))
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-zinc-800 text-zinc-600'"
              :disabled="selectedSystemIndex === null || !canColonizePlanet(selectedSystemIndex, selectedSystem!.planetSlots.indexOf(slot))"
              @click="selectedSystemIndex !== null && colonizePlanet(selectedSystemIndex, selectedSystem!.planetSlots.indexOf(slot))"
            >
              Colonize ₢{{ formatNumber(slot.colonyCost) }}
            </button>
          </div>
        </div>
        <div v-else class="text-[10px] text-zinc-600">No planets in this system</div>

        <!-- Traits -->
        <div v-if="selectedSystem.traits.length > 0" class="flex gap-1">
          <span v-for="tid in selectedSystem.traits" :key="tid"
            class="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/50 text-violet-300"
          >
            {{ tid }}
          </span>
        </div>
      </template>

      <!-- Fog info -->
      <div v-else-if="!frontierIds.includes(selectedSystem.id)" class="text-[10px] text-zinc-600">
        Not adjacent to your territory. Expand to reach this system.
      </div>
    </div>

    <!-- Colonized planets (below map) -->
    <div v-if="allPlanets.length > 0">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">Your Colonies</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlanetCard
          v-for="p in allPlanets"
          :key="p.planet.definitionId"
          :system-index="p.systemIndex"
          :planet-index="p.planetIndex"
        />
      </div>
    </div>
  </div>
</template>
