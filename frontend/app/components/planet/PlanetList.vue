<script setup lang="ts">
const { state } = useGameState()
const { availablePlanets } = usePlanetActions()

const claimedSystems = computed(() =>
  state.value.systems.filter(s => s.status === 'claimed')
)

const totalPlanetCount = computed(() =>
  claimedSystems.value.reduce((n, s) => n + s.planets.length, 0)
)
</script>

<template>
  <div class="space-y-6">
    <!-- Debug: show planet count if empty -->
    <div v-if="totalPlanetCount === 0" class="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
      No planets found in game state. Try clearing your save and starting a new game.
    </div>

    <!-- Owned Planets -->
    <div v-if="totalPlanetCount > 0">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-globe" class="text-lg text-violet-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Your Planets</h2>
        <UBadge color="neutral" variant="subtle" size="xs">{{ totalPlanetCount }}</UBadge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <template v-for="(system, si) in claimedSystems" :key="system.id">
          <PlanetCard
            v-for="(planet, pi) in system.planets"
            :key="planet.definitionId ?? pi"
            :system-index="state.systems.indexOf(system)"
            :planet-index="pi"
          />
        </template>
      </div>
    </div>

    <!-- Colonize New Planets -->
    <div v-if="availablePlanets.length > 0">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-rocket" class="text-lg text-amber-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Available for Colonization</h2>
      </div>

      <div class="space-y-2">
        <PlanetColonizeCard
          v-for="planet in availablePlanets"
          :key="planet.id"
          :planet-def-id="planet.id"
        />
      </div>
    </div>
  </div>
</template>
