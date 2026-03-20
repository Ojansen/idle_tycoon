<script setup lang="ts">
import type { BuildingDefinition } from '~/types/game'

const props = defineProps<{
  building: BuildingDefinition
  owned: number
  cost: number
  affordable: boolean
  quantity: number
}>()

const emit = defineEmits<{
  buy: []
}>()

const { formatNumber } = useNumberFormat()
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
    :class="affordable ? 'bg-white/5 hover:bg-white/10' : 'bg-white/[0.02] opacity-60'"
  >
    <UIcon :name="props.building.icon" class="text-xl shrink-0" :class="props.building.resource === 'energy' ? 'text-amber-400' : props.building.resource === 'autoclick' ? 'text-cyan-400' : 'text-violet-400'" />

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-white truncate">{{ props.building.name }}</span>
        <UBadge size="xs" color="neutral" variant="subtle">{{ props.owned }}</UBadge>
      </div>
      <div class="text-xs text-zinc-400">
        +{{ formatNumber(props.building.baseOutput) }}
        {{ props.building.resource === 'energy' ? 'TW/s each' : props.building.resource === 'autoclick' ? 'clicks/s each' : '₢/s each' }}
      </div>
    </div>

    <UButton
      size="xs"
      :color="affordable ? (props.building.resource === 'energy' ? 'warning' : props.building.resource === 'autoclick' ? 'info' : 'primary') : 'neutral'"
      :variant="affordable ? 'solid' : 'outline'"
      :disabled="!affordable"
      @click="emit('buy')"
    >
      <template v-if="props.quantity > 1">{{ props.quantity }}x </template>₢{{ formatNumber(props.cost) }}
    </UButton>
  </div>
</template>
