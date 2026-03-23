<script setup lang="ts">
const open = defineModel<boolean>('open', { default: true })
const { state } = useGameState()
const { formatNumber } = useNumberFormat()

const playTimeFormatted = computed(() => {
  const s = Math.floor(state.value.totalPlayTime)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m`
})
</script>

<template>
  <UModal v-model:open="open" title="Victory" description="You have transcended reality">
    <template #content>
      <div class="p-6 text-center">
        <UIcon name="i-lucide-trophy" class="text-5xl text-amber-400 mb-4" />
        <h3 class="text-2xl font-bold text-white mb-2">The Omega Structure is Complete</h3>
        <p class="text-sm text-zinc-400 mb-6">Your civilization has transcended the boundaries of reality itself.</p>

        <div class="grid grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <div class="text-lg font-bold text-violet-400">{{ state.prestigeCount }}</div>
            <div class="text-xs text-zinc-500">Prestiges</div>
          </div>
          <div>
            <div class="text-lg font-bold text-amber-400">{{ playTimeFormatted }}</div>
            <div class="text-xs text-zinc-500">Play Time</div>
          </div>
          <div>
            <div class="text-lg font-bold text-emerald-400">₢{{ formatNumber(state.totalCreditsEarned) }}</div>
            <div class="text-xs text-zinc-500">Total Credits Earned</div>
          </div>
          <div>
            <div class="text-lg font-bold text-cyan-400">{{ state.influence }}</div>
            <div class="text-xs text-zinc-500">Influence Earned</div>
          </div>
        </div>

        <p class="text-xs text-zinc-500 mb-4">Type VI civilization and beyond awaits. The journey continues...</p>

        <UButton color="primary" @click="open = false">
          Continue Playing
        </UButton>
      </div>
    </template>
  </UModal>
</template>
