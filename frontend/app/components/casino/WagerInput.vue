<script setup lang="ts">
const wager = defineModel<number>({ default: 0 })

defineProps<{
  disabled?: boolean
}>()

const { state } = useGameState()
const { formatNumber } = useNumberFormat()

const presets = computed(() => {
  const credits = state.value.credits
  return [
    { label: '10%', value: Math.floor(credits * 0.1) },
    { label: '25%', value: Math.floor(credits * 0.25) },
    { label: '50%', value: Math.floor(credits * 0.5) },
    { label: 'MAX', value: Math.floor(credits) }
  ].filter(p => p.value > 0)
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <span class="text-xs text-zinc-400 shrink-0">Wager:</span>
      <UInput
        v-model.number="wager"
        type="number"
        :min="1"
        :max="Math.floor(state.credits)"
        :disabled="disabled"
        size="sm"
        class="flex-1"
        placeholder="Enter wager"
      />
    </div>
    <div class="grid grid-cols-2 gap-1">
      <UButton
        v-for="p in presets"
        :key="p.label"
        size="xs"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        block
        @click="wager = p.value"
      >
        {{ p.label }} (₢{{ formatNumber(p.value) }})
      </UButton>
    </div>
  </div>
</template>
