<script setup lang="ts">
const { state } = useGameState()
const { claimedSystems, surveyedSystems, undiscoveredSystems } = useGalaxyActions()
const { totalStarCredits, totalStarCg, totalSystemMaintenance, claimedSystemCount, totalStarCount, allPlanets } = useGalaxy()
const { getStarType } = useGalaxyConfig()
const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="space-y-6">
    <!-- Galaxy Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-3">
        <div class="text-sm font-bold text-violet-400">{{ claimedSystemCount }}</div>
        <div class="text-[10px] text-zinc-500">Systems</div>
      </div>
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-3">
        <div class="text-sm font-bold text-yellow-400">{{ totalStarCount }}</div>
        <div class="text-[10px] text-zinc-500">Stars</div>
      </div>
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-3">
        <div class="text-sm font-bold text-amber-400">+₢{{ formatNumber(totalStarCredits) }}/s</div>
        <div class="text-[10px] text-zinc-500">Star Income</div>
      </div>
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-3">
        <div class="text-sm font-bold text-red-400">-₢{{ formatNumber(totalSystemMaintenance) }}/s</div>
        <div class="text-[10px] text-zinc-500">Maintenance</div>
      </div>
    </div>

    <!-- Frontier: discovered + surveyed systems -->
    <div v-if="undiscoveredSystems.length > 0 || surveyedSystems.length > 0">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">Frontier</h2>
      <div class="space-y-2">
        <GalaxySystemCard
          v-for="s in [...surveyedSystems, ...undiscoveredSystems]"
          :key="s.system.id"
          :system-index="s.index"
        />
      </div>
    </div>

    <!-- Stars: passive income, grouped by system -->
    <div v-if="claimedSystems.length > 0">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-3">Star Holdings</h2>
      <div class="space-y-1.5">
        <div v-for="s in claimedSystems" :key="s.system.id"
          class="flex items-center justify-between rounded-lg bg-white/[0.03] border border-yellow-900/30 px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <div class="flex -space-x-1">
              <div v-for="(star, i) in s.system.stars" :key="i"
                class="w-4 h-4 rounded-full shadow-sm border border-zinc-900"
                :class="'bg-' + (getStarType(star.type)?.color ?? 'zinc') + '-500'"
              />
            </div>
            <span class="text-xs text-zinc-300">{{ s.system.name }}</span>
            <span class="text-[10px] text-zinc-600">{{ s.system.stars.length }} star{{ s.system.stars.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="flex gap-3 text-[10px]">
            <span v-if="s.system.stars.reduce((n, st) => n + st.output.credits, 0) > 0" class="text-amber-400">
              +₢{{ formatNumber(s.system.stars.reduce((n, st) => n + st.output.credits, 0)) }}/s
            </span>
            <span v-if="s.system.stars.reduce((n, st) => n + st.output.cg, 0) > 0" class="text-emerald-400">
              +{{ formatNumber(s.system.stars.reduce((n, st) => n + st.output.cg, 0)) }} CG/s
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Planets: active management -->
    <div v-if="allPlanets.length > 0">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
        Your Colonies ({{ allPlanets.length }})
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlanetCard
          v-for="p in allPlanets"
          :key="p.planet.definitionId"
          :system-index="p.systemIndex"
          :planet-index="p.planetIndex"
        />
      </div>
    </div>

    <!-- Uncolonized planets in claimed systems -->
    <div v-if="claimedSystems.some(s => s.system.planetSlots.some(ps => !ps.colonized))">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Available for Colonization</h2>
      <div class="space-y-2">
        <template v-for="s in claimedSystems" :key="s.system.id">
          <div v-for="(slot, si) in s.system.planetSlots.filter(ps => !ps.colonized)" :key="si"
            class="flex items-center justify-between border border-dashed border-zinc-700 rounded-lg p-3"
          >
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-zinc-700" />
              <div>
                <div class="text-xs text-zinc-300">{{ slot.name }}</div>
                <div class="text-[10px] text-zinc-600">{{ slot.type }} · {{ slot.size }} · {{ s.system.name }}</div>
              </div>
            </div>
            <button
              class="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
              @click="useGalaxyActions().colonizePlanet(s.index, s.system.planetSlots.indexOf(slot))"
            >
              Colonize ₢{{ formatNumber(slot.colonyCost) }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
