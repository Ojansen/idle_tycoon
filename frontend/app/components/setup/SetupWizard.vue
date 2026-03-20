<script setup lang="ts">
const emit = defineEmits<{
  complete: []
}>()

const { state } = useGameState()
const { traits } = useTraits()
const { saveGame } = useGamePersistence()

const companyName = ref('')
const companyDescription = ref('')
const selectedTraits = ref<string[]>([])
const showAccountId = ref(false)
const restoreMode = ref(false)
const restoreId = ref('')

const playerId = useCookie('megacorp-player-id')

const canSubmit = computed(() =>
  companyName.value.trim().length > 0 && selectedTraits.value.length === 3
)

function toggleTrait(traitId: string) {
  const idx = selectedTraits.value.indexOf(traitId)
  if (idx >= 0) {
    selectedTraits.value.splice(idx, 1)
  } else if (selectedTraits.value.length < 3) {
    selectedTraits.value.push(traitId)
  }
}

async function establish() {
  if (!canSubmit.value) return

  // Set company info but don't mark setup complete yet (show account ID first)
  state.value.companyName = companyName.value.trim()
  state.value.companyDescription = companyDescription.value.trim()
  state.value.companyTraits = [...selectedTraits.value]

  showAccountId.value = true
}

async function enterGame() {
  state.value.setupComplete = true
  await saveGame()
  showAccountId.value = false
  emit('complete')
}

async function restoreAccount() {
  const id = restoreId.value.trim()
  if (!id) return

  playerId.value = id
  // Reload to fetch the save with this ID
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
