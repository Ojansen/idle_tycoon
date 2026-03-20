<script setup lang="ts">
const { click } = useGameActions()
const { state, autoclickPerSecond, effectiveClickPower } = useGameState()
const { formatNumber } = useNumberFormat()

const clickPowerDisplay = computed(() => {
  return formatNumber(effectiveClickPower.value)
})

const clickArea = ref<HTMLElement>()
const flyups = ref<Array<{ id: number; x: number; y: number; value: number }>>([])
let flyupId = 0

function spawnFlyup(x: number, y: number) {
  const id = flyupId++
  flyups.value.push({ id, x, y, value: effectiveClickPower.value })
  setTimeout(() => {
    flyups.value = flyups.value.filter(f => f.id !== id)
  }, 800)
}

function handleClick(event: MouseEvent) {
  click()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  spawnFlyup(event.clientX - rect.left, event.clientY - rect.top)
}

function handleKeyClick() {
  click()
  if (clickArea.value) {
    spawnFlyup(
      clickArea.value.offsetWidth / 2 + (Math.random() - 0.5) * 40,
      clickArea.value.offsetHeight / 2 + (Math.random() - 0.5) * 20
    )
  }
}

onMounted(() => {
  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault()
      handleKeyClick()
    }
  })
})
</script>

<template>
  <div
    ref="clickArea"
    class="relative flex flex-col items-center justify-center select-none cursor-pointer rounded-2xl bg-gradient-to-b from-violet-950/50 to-zinc-900/50 border border-violet-500/20 hover:border-violet-500/40 transition-all active:click-pulse overflow-hidden"
    style="min-height: 280px"
    @click="handleClick"
  >
    <!-- Living civilization animation -->
    <GameCivilizationScene />

    <!-- Click info overlay -->
    <div class="relative z-10 text-center mt-2">
      <span class="text-lg font-bold text-white drop-shadow-lg">Click to Earn</span>
      <div class="text-sm text-violet-300 drop-shadow">+{{ clickPowerDisplay }} ₢ per click</div>
      <div v-if="autoclickPerSecond > 0" class="text-xs text-cyan-400 mt-1">{{ formatNumber(autoclickPerSecond) }} auto-clicks/s</div>
      <div class="text-xs text-zinc-500 mt-1">Press Space to click</div>
    </div>

    <!-- Flyup numbers -->
    <span
      v-for="f in flyups"
      :key="f.id"
      class="flyup absolute text-lg font-bold text-violet-300 pointer-events-none z-20"
      :style="{ left: f.x + 'px', top: f.y + 'px' }"
    >
      +{{ formatNumber(f.value) }}
    </span>
  </div>
</template>
