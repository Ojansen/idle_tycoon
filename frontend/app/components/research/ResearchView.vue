<script setup lang="ts">
const { isResearching } = useResearchActions()
</script>

<template>
  <div class="space-y-6">
    <!-- Active research banner -->
    <ResearchActivePanel v-if="isResearching" />

    <!-- Research tree -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-flask-conical" class="text-lg text-violet-400" />
        <h2 class="text-xs font-semibold uppercase tracking-wider text-white">Research Tree</h2>
      </div>
      <ResearchTree />
    </div>

    <!-- Megastructures -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-satellite" class="text-lg text-amber-400" />
        <h2 class="text-xs font-semibold uppercase tracking-wider text-white">Megastructures</h2>
        <span class="text-xs text-zinc-500">— Civilization-scale construction projects</span>
      </div>
      <ResearchMegastructureList />
    </div>
  </div>
</template>
