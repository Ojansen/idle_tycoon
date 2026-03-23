<script setup lang="ts">
const { state } = useGameState()
const { pendingAscensionLevels, generatePerkOptions, choosePerk } = useAscensionPerks()
const { kardashevLevels } = useGameConfig()
const toast = useToast()

function selectPerk(option: { stat: string; name: string; value: number }) {
  choosePerk(option.stat as any, option.value)
  toast.success({ title: 'Ascension Perk Chosen!', message: option.name })
}

function getLevelName(level: number): string {
  const k = kardashevLevels.find(k => k.level === level)
  return k ? k.name : `Type ${level}`
}

function formatPerkValue(value: number): string {
  if (value > 1) return `+${Math.round((value - 1) * 100)}%`
  return `-${Math.round((1 - value) * 100)}%`
}
</script>

<template>
  <div class="space-y-4">
    <!-- Pending perk selection banners -->
    <div
      v-for="level in pendingAscensionLevels"
      :key="level"
      class="rounded-lg bg-gradient-to-r from-violet-950/40 to-purple-950/40 border border-violet-500/30 p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xl text-violet-400 animate-pulse">*</span>
        <h3 class="text-sm font-bold text-violet-300 uppercase tracking-wider">
          New Ascension Perk Available! ({{ getLevelName(level) }})
        </h3>
      </div>
      <p class="text-xs text-zinc-400 mb-4">Choose one permanent bonus. This cannot be changed later.</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="option in generatePerkOptions(level)"
          :key="option.stat"
          class="rounded-lg bg-white/5 border border-white/10 p-4 text-left transition-all hover:bg-violet-500/10 hover:border-violet-500/30"
          @click="selectPerk(option)"
        >
          <div class="text-sm font-bold text-white mb-1">{{ option.name }}</div>
          <div class="text-xs text-zinc-400">{{ option.description }}</div>
          <div class="text-xs font-semibold mt-2" :class="option.value > 1 ? 'text-emerald-400' : 'text-cyan-400'">
            {{ formatPerkValue(option.value) }}
          </div>
        </button>
      </div>
    </div>

    <!-- Chosen perks display -->
    <div v-if="state.ascensionPerks.length > 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-3">
        Ascension Perks ({{ state.ascensionPerks.length }})
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="(perk, i) in state.ascensionPerks"
          :key="i"
          class="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20"
        >
          <div class="text-sm text-white">{{ perk.stat.replace('Multiplier', '').replace(/([A-Z])/g, ' $1').trim() }}</div>
          <div class="text-xs font-semibold" :class="perk.value > 1 ? 'text-emerald-400' : 'text-cyan-400'">
            {{ formatPerkValue(perk.value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
