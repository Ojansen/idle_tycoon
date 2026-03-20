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
const { getBuildingMultiplier } = useGameState()

const milestone = computed(() => getBuildingMultiplier(props.building.id))
const effectiveOutput = computed(() => props.building.baseOutput * milestone.value)
const nextMilestoneAt = computed(() => (Math.floor(props.owned / 25) + 1) * 25)
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
        <UBadge v-if="milestone > 1" size="xs" color="success" variant="subtle">×{{ milestone }}</UBadge>
      </div>
      <div class="text-xs text-zinc-400">
        +{{ formatNumber(effectiveOutput) }}
        {{ props.building.resource === 'energy' ? 'TW/s each' : props.building.resource === 'autoclick' ? 'clicks/s each' : '₢/s each' }}
        <span v-if="props.owned > 0" class="text-zinc-600 ml-1">· next ×{{ milestone * 2 }} at {{ nextMilestoneAt }}</span>
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
