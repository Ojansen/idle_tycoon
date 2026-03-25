<script setup lang="ts">
const { megastructures } = useResearchConfig()
</script>

<template>
  <div>
    <div v-if="megastructures.length === 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-8 text-center">
      <UIcon name="i-lucide-satellite" class="text-3xl text-zinc-600 mb-2" />
      <p class="text-sm text-zinc-500">No megastructures defined.</p>
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ResearchMegastructureCard
        v-for="mega in megastructures"
        :key="mega.id"
        :mega="mega"
      />
    </div>
  </div>
</template>
