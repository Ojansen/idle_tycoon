<script setup lang="ts">
const emit = defineEmits<{ start: [] }>()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12">
    <div class="max-w-2xl w-full text-center space-y-10">
      <!-- Title -->
      <div class="space-y-3">
        <h1 class="text-5xl sm:text-6xl font-black text-white tracking-tight">
          GALACTIC<br><span class="text-violet-400">DOMINION</span>
        </h1>
        <p class="text-lg text-zinc-400 font-light">Build your empire among the stars</p>
      </div>

      <!-- Lore -->
      <p class="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto">
        Humanity has reached beyond its cradle. From a single world, civilizations now stretch across star systems.
        Forge an empire &mdash; claim stars, colonize worlds, and research your way
        to galactic dominion.
      </p>

      <!-- Three pillars -->
      <div class="grid grid-cols-3 gap-6 max-w-md mx-auto">
        <div class="space-y-2">
          <div class="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <span class="text-amber-400 text-xl">*</span>
          </div>
          <div class="text-xs font-semibold uppercase tracking-wider text-amber-400">Explore</div>
          <div class="text-[10px] text-zinc-600">Survey uncharted systems</div>
        </div>
        <div class="space-y-2">
          <div class="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <span class="text-emerald-400 text-xl">*</span>
          </div>
          <div class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Colonize</div>
          <div class="text-[10px] text-zinc-600">Claim worlds for your empire</div>
        </div>
        <div class="space-y-2">
          <div class="w-12 h-12 mx-auto rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
            <span class="text-violet-400 text-xl">*</span>
          </div>
          <div class="text-xs font-semibold uppercase tracking-wider text-violet-400">Research</div>
          <div class="text-[10px] text-zinc-600">Unlock megastructures</div>
        </div>
      </div>

      <!-- CTA -->
      <button
        class="px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm tracking-wide transition-colors"
        @click="emit('start')"
      >
        Forge Your Empire
      </button>
    </div>
  </div>
</template>
