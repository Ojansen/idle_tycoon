<script setup lang="ts">
const { state } = useGameState()
const { traits } = useTraits()
const { formatNumber } = useNumberFormat()

const playerId = useCookie('megacorp-player-id')

const companyTraitDefs = computed(() =>
  (state.value.companyTraits || [])
    .map(id => traits.find(t => t.id === id))
    .filter(Boolean)
)

const showRestore = ref(false)
const restoreId = ref('')
const copied = ref(false)

function copyAccountId() {
  navigator.clipboard.writeText(playerId.value || '')
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function restoreAccount() {
  const id = restoreId.value.trim()
  if (!id) return
  playerId.value = id
  window.location.reload()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-user-circle" class="text-xl text-violet-400" />
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Corporation Profile</h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Company info -->
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5 space-y-4">
        <div>
          <div class="text-xs text-zinc-500 mb-1">Corporation Name</div>
          <div class="text-xl font-bold text-white">{{ state.companyName }}</div>
        </div>

        <div v-if="state.companyDescription">
          <div class="text-xs text-zinc-500 mb-1">Mission Statement</div>
          <div class="text-sm text-zinc-300">{{ state.companyDescription }}</div>
        </div>

        <div>
          <div class="text-xs text-zinc-500 mb-2">Corporate Traits</div>
          <div class="space-y-2">
            <div
              v-for="trait in companyTraitDefs"
              :key="trait!.id"
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20"
            >
              <UIcon :name="trait!.icon" class="text-lg text-violet-400" />
              <div class="flex-1">
                <div class="text-sm font-medium text-white">{{ trait!.name }}</div>
                <div class="flex gap-3 text-xs">
                  <span class="text-green-400">{{ trait!.bonus.label }}</span>
                  <span class="text-red-400">{{ trait!.malus.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account & Stats -->
      <div class="space-y-4">
        <!-- Account ID -->
        <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5 space-y-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Account ID</div>
          <p class="text-xs text-zinc-500">Use this ID to restore your empire on another device.</p>
          <div class="flex items-center gap-2 rounded bg-zinc-900 px-3 py-2">
            <code class="text-sm text-violet-300 flex-1 break-all select-all">{{ playerId }}</code>
            <UButton size="xs" color="neutral" variant="ghost" @click="copyAccountId">
              <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
            </UButton>
          </div>

          <button
            class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            @click="showRestore = !showRestore"
          >
            Restore a different account
          </button>

          <div v-if="showRestore" class="space-y-2 pt-2 border-t border-white/5">
            <UInput
              v-model="restoreId"
              placeholder="Paste account ID..."
              size="sm"
            />
            <UButton
              size="sm"
              color="warning"
              :disabled="!restoreId.trim()"
              block
              @click="restoreAccount"
            >
              Restore Account
            </UButton>
            <p class="text-xs text-red-400">This will replace your current save on this device.</p>
          </div>
        </div>

        <!-- Stats summary -->
        <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5">
          <div class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Statistics</div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-zinc-500">Total Clicks</div>
              <div class="text-white font-medium">{{ formatNumber(state.totalClicks) }}</div>
            </div>
            <div>
              <div class="text-zinc-500">Total Credits Earned</div>
              <div class="text-white font-medium">₢{{ formatNumber(state.totalCreditsEarned) }}</div>
            </div>
            <div>
              <div class="text-zinc-500">Total Energy Earned</div>
              <div class="text-white font-medium">{{ formatNumber(state.totalEnergyEarned) }} TW</div>
            </div>
            <div>
              <div class="text-zinc-500">Prestige Count</div>
              <div class="text-white font-medium">{{ state.prestigeCount }}</div>
            </div>
            <div>
              <div class="text-zinc-500">Influence</div>
              <div class="text-amber-400 font-medium">{{ state.influence }}</div>
            </div>
            <div>
              <div class="text-zinc-500">Kardashev Record</div>
              <div class="text-white font-medium">Type {{ state.kardashevHighWaterMark }}</div>
            </div>
            <div>
              <div class="text-zinc-500">Casino Games</div>
              <div class="text-white font-medium">{{ state.casinoStats.gamesPlayed }}</div>
            </div>
            <div>
              <div class="text-zinc-500">Casino P/L</div>
              <div :class="state.casinoStats.totalWon >= state.casinoStats.totalWagered ? 'text-green-400' : 'text-red-400'" class="font-medium">
                ₢{{ formatNumber(state.casinoStats.totalWon - state.casinoStats.totalWagered) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Achievements -->
    <div class="rounded-lg bg-white/[0.03] border border-white/10 p-5">
      <GameAchievementGrid />
    </div>
  </div>
</template>
