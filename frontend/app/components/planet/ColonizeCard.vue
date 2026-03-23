<script setup lang="ts">
import type { PlanetTypeDefinition, PlanetSizeDefinition, PlanetTraitDefinition } from '~/types/planet'

const props = defineProps<{ planetDefId: string }>()

const { getPlanetDef, getPlanetType, getPlanetSize, getPlanetTrait } = usePlanetConfig()
const { getColonyCost, canColonize, colonizePlanet } = usePlanetActions()
const { formatNumber } = useNumberFormat()

const def = computed(() => getPlanetDef(props.planetDefId))
const planetType = computed<PlanetTypeDefinition | undefined>(() => def.value ? getPlanetType(def.value.type) : undefined)
const planetSize = computed<PlanetSizeDefinition | undefined>(() => def.value ? getPlanetSize(def.value.size) : undefined)
const traits = computed<PlanetTraitDefinition[]>(() =>
  (def.value?.traits ?? [])
    .map(id => getPlanetTrait(id))
    .filter((t): t is PlanetTraitDefinition => t !== undefined),
)
const colonyCost = computed(() => getColonyCost(props.planetDefId))
const affordable = computed(() => canColonize(props.planetDefId))

// Planet type color → Tailwind class stems
const typeColorMap: Record<string, string> = {
  garden:   'emerald',
  volcanic: 'red',
  ocean:    'blue',
  desert:   'amber',
  ice:      'cyan',
  barren:   'zinc',
  gaia:     'yellow',
}

const typeColor = computed(() => typeColorMap[def.value?.type ?? ''] ?? 'zinc')

// Icon text color per planet type
const iconColorClass = computed<string>(() => {
  const map: Record<string, string> = {
    emerald: 'text-emerald-400',
    red:     'text-red-400',
    blue:    'text-blue-400',
    amber:   'text-amber-400',
    cyan:    'text-cyan-400',
    zinc:    'text-zinc-400',
    yellow:  'text-yellow-400',
  }
  return map[typeColor.value] ?? 'text-zinc-400'
})

const iconBgClass = computed<string>(() => {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-500/10',
    red:     'bg-red-500/10',
    blue:    'bg-blue-500/10',
    amber:   'bg-amber-500/10',
    cyan:    'bg-cyan-500/10',
    zinc:    'bg-zinc-500/10',
    yellow:  'bg-yellow-500/10',
  }
  return map[typeColor.value] ?? 'bg-zinc-500/10'
})

// Trait badge color based on dominant effect
function traitBadgeColor(trait: PlanetTraitDefinition): 'error' | 'info' | 'success' {
  const stat = trait.effects[0]?.stat
  const value = trait.effects[0]?.value ?? 1
  if (stat === 'maintenance') return value > 1 ? 'error' : 'success'
  if (stat === 'popGrowth') return value >= 1 ? 'success' : 'error'
  if (value >= 1) return 'info'
  return 'error'
}

// Non-trivial bonuses from planet type (anything that is not exactly 1.0)
interface BonusIndicator {
  label: string
  positive: boolean
}

const bonusIndicators = computed<BonusIndicator[]>(() => {
  const b = planetType.value?.bonuses
  if (!b) return []
  const results: BonusIndicator[] = []
  if (b.credits !== 1.0) {
    const pct = Math.round((b.credits - 1) * 100)
    results.push({ label: `${pct > 0 ? '+' : ''}${pct}% ₢`, positive: pct > 0 })
  }
  if (b.cg !== 1.0) {
    const pct = Math.round((b.cg - 1) * 100)
    results.push({ label: `${pct > 0 ? '+' : ''}${pct}% CG`, positive: pct > 0 })
  }
  if (b.popGrowth !== 1.0) {
    const pct = Math.round((b.popGrowth - 1) * 100)
    results.push({ label: `${pct > 0 ? '+' : ''}${pct}% pop`, positive: pct > 0 })
  }
  return results
})

// Effective maintenance cost factoring in the type modifier
const maintenanceCost = computed(() => {
  if (!def.value || !planetType.value) return 0
  return def.value.maintenanceCost * planetType.value.maintenanceModifier
})

function handleColonize() {
  colonizePlanet(props.planetDefId)
}
</script>

<template>
  <div
    v-if="def && planetType && planetSize"
    class="rounded-lg bg-white/[0.03] border border-white/10 p-4 flex items-center gap-4"
  >
    <!-- Left: icon + name -->
    <div class="flex items-center gap-3 min-w-0 w-44 shrink-0">
      <div class="rounded-lg p-2 shrink-0" :class="iconBgClass">
        <UIcon :name="planetType.icon" class="text-xl" :class="iconColorClass" />
      </div>
      <div class="min-w-0">
        <div class="text-sm font-medium text-white truncate">{{ def.name }}</div>
        <div class="text-xs text-zinc-500 truncate">{{ planetType.name }}</div>
      </div>
    </div>

    <!-- Middle: stats -->
    <div class="flex-1 min-w-0 space-y-2">
      <!-- Size / slots / housing row -->
      <div class="flex flex-wrap items-center gap-1.5">
        <UBadge color="neutral" variant="subtle" size="xs" class="capitalize">
          {{ def.size }}
        </UBadge>
        <span class="text-xs text-zinc-500">
          <UIcon name="i-lucide-layout-grid" class="align-middle mr-0.5" />
          {{ planetSize.slots }} slots
        </span>
        <span class="text-xs text-zinc-500">
          <UIcon name="i-lucide-home" class="align-middle mr-0.5" />
          {{ planetSize.baseHousing }} housing
        </span>
        <span class="text-xs text-red-400/80">
          <UIcon name="i-lucide-wrench" class="align-middle mr-0.5" />
          ₢{{ formatNumber(maintenanceCost) }}/s
        </span>
      </div>

      <!-- Bonus indicators row -->
      <div v-if="bonusIndicators.length" class="flex flex-wrap items-center gap-1">
        <span
          v-for="(bonus, i) in bonusIndicators"
          :key="i"
          class="text-xs font-medium px-1.5 py-0.5 rounded"
          :class="bonus.positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'"
        >
          {{ bonus.label }}
        </span>
      </div>

      <!-- Traits row -->
      <div v-if="traits.length" class="flex flex-wrap gap-1">
        <UBadge
          v-for="trait in traits"
          :key="trait.id"
          :color="traitBadgeColor(trait)"
          variant="subtle"
          size="xs"
        >
          {{ trait.name }}
        </UBadge>
      </div>
    </div>

    <!-- Right: colonize button -->
    <div class="shrink-0">
      <UButton
        size="sm"
        color="primary"
        :disabled="!affordable"
        @click="handleColonize"
      >
        ₢{{ formatNumber(colonyCost) }}
      </UButton>
    </div>
  </div>
</template>
