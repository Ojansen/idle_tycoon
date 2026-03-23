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
const { getBuildingMultiplier, getUpkeepMultiplier } = useGameState()

const milestone = computed(() => getBuildingMultiplier(props.building.id))
const upkeepMilestone = computed(() => getUpkeepMultiplier(props.building.id))
const effectiveOutput = computed(() => {
  // CG factories use dampened multiplier for output (matches cgPerSecond calculation)
  const mult = props.building.resource === 'consumer_goods' ? upkeepMilestone.value : milestone.value
  return props.building.baseOutput * mult
})
const effectiveEnergyUpkeep = computed(() => (props.building.energyUpkeep ?? 0) * upkeepMilestone.value)
const effectiveCgUpkeep = computed(() => (props.building.cgUpkeep ?? 0) * upkeepMilestone.value)
const hasUpkeep = computed(() => effectiveEnergyUpkeep.value > 0 || effectiveCgUpkeep.value > 0)

const resourceColor = computed(() => {
  switch (props.building.resource) {
    case 'energy': return 'text-amber-400'
    case 'autoclick': return 'text-cyan-400'
    case 'consumer_goods': return 'text-amber-600'
    default: return 'text-violet-400'
  }
})

const buttonColor = computed(() => {
  if (!props.affordable) return 'neutral'
  switch (props.building.resource) {
    case 'energy': return 'warning'
    case 'autoclick': return 'info'
    case 'consumer_goods': return 'warning'
    default: return 'primary'
  }
})

const outputLabel = computed(() => {
  switch (props.building.resource) {
    case 'energy': return 'TW/s each'
    case 'autoclick': return 'clicks/s each'
    case 'consumer_goods': return 'CG/s each'
    default: return '₢/s each'
  }
})
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
    :class="affordable ? 'bg-white/5 hover:bg-white/10' : 'bg-white/[0.02] opacity-60'"
  >
    <UIcon :name="props.building.icon" class="text-xl shrink-0" :class="resourceColor" />

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-white truncate">{{ props.building.name }}</span>
        <UBadge size="xs" color="neutral" variant="subtle">{{ props.owned }}</UBadge>
        <UBadge v-if="milestone > 1" size="xs" color="success" variant="subtle">×{{ milestone }}</UBadge>
      </div>
      <div class="text-xs text-zinc-400">
        +{{ formatNumber(effectiveOutput) }}
        {{ outputLabel }}
      </div>
      <div v-if="hasUpkeep" class="text-xs text-red-400/70">
        <span v-if="effectiveEnergyUpkeep > 0">-{{ formatNumber(effectiveEnergyUpkeep) }} TW/s</span>
        <span v-if="effectiveEnergyUpkeep > 0 && effectiveCgUpkeep > 0"> · </span>
        <span v-if="effectiveCgUpkeep > 0">-{{ formatNumber(effectiveCgUpkeep) }} CG/s</span>
        <span class="text-zinc-600 ml-1">upkeep each</span>
      </div>
    </div>

    <UButton
      size="xs"
      :color="buttonColor"
      :variant="affordable ? 'solid' : 'outline'"
      :disabled="!affordable"
      @click="emit('buy')"
    >
      <template v-if="props.quantity > 1">{{ props.quantity }}x </template>₢{{ formatNumber(props.cost) }}
    </UButton>
  </div>
</template>
