<script setup lang="ts">
const props = defineProps<{
  credits: number
  seconds: number
}>()

const open = defineModel<boolean>('open', { default: true })

const { formatNumber } = useNumberFormat()

const timeAway = computed(() => {
  const s = Math.floor(props.seconds)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m`
})
</script>

<template>
  <UModal v-model:open="open" title="Welcome Back" description="Offline earnings report">
    <template #content>
      <div class="p-6 text-center">
        <UIcon name="i-lucide-rocket" class="text-4xl text-violet-400 mb-3" />
        <h3 class="text-lg font-bold text-white mb-1">Welcome Back, Executive</h3>
        <p class="text-sm text-zinc-400 mb-4">Your empire continued operating for {{ timeAway }}</p>

        <div class="flex gap-4 justify-center mb-4">
          <div v-if="props.credits > 0" class="text-center">
            <div class="text-xl font-bold text-violet-400">+₢{{ formatNumber(props.credits) }}</div>
            <div class="text-xs text-zinc-400">Credits earned</div>
          </div>
        </div>

        <UButton color="primary" @click="open = false">
          Collect
        </UButton>
      </div>
    </template>
  </UModal>
</template>
