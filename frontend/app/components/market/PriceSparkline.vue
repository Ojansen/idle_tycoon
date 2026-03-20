<script setup lang="ts">
const props = defineProps<{
  history: number[]
  up: boolean
}>()

const points = computed(() => {
  const h = props.history
  if (h.length < 2) return ''
  const min = Math.min(...h)
  const max = Math.max(...h)
  const range = max - min || 1
  const w = 120
  const ht = 32
  return h.map((v, i) => {
    const x = (i / (h.length - 1)) * w
    const y = ht - ((v - min) / range) * ht
    return `${x},${y}`
  }).join(' ')
})
</script>

<template>
  <svg width="120" height="32" class="shrink-0">
    <polyline
      :points="points"
      fill="none"
      :stroke="up ? '#4ade80' : '#f87171'"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
