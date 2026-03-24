<script setup lang="ts">
const props = defineProps<{
  fromSystemIndex: number
  fromPlanetIndex: number
}>()

const open = defineModel<boolean>('open', { default: false })

const { state } = useGameState()
const { getTransferCost, canTransferPops, transferPops } = usePlanetActions()
const { formatNumber } = useNumberFormat()

// ── Source planet ──

const sourcePlanet = computed(() => state.value.systems[props.fromSystemIndex]?.planets[props.fromPlanetIndex])

// Maximum pops that can be sent (must leave at least 1 behind)
const maxTransferable = computed(() => Math.max(0, (sourcePlanet.value?.pops ?? 1) - 1))

// ── Target planet selection ──

interface TargetEntry {
  planet: typeof sourcePlanet.value
  systemIndex: number
  planetIndex: number
}

const targetPlanets = computed((): TargetEntry[] => {
  const results: TargetEntry[] = []
  for (let si = 0; si < state.value.systems.length; si++) {
    const sys = state.value.systems[si]
    if (!sys || sys.status !== 'claimed') continue
    for (let pi = 0; pi < sys.planets.length; pi++) {
      if (si === props.fromSystemIndex && pi === props.fromPlanetIndex) continue
      results.push({ planet: sys.planets[pi]!, systemIndex: si, planetIndex: pi })
    }
  }
  return results
})

const selectedTarget = ref<{ systemIndex: number; planetIndex: number } | null>(null)

// ── Pop count ──

const popCount = ref(1)

// Keep popCount in bounds whenever source pops or selection changes
watch([maxTransferable, open], () => {
  popCount.value = Math.min(Math.max(1, popCount.value), maxTransferable.value)
})

// Reset state when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    const first = targetPlanets.value[0]
    selectedTarget.value = first ? { systemIndex: first.systemIndex, planetIndex: first.planetIndex } : null
    popCount.value = 1
  }
})

function isSelected(entry: TargetEntry): boolean {
  return selectedTarget.value !== null
    && selectedTarget.value.systemIndex === entry.systemIndex
    && selectedTarget.value.planetIndex === entry.planetIndex
}

// ── Cost & validity ──

const transferCost = computed(() => {
  if (!selectedTarget.value) return 0
  return getTransferCost(
    props.fromSystemIndex, props.fromPlanetIndex,
    selectedTarget.value.systemIndex, selectedTarget.value.planetIndex,
    popCount.value
  )
})

const canTransfer = computed(() => {
  if (!selectedTarget.value) return false
  return canTransferPops(
    props.fromSystemIndex, props.fromPlanetIndex,
    selectedTarget.value.systemIndex, selectedTarget.value.planetIndex,
    popCount.value
  )
})

// ── Actions ──

function decrement() {
  if (popCount.value > 1) popCount.value--
}

function increment() {
  if (popCount.value < maxTransferable.value) popCount.value++
}

function clampPopCount() {
  const val = Math.floor(popCount.value)
  popCount.value = Math.min(Math.max(1, isNaN(val) ? 1 : val), maxTransferable.value)
}

function confirm() {
  if (!selectedTarget.value) return
  const success = transferPops(
    props.fromSystemIndex, props.fromPlanetIndex,
    selectedTarget.value.systemIndex, selectedTarget.value.planetIndex,
    popCount.value
  )
  if (success) open.value = false
}

function cancel() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Transfer Pops" description="Relocate population to another planet">
    <template #content>
      <div class="p-6 space-y-4">

        <!-- Source planet -->
        <div>
          <p class="text-sm text-zinc-300 mb-1">From</p>
          <div class="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
            <UIcon name="i-lucide-globe" class="text-violet-400 shrink-0" />
            <span class="text-sm font-medium text-white">{{ sourcePlanet?.name ?? '—' }}</span>
            <span class="ml-auto text-xs text-zinc-500">{{ sourcePlanet?.pops ?? 0 }} pops</span>
          </div>
        </div>

        <!-- Target planet selection -->
        <div>
          <p class="text-sm text-zinc-300 mb-2">To</p>
          <div v-if="targetPlanets.length === 0" class="text-sm text-zinc-500 italic">
            No other planets available.
          </div>
          <div v-else class="space-y-1.5">
            <button
              v-for="entry in targetPlanets"
              :key="`${entry.systemIndex}-${entry.planetIndex}`"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left"
              :class="isSelected(entry)
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'"
              @click="selectedTarget = { systemIndex: entry.systemIndex, planetIndex: entry.planetIndex }"
            >
              <UIcon
                name="i-lucide-globe"
                class="shrink-0"
                :class="isSelected(entry) ? 'text-amber-400' : 'text-zinc-500'"
              />
              <span
                class="text-sm font-medium flex-1"
                :class="isSelected(entry) ? 'text-white' : 'text-zinc-300'"
              >
                {{ entry.planet?.name }}
              </span>
              <span class="text-xs text-zinc-500 tabular-nums">{{ entry.planet?.pops }} pops</span>
              <UIcon
                v-if="isSelected(entry)"
                name="i-lucide-check"
                class="text-amber-400 shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Pop count -->
        <div>
          <p class="text-sm text-zinc-300 mb-2">Pops to transfer</p>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-minus"
              color="neutral"
              variant="outline"
              size="sm"
              :disabled="popCount <= 1"
              @click="decrement"
            />
            <input
              v-model.number="popCount"
              type="number"
              min="1"
              :max="maxTransferable"
              class="w-20 text-center bg-white/[0.05] border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              @blur="clampPopCount"
              @keydown.enter="clampPopCount"
            />
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              variant="outline"
              size="sm"
              :disabled="popCount >= maxTransferable"
              @click="increment"
            />
            <span class="text-xs text-zinc-500 ml-1">/ {{ maxTransferable }} max</span>
          </div>
        </div>

        <!-- Transfer cost -->
        <div class="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2">
          <span class="text-sm text-zinc-300">Transfer cost</span>
          <span class="text-sm font-semibold text-amber-400 tabular-nums">
            ₢{{ formatNumber(transferCost) }}
          </span>
        </div>

        <!-- Insufficient credits warning -->
        <p
          v-if="selectedTarget !== null && !canTransfer && maxTransferable > 0"
          class="text-xs text-red-400 flex items-center gap-1.5"
        >
          <UIcon name="i-lucide-alert-circle" />
          Insufficient credits for this transfer.
        </p>

        <!-- No pops to transfer warning -->
        <p
          v-if="maxTransferable === 0"
          class="text-xs text-zinc-500 flex items-center gap-1.5"
        >
          <UIcon name="i-lucide-info" />
          This planet only has one pop and cannot transfer any.
        </p>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 pt-1">
          <UButton
            color="neutral"
            variant="outline"
            @click="cancel"
          >
            Cancel
          </UButton>
          <UButton
            color="warning"
            :disabled="!canTransfer"
            @click="confirm"
          >
            Transfer
          </UButton>
        </div>

      </div>
    </template>
  </UModal>
</template>
