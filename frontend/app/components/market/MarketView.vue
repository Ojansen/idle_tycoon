<script setup lang="ts">
const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="space-y-4">
    <!-- Resource Exchange -->
    <MarketResourceExchangePanel />

    <!-- Placeholder for future branch offices -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-8 text-center">
      <UIcon name="i-lucide-network" class="text-4xl text-zinc-500 mb-3" />
      <h3 class="text-lg font-bold text-white mb-2">Coming Soon</h3>
      <p class="text-sm text-zinc-400">Branch offices across the galaxy will be established here.</p>
    </div>
  </div>
</template>
