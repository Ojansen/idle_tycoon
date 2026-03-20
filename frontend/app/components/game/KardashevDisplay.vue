<script setup lang="ts">
const { kardashevLevel, nextKardashevLevel, energyPerSecond } = useGameState()
const { kardashevLevels } = useGameConfig()
const { formatNumber } = useNumberFormat()

const currentLevel = computed(() =>
  kardashevLevels.find(k => k.level === kardashevLevel.value)!
)

const progress = computed(() => {
  const next = nextKardashevLevel.value
  if (!next) return 100
  const current = currentLevel.value
  const eps = energyPerSecond.value
  const range = next.energyPerSecond - current.energyPerSecond
  if (range <= 0) return 100
  return Math.min(100, ((eps - current.energyPerSecond) / range) * 100)
})
</script>

<template>
  <div class="rounded-lg bg-gradient-to-r from-violet-950/40 to-amber-950/40 border border-white/10 px-4 py-3">
    <div class="flex items-center justify-between mb-1">
      <div>
        <span class="text-sm font-bold text-white">{{ currentLevel.name }}</span>
        <span class="text-xs text-zinc-400 ml-2">{{ currentLevel.description }}</span>
      </div>
      <div v-if="nextKardashevLevel" class="text-xs text-zinc-400">
        Next: {{ nextKardashevLevel.name }} @ {{ formatNumber(nextKardashevLevel.energyPerSecond) }} TW/s
      </div>
      <span v-else class="text-xs text-amber-400 font-medium">MAX LEVEL</span>
    </div>
    <UProgress
      :model-value="progress"
      size="xs"
      color="primary"
    />
  </div>
</template>
