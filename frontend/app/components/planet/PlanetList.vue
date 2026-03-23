<script setup lang="ts">
const { state } = useGameState()
const { availablePlanets } = usePlanetActions()
</script>

<template>
  <div class="space-y-6">
    <!-- Debug: show planet count if empty -->
    <div v-if="!state.planets || state.planets.length === 0" class="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
      No planets found in game state. Try clearing your save and starting a new game.
    </div>

    <!-- Owned Planets -->
    <div v-if="state.planets && state.planets.length > 0">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-globe" class="text-lg text-violet-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Your Planets</h2>
        <UBadge color="neutral" variant="subtle" size="xs">{{ state.planets.length }}</UBadge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlanetCard
          v-for="(_, index) in state.planets"
          :key="state.planets[index]?.definitionId ?? index"
          :planet-index="index"
        />
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
