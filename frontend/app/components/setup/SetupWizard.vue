<script setup lang="ts">
import type { PlanetType } from '~/types/planet'

const emit = defineEmits<{
  complete: []
}>()

const { state } = useGameState()
const { traits } = useTraits()
const { planetTypes } = usePlanetConfig()
const { saveGame } = useGamePersistence()

const companyName = ref('')
const companyDescription = ref('')
const selectedTraits = ref<string[]>([])
const selectedPlanetType = ref<PlanetType>('garden')
const planetName = ref('')
const showAccountId = ref(false)
const restoreMode = ref(false)
const restoreId = ref('')

const playerId = useCookie('megacorp-player-id')

const canSubmit = computed(() =>
  companyName.value.trim().length > 0
  && selectedTraits.value.length === 3
  && selectedPlanetType.value
)

function toggleTrait(traitId: string) {
  const idx = selectedTraits.value.indexOf(traitId)
  if (idx >= 0) {
    selectedTraits.value.splice(idx, 1)
  } else if (selectedTraits.value.length < 3) {
    selectedTraits.value.push(traitId)
  }
}

const selectedTypeInfo = computed(() => planetTypes.find(t => t.type === selectedPlanetType.value))

// Bonus display for planet types
function formatBonus(value: number): string {
  if (value === 1) return ''
  const pct = Math.round((value - 1) * 100)
  return pct > 0 ? `+${pct}%` : `${pct}%`
}

const orbColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500 shadow-emerald-500/50',
  red: 'bg-red-500 shadow-red-500/50',
  blue: 'bg-blue-500 shadow-blue-500/50',
  amber: 'bg-amber-500 shadow-amber-500/50',
  cyan: 'bg-cyan-500 shadow-cyan-500/50',
  zinc: 'bg-zinc-500 shadow-zinc-500/50',
  yellow: 'bg-yellow-500 shadow-yellow-500/50',
}

const borderColorMap: Record<string, string> = {
  emerald: 'border-emerald-500',
  red: 'border-red-500',
  blue: 'border-blue-500',
  amber: 'border-amber-500',
  cyan: 'border-cyan-500',
  zinc: 'border-zinc-500',
  yellow: 'border-yellow-500',
}

const textColorMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  zinc: 'text-zinc-400',
  yellow: 'text-yellow-400',
}

const defaultNames: Record<string, string> = {
  garden: 'New Eden',
  volcanic: 'Ignis Prime',
  ocean: 'Oceanus',
  desert: 'Arrakis',
  ice: 'Cryos',
  barren: 'Desolation',
  gaia: 'Elysium',
}

async function establish() {
  if (!canSubmit.value) return

  state.value.companyName = companyName.value.trim()
  state.value.companyDescription = companyDescription.value.trim()
  state.value.companyTraits = [...selectedTraits.value]
  state.value.homeworldType = selectedPlanetType.value

  // Set homeworld name
  const name = planetName.value.trim() || defaultNames[selectedPlanetType.value] || 'Homeworld'
  if (state.value.systems[0]?.planets[0]) state.value.systems[0].planets[0].name = name

  showAccountId.value = true
}

async function enterGame() {
  state.value.setupComplete = true
  await saveGame()
  showAccountId.value = false
  emit('complete')
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const restoreError = ref('')

async function restoreAccount() {
  const id = restoreId.value.trim()
  if (!id) return
  if (!uuidRegex.test(id)) {
    restoreError.value = 'Invalid account ID format. Must be a valid UUID.'
    return
  }
  restoreError.value = ''
  playerId.value = id
  window.location.reload()
}

function copyAccountId() {
  navigator.clipboard.writeText(playerId.value || '')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8">
    <!-- Account ID reveal after setup -->
    <div v-if="showAccountId" class="max-w-lg w-full space-y-6 text-center">
      <UIcon name="i-lucide-check-circle" class="text-6xl text-green-400" />
      <h2 class="text-2xl font-bold text-white">{{ companyName }} Established</h2>
      <p class="text-sm text-zinc-400">Your account ID is your key to this empire. Save it to restore on another device.</p>

      <div class="rounded-lg bg-white/5 border border-white/10 p-4">
        <div class="text-xs text-zinc-500 mb-1">Account ID</div>
        <div class="flex items-center gap-2">
          <code class="text-sm text-violet-300 flex-1 break-all">{{ playerId }}</code>
          <UButton size="xs" color="neutral" variant="ghost" @click="copyAccountId">
            <UIcon name="i-lucide-copy" />
          </UButton>
        </div>
      </div>

      <UButton color="primary" size="lg" block @click="enterGame">
        Enter the Galaxy
      </UButton>
    </div>

    <!-- Setup wizard -->
    <div v-else-if="!restoreMode" class="max-w-3xl w-full space-y-8">
      <div class="text-center">
        <UIcon name="i-lucide-hexagon" class="text-6xl text-violet-500 mb-4" />
        <h1 class="text-3xl font-bold text-white tracking-tight">Establish Your MegaCorp</h1>
        <p class="text-sm text-zinc-400 mt-2">Define your corporation's identity and strategic direction.</p>
      </div>

      <!-- Company Name -->
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Corporation Name</label>
        <UInput
          v-model="companyName"
          placeholder="e.g. Stellar Dynamics Inc."
          size="lg"
          :maxlength="30"
        />
      </div>

      <!-- Company Description -->
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Mission Statement
          <span class="text-zinc-600 font-normal normal-case">(optional)</span>
        </label>
        <UTextarea
          v-model="companyDescription"
          placeholder="A brief description of your corporation's goals..."
          :maxlength="120"
          :rows="2"
        />
      </div>

      <!-- Traits -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Corporate Traits</label>
          <span class="text-xs" :class="selectedTraits.length === 3 ? 'text-green-400' : 'text-zinc-500'">
            {{ selectedTraits.length }}/3 selected
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="trait in traits"
            :key="trait.id"
            class="rounded-lg border p-3 cursor-pointer transition-all"
            :class="selectedTraits.includes(trait.id)
              ? 'border-violet-500 bg-violet-500/10'
              : selectedTraits.length >= 3
                ? 'border-zinc-800 bg-white/[0.02] opacity-40 cursor-not-allowed'
                : 'border-zinc-700 bg-white/[0.03] hover:border-zinc-500'"
            @click="toggleTrait(trait.id)"
          >
            <div class="flex items-center gap-2 mb-2">
              <UIcon :name="trait.icon" class="text-lg text-violet-400" />
              <span class="text-sm font-medium text-white">{{ trait.name }}</span>
              <UIcon v-if="selectedTraits.includes(trait.id)" name="i-lucide-check" class="text-green-400 ml-auto" />
            </div>
            <p class="text-xs text-zinc-500 mb-2">{{ trait.description }}</p>
            <div class="flex gap-3 text-xs">
              <span class="text-green-400">{{ trait.bonus.label }}</span>
              <span class="text-red-400">{{ trait.malus.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Homeworld Selection -->
      <div class="space-y-3">
        <label class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Homeworld</label>

        <!-- Planet type grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="pt in planetTypes"
            :key="pt.type"
            class="rounded-lg border p-3 cursor-pointer transition-all text-center"
            :class="selectedPlanetType === pt.type
              ? (borderColorMap[pt.color] || 'border-white') + ' bg-white/5'
              : 'border-zinc-700 bg-white/[0.02] hover:border-zinc-500'"
            @click="selectedPlanetType = pt.type as PlanetType"
          >
            <!-- Orb -->
            <div class="mx-auto w-10 h-10 rounded-full shadow-lg mb-2"
              :class="orbColorMap[pt.color]"
            />
            <div class="text-xs font-medium" :class="selectedPlanetType === pt.type ? textColorMap[pt.color] : 'text-zinc-300'">
              {{ pt.name }}
            </div>
            <!-- Bonuses -->
            <div class="mt-1 space-y-0.5">
              <div v-if="pt.bonuses.credits !== 1" class="text-[10px]" :class="pt.bonuses.credits > 1 ? 'text-emerald-400' : 'text-red-400'">
                {{ formatBonus(pt.bonuses.credits) }} ₢
              </div>
              <div v-if="pt.bonuses.cg !== 1" class="text-[10px]" :class="pt.bonuses.cg > 1 ? 'text-emerald-400' : 'text-red-400'">
                {{ formatBonus(pt.bonuses.cg) }} CG
              </div>
              <div v-if="pt.bonuses.popGrowth !== 1" class="text-[10px]" :class="pt.bonuses.popGrowth > 1 ? 'text-emerald-400' : 'text-red-400'">
                {{ formatBonus(pt.bonuses.popGrowth) }} Growth
              </div>
              <div v-if="pt.maintenanceModifier !== 1" class="text-[10px]" :class="pt.maintenanceModifier < 1 ? 'text-emerald-400' : 'text-red-400'">
                {{ pt.maintenanceModifier < 1 ? '-' + Math.round((1 - pt.maintenanceModifier) * 100) + '%' : '+' + Math.round((pt.maintenanceModifier - 1) * 100) + '%' }} Maintenance
              </div>
            </div>
          </div>
        </div>

        <!-- Planet name -->
        <UInput
          v-model="planetName"
          :placeholder="defaultNames[selectedPlanetType] || 'Name your homeworld'"
          size="lg"
          :maxlength="20"
        />
      </div>

      <!-- Submit -->
      <UButton
        color="primary"
        size="lg"
        block
        :disabled="!canSubmit"
        @click="establish"
      >
        Establish Corporation
      </UButton>

      <!-- Restore link -->
      <div class="text-center">
        <button class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" @click="restoreMode = true">
          Have an account ID? Restore your empire
        </button>
      </div>
    </div>

    <!-- Restore account -->
    <div v-else class="max-w-md w-full space-y-6">
      <div class="text-center">
        <UIcon name="i-lucide-key" class="text-4xl text-amber-400 mb-3" />
        <h2 class="text-xl font-bold text-white">Restore Account</h2>
        <p class="text-sm text-zinc-400 mt-2">Paste your account ID to restore your empire on this device.</p>
      </div>

      <UInput
        v-model="restoreId"
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        size="lg"
      />
      <p v-if="restoreError" class="text-xs text-red-400">{{ restoreError }}</p>

      <div class="flex gap-3">
        <UButton color="neutral" variant="outline" block @click="restoreMode = false">
          Back
        </UButton>
        <UButton color="primary" block :disabled="!restoreId.trim()" @click="restoreAccount">
          Restore
        </UButton>
      </div>
    </div>
  </div>
</template>
