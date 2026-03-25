<script setup lang="ts">
import type { DivisionType } from '~/types/planet'

const props = defineProps<{
  systemIndex: number
  planetIndex: number
  slotIndex: number
}>()

const { state } = useGameState()
const { assignDivision, upgradeDivision, canUpgradeDivision, getDivisionUpgradeCost, getAssignCost } = usePlanetActions()
const { getDivision, divisions } = usePlanetConfig()

const isMaxLevel = computed(() => (division.value?.level ?? 0) >= 10)
const { formatNumber } = useNumberFormat()

const planet = computed(() => state.value.systems[props.systemIndex]?.planets[props.planetIndex])
const division = computed(() => planet.value?.divisions[props.slotIndex] ?? null)
const divDef = computed(() => division.value ? getDivision(division.value.type) : null)

const upgradeCost = computed(() => getDivisionUpgradeCost(props.systemIndex, props.planetIndex, props.slotIndex))
const canAffordUpgrade = computed(() => canUpgradeDivision(props.systemIndex, props.planetIndex, props.slotIndex))

const dropdownOpen = ref(false)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleAssign(divType: DivisionType) {
  assignDivision(props.systemIndex, props.planetIndex, props.slotIndex, divType)
  closeDropdown()
}

function handleUpgrade() {
  upgradeDivision(props.systemIndex, props.planetIndex, props.slotIndex)
}

const colorMap: Record<string, string> = {
  amber: 'text-amber-400',
  emerald: 'text-emerald-400',
  violet: 'text-violet-400',
  sky: 'text-sky-400',
}

const borderColorMap: Record<string, string> = {
  amber: 'border-amber-500/40 bg-amber-500/5',
  emerald: 'border-emerald-500/40 bg-emerald-500/5',
  violet: 'border-violet-500/40 bg-violet-500/5',
  sky: 'border-sky-500/40 bg-sky-500/5',
}

const badgeColorMap: Record<string, string> = {
  amber: 'bg-amber-500/20 text-amber-300',
  emerald: 'bg-emerald-500/20 text-emerald-300',
  violet: 'bg-violet-500/20 text-violet-300',
  sky: 'bg-sky-500/20 text-sky-300',
}

const hoverMap: Record<string, string> = {
  amber: 'hover:bg-amber-500/10',
  emerald: 'hover:bg-emerald-500/10',
  violet: 'hover:bg-violet-500/10',
  sky: 'hover:bg-sky-500/10',
}
</script>

<template>
  <div class="relative">
    <!-- Empty slot -->
    <template v-if="!division">
      <button
        class="w-full rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3 flex flex-col items-center justify-center gap-1 min-h-[88px] hover:border-white/30 hover:bg-white/[0.04] transition-colors"
        @click="toggleDropdown"
      >
        <UIcon name="i-lucide-plus" class="text-xl text-zinc-500" />
        <span class="text-xs text-zinc-600">Add Division</span>
      </button>
    </template>

    <!-- Filled slot -->
    <template v-else-if="divDef">
      <div
        class="rounded-lg border p-3 min-h-[88px] flex flex-col gap-2 transition-colors cursor-pointer"
        :class="borderColorMap[divDef.color] ?? 'border-white/10 bg-white/[0.03]'"
        @click="toggleDropdown"
      >
        <!-- Header row: icon + name + level badge -->
        <div class="flex items-center gap-1.5">
          <UIcon
            :name="divDef.icon"
            class="text-base shrink-0"
            :class="colorMap[divDef.color] ?? 'text-zinc-400'"
          />
          <span class="text-xs font-medium text-zinc-200 truncate flex-1 leading-tight">{{ divDef.name }}</span>
          <span
            class="shrink-0 text-[10px] font-bold px-1 py-0.5 rounded leading-none"
            :class="badgeColorMap[divDef.color] ?? 'bg-white/10 text-zinc-300'"
          >
            Lv.{{ division.level }}
          </span>
        </div>

        <!-- Upgrade button -->
        <div class="mt-auto" @click.stop>
          <UButton
            v-if="isMaxLevel"
            size="xs"
            variant="soft"
            color="neutral"
            disabled
            class="w-full justify-center text-[10px]"
          >
            MAX
          </UButton>
          <UButton
            v-else
            size="xs"
            variant="soft"
            :color="canAffordUpgrade ? 'primary' : 'neutral'"
            :disabled="!canAffordUpgrade"
            class="w-full justify-center text-[10px]"
            @click="handleUpgrade"
          >
            <UIcon name="i-lucide-arrow-up" class="text-xs" />
            ₢{{ formatNumber(upgradeCost) }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="dropdownOpen"
        class="absolute z-20 top-full mt-1 left-0 right-0 min-w-[160px] rounded-lg border border-white/10 bg-zinc-900 shadow-xl py-1"
      >
        <div class="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          {{ division ? 'Reassign' : 'Assign' }} Division
        </div>
        <button
          v-for="div in divisions"
          :key="div.type"
          class="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors"
          :class="hoverMap[div.color] ?? 'hover:bg-white/5'"
          @click="handleAssign(div.type as DivisionType)"
        >
          <UIcon
            :name="div.icon"
            class="text-sm shrink-0"
            :class="colorMap[div.color] ?? 'text-zinc-400'"
          />
          <span class="flex-1 text-xs text-zinc-200">{{ div.name }}</span>
          <span class="text-[10px] text-zinc-500 tabular-nums shrink-0">
            ₢{{ formatNumber(getAssignCost(systemIndex, planetIndex, slotIndex, div.type as DivisionType)) }}
          </span>
        </button>
      </div>
    </Transition>

    <!-- Click-outside overlay -->
    <div
      v-if="dropdownOpen"
      class="fixed inset-0 z-10"
      @click="closeDropdown"
    />
  </div>
</template>
