<script setup lang="ts">
import type { PlanetPolicy } from '~/types/planet'

const props = defineProps<{ systemIndex: number; planetIndex: number }>()

const { state } = useGameState()
const { getPlanetDef, getPlanetType, getPlanetSize, getPlanetTrait, getDivision } = usePlanetConfig()
const { getPlanetHousingCap, getPlanetTotalLevels, getPlanetMaxLevels, getPlanetProduction, getPlanetJobStats } = usePlanets()
const { setPlanetPolicy, upgradeDivision, getDivisionUpgradeCost, canUpgradeDivision, assignDivision, getAssignCost } = usePlanetActions()
const { formatNumber } = useNumberFormat()

const planet = computed(() => state.value.systems[props.systemIndex]?.planets[props.planetIndex])
const planetType = computed(() => planet.value ? getPlanetType(planet.value.type) : undefined)
const planetSize = computed(() => planet.value ? getPlanetSize(planet.value.size) : undefined)

const housingCap = computed(() => planet.value ? getPlanetHousingCap(planet.value) : 0)
const totalLevels = computed(() => planet.value ? getPlanetTotalLevels(planet.value) : 0)
const maxLevels = computed(() => planet.value ? getPlanetMaxLevels(planet.value) : 0)
const production = computed(() => planet.value ? getPlanetProduction(planet.value) : { credits: 0, cg: 0, trade: 0 })
const jobStats = computed(() => planet.value ? getPlanetJobStats(planet.value) : { totalJobs: 0, filledJobs: 0, unemployed: 0, perDivision: [] })
const atLevelCap = computed(() => totalLevels.value >= maxLevels.value)

const maintenanceCost = computed(() => {
  // Planet maintenance is handled at system level now
  return 0
})

const traits = computed(() => {
  if (!planet.value) return []
  return planet.value.traits.map(id => getPlanetTrait(id)).filter(Boolean)
})

// Planet type bonuses — only show non-1.0 values
const bonuses = computed(() => {
  if (!planetType.value) return []
  const b = planetType.value.bonuses
  const result: { label: string; value: string; positive: boolean }[] = []
  if (b.credits !== 1) result.push({ label: '₢', value: `${b.credits > 1 ? '+' : ''}${Math.round((b.credits - 1) * 100)}%`, positive: b.credits > 1 })
  if (b.cg !== 1) result.push({ label: 'CG', value: `${b.cg > 1 ? '+' : ''}${Math.round((b.cg - 1) * 100)}%`, positive: b.cg > 1 })
  if (b.popGrowth !== 1) result.push({ label: 'Growth', value: `${b.popGrowth > 1 ? '+' : ''}${Math.round((b.popGrowth - 1) * 100)}%`, positive: b.popGrowth > 1 })
  return result
})

const policies: { id: PlanetPolicy; label: string }[] = [
  { id: 'balanced', label: 'Bal' },
  { id: 'prioritize_production', label: '₢' },
  { id: 'prioritize_cg', label: 'CG' },
  { id: 'prioritize_trade', label: 'Trade' },
]

const divisionTypes = ['mining', 'industrial', 'commerce', 'administrative'] as const

const borderMap: Record<string, string> = {
  emerald: 'border-emerald-500/30',
  red: 'border-red-500/30',
  blue: 'border-blue-500/30',
  amber: 'border-amber-500/30',
  cyan: 'border-cyan-500/30',
  zinc: 'border-zinc-500/30',
  yellow: 'border-yellow-500/30',
}

// Gradient glow at top of card — gives each planet type a distinct visual identity
const glowMap: Record<string, string> = {
  emerald: 'from-emerald-900/40 via-emerald-950/20 to-transparent',
  red: 'from-red-900/40 via-red-950/20 to-transparent',
  blue: 'from-blue-900/40 via-blue-950/20 to-transparent',
  amber: 'from-amber-900/40 via-amber-950/20 to-transparent',
  cyan: 'from-cyan-900/40 via-cyan-950/20 to-transparent',
  zinc: 'from-zinc-700/30 via-zinc-900/20 to-transparent',
  yellow: 'from-yellow-900/40 via-yellow-950/20 to-transparent',
}

const textMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  zinc: 'text-zinc-400',
  yellow: 'text-yellow-400',
}

const orbMap: Record<string, string> = {
  emerald: 'bg-emerald-500 shadow-emerald-500/50',
  red: 'bg-red-500 shadow-red-500/50',
  blue: 'bg-blue-500 shadow-blue-500/50',
  amber: 'bg-amber-500 shadow-amber-500/50',
  cyan: 'bg-cyan-500 shadow-cyan-500/50',
  zinc: 'bg-zinc-500 shadow-zinc-500/50',
  yellow: 'bg-yellow-500 shadow-yellow-500/50',
}

const divColorMap: Record<string, string> = {
  mining: 'text-amber-400',
  industrial: 'text-emerald-400',
  commerce: 'text-violet-400',
  administrative: 'text-sky-400',
}

const divBgMap: Record<string, string> = {
  mining: 'border-amber-800/40 bg-amber-950/20',
  industrial: 'border-emerald-800/40 bg-emerald-950/20',
  commerce: 'border-violet-800/40 bg-violet-950/20',
  administrative: 'border-sky-800/40 bg-sky-950/20',
}

const openSlot = ref<number | null>(null)
const showTransfer = ref(false)

// Size label
const sizeLabel = computed(() => {
  if (!planetSize.value) return ''
  return `${planetSize.value.slots} slots`
})
</script>

<template>
  <div v-if="planet && planetType && planetSize"
    class="rounded-xl overflow-hidden border"
    :class="borderMap[planetType.color] || 'border-white/10'"
  >
    <!-- Planet header with gradient glow -->
    <div class="relative px-4 pt-4 pb-3 bg-gradient-to-b"
      :class="glowMap[planetType.color] || 'from-zinc-800/30 to-transparent'"
    >
      <div class="flex items-center gap-3">
        <!-- Planet orb -->
        <div class="relative shrink-0">
          <div class="w-10 h-10 rounded-full shadow-lg"
            :class="orbMap[planetType.color]"
          />
          <!-- Size ring -->
          <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
            <span class="text-[8px] font-bold text-zinc-300">{{ planetSize.slots }}</span>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-white truncate">{{ planet.name }}</div>
          <div class="text-xs" :class="textMap[planetType.color]">{{ planetType.name }}</div>
        </div>

        <div class="text-right shrink-0">
          <div v-if="maintenanceCost > 0" class="text-xs text-zinc-500">-₢{{ formatNumber(maintenanceCost) }}/s</div>
          <div class="text-[10px] text-zinc-600">{{ sizeLabel }}</div>
        </div>
      </div>

      <!-- Bonus indicators — like Stellaris modifier icons -->
      <div v-if="bonuses.length || traits.length" class="flex flex-wrap gap-1.5 mt-2">
        <span v-for="b in bonuses" :key="b.label"
          class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
          :class="b.positive ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'"
        >
          {{ b.label }} {{ b.value }}
        </span>
        <span v-for="trait in traits" :key="trait!.id"
          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-950/50 text-violet-300"
        >
          {{ trait!.name }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="px-4 pb-4 pt-2 space-y-3 bg-white/[0.02]">
      <!-- Stats row -->
      <div class="grid grid-cols-5 gap-1 text-center">
        <div>
          <div class="text-xs font-bold text-cyan-400">{{ Math.floor(planet.pops) }}</div>
          <div class="text-[10px] text-zinc-600">/ {{ housingCap }} pop</div>
        </div>
        <div>
          <div class="text-xs font-bold" :class="jobStats.unemployed > 0 ? 'text-amber-400' : 'text-emerald-400'">{{ jobStats.filledJobs }}/{{ jobStats.totalJobs }}</div>
          <div class="text-[10px] text-zinc-600">jobs</div>
        </div>
        <div>
          <div class="text-xs font-bold" :class="atLevelCap ? 'text-red-400' : 'text-zinc-300'">{{ totalLevels }}/{{ maxLevels }}</div>
          <div class="text-[10px] text-zinc-600">levels</div>
        </div>
        <div>
          <div class="text-xs font-bold text-amber-400">₢{{ formatNumber(production.credits) }}</div>
          <div class="text-[10px] text-zinc-600">/s</div>
        </div>
        <div>
          <div class="text-xs font-bold text-emerald-400">{{ formatNumber(production.cg) }}</div>
          <div class="text-[10px] text-zinc-600">CG/s</div>
        </div>
      </div>
      <!-- Unemployed warning -->
      <div v-if="jobStats.unemployed > 0" class="text-[10px] text-amber-400">
        {{ jobStats.unemployed }} unemployed pop{{ jobStats.unemployed > 1 ? 's' : '' }} — need more division jobs
      </div>

      <!-- Division Slots -->
      <div class="space-y-1.5">
        <div class="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Divisions</div>
        <div v-for="(div, i) in planet.divisions" :key="i">
          <!-- Empty slot -->
          <div v-if="!div" class="border border-dashed border-zinc-700/60 rounded-lg p-2">
            <button
              class="w-full text-xs text-zinc-500 hover:text-zinc-300"
              @click="openSlot = openSlot === i ? null : i"
            >+ Assign</button>
            <div v-if="openSlot === i" class="mt-1.5 space-y-1">
              <button
                v-for="dt in divisionTypes"
                :key="dt"
                class="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-white/5"
                :class="divColorMap[dt]"
                @click="assignDivision(systemIndex, planetIndex, i, dt); openSlot = null"
              >
                <span>{{ getDivision(dt)?.name ?? dt }}</span>
                <span class="text-zinc-500">₢{{ formatNumber(getAssignCost(systemIndex, planetIndex, i, dt)) }}</span>
              </button>
            </div>
          </div>

          <!-- Filled slot -->
          <div v-else class="flex items-center justify-between border rounded-lg px-3 py-1.5"
            :class="divBgMap[div.type] || 'border-zinc-800'"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium" :class="divColorMap[div.type]">{{ getDivision(div.type)?.name ?? div.type }}</span>
              <span class="text-[10px] text-zinc-500 bg-zinc-800/80 px-1 rounded">Lv.{{ div.level }}</span>
              <span v-if="div.type !== 'administrative'" class="text-[10px]" :class="(jobStats.perDivision[i]?.filled ?? 0) < div.level ? 'text-amber-500' : 'text-zinc-600'">
                {{ jobStats.perDivision[i]?.filled ?? 0 }}/{{ div.level }}
              </span>
            </div>
            <button
              class="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30"
              :disabled="!canUpgradeDivision(systemIndex, planetIndex, i)"
              @click="upgradeDivision(systemIndex, planetIndex, i)"
            >
              ₢{{ formatNumber(getDivisionUpgradeCost(systemIndex, planetIndex, i)) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Policy row -->
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <button
            v-for="p in policies"
            :key="p.id"
            class="px-2 py-0.5 rounded text-[11px] transition-colors"
            :class="planet.policy === p.id
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'text-zinc-600 hover:text-zinc-300 border border-transparent'"
            @click="setPlanetPolicy(systemIndex, planetIndex, p.id)"
          >
            {{ p.label }}
          </button>
        </div>
        <button
          v-if="state.systems.filter(s => s.status === 'claimed').reduce((n, s) => n + s.planets.length, 0) > 1"
          class="text-[11px] text-zinc-500 hover:text-zinc-300"
          @click="showTransfer = true"
        >Transfer</button>
      </div>
    </div>

    <!-- Pop Transfer Modal -->
    <PlanetPopTransferModal v-model:open="showTransfer" :from-system-index="systemIndex" :from-planet-index="planetIndex" />
  </div>
</template>
