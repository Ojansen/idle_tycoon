<script setup lang="ts">
const { pendingAscensionLevels, getPerksForLevel, choosePerk, chosenPerks } = useAscensionPerks()
const { kardashevLevels } = useGameConfig()
const toast = useToast()

function selectPerk(perkId: string, perkName: string) {
  if (choosePerk(perkId)) {
    toast.success({ title: 'Ascension Perk Chosen!', message: perkName })
  }
}

function getLevelName(level: number): string {
  const k = kardashevLevels.find(k => k.level === level)
  return k ? k.name : `Type ${level}`
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
        <UIcon name="i-lucide-sparkles" class="text-xl text-violet-400 animate-pulse" />
        <h3 class="text-sm font-bold text-violet-300 uppercase tracking-wider">
          New Ascension Perk Available! ({{ getLevelName(level) }})
        </h3>
      </div>
      <p class="text-xs text-zinc-400 mb-4">Choose one permanent bonus. This cannot be changed later.</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="perk in getPerksForLevel(level)"
          :key="perk.id"
          class="rounded-lg bg-white/5 border border-white/10 p-4 text-left transition-all hover:bg-violet-500/10 hover:border-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
          @click="selectPerk(perk.id, perk.name)"
        >
          <UIcon :name="perk.icon" class="text-2xl text-violet-400 mb-2" />
          <div class="text-sm font-bold text-white mb-1">{{ perk.name }}</div>
          <div class="text-xs text-zinc-400">{{ perk.description }}</div>
        </button>
      </div>
    </div>

    <!-- Chosen perks display -->
    <div v-if="chosenPerks.length > 0" class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-3">
        <UIcon name="i-lucide-sparkles" class="align-middle mr-1" />
        Ascension Perks
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="perk in chosenPerks"
          :key="perk.id"
          class="flex items-center gap-3 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20"
        >
          <UIcon :name="perk.icon" class="text-lg text-violet-400 shrink-0" />
          <div class="min-w-0">
            <div class="text-sm font-medium text-white">{{ perk.name }}</div>
            <div class="text-xs text-zinc-400">{{ perk.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
