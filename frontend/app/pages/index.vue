<script setup lang="ts">
const { state, tick } = useGameState()
const { loadGame, startAutoSave } = useGamePersistence()
const { simulatePrices } = useStockMarket()
const { tickExchange } = useResourceExchange()
const { checkAchievements, suppressExistingToasts } = useAchievements()

// Game tick - 100ms (includes price simulation + exchange decay)
useIntervalFn(() => {
  tick()
  simulatePrices()
  tickExchange(0.1)
}, 100)

// Achievement check - every 1s
useIntervalFn(() => {
  if (state.value.setupComplete) {
    checkAchievements()
  }
}, 1000)

// Tab state
const activeTab = ref('empire')

// Loading state
const loaded = ref(false)

// Offline earnings modal
const offlineData = ref<{ credits: number; energy: number; seconds: number } | null>(null)
const showOfflineModal = ref(false)

onMounted(async () => {
  const { offlineCredits, offlineEnergy, offlineSeconds } = await loadGame()
  suppressExistingToasts()
  if (offlineCredits > 0 || offlineEnergy > 0) {
    offlineData.value = { credits: offlineCredits, energy: offlineEnergy, seconds: offlineSeconds }
    showOfflineModal.value = true
  }
  startAutoSave()
  loaded.value = true
})

function onSetupComplete() {
  // Setup done, game will render
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Show setup wizard if not complete -->
    <template v-if="loaded && !state.setupComplete">
      <SetupWizard @complete="onSetupComplete" />
    </template>

    <!-- Game -->
    <template v-else-if="loaded">
      <GameHeader v-model:tab="activeTab" />

      <div class="flex-1 max-w-6xl mx-auto w-full px-4 py-4 space-y-4">
        <!-- Stats (always visible) -->
        <GameStatsBar />

        <!-- Kardashev Scale (always visible) -->
        <GameKardashevDisplay />

        <!-- Empire tab -->
        <div v-if="activeTab === 'empire'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Click area + upgrades -->
            <div class="space-y-4">
              <GameClickArea />
              <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
                <GameClickUpgrades />
              </div>
            </div>

            <!-- Buildings -->
            <div class="lg:col-span-2">
              <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
                <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Buildings</h2>
                <GameBuildingList />
              </div>
            </div>
          </div>
        </div>

        <!-- Prestige tab -->
        <div v-else-if="activeTab === 'prestige'">
          <GamePrestigePanel />
        </div>

        <!-- Research tab -->
        <div v-else-if="activeTab === 'research'">
          <ResearchView />
        </div>

        <!-- Market tab -->
        <div v-else-if="activeTab === 'market'">
          <MarketView />
        </div>

        <!-- Casino tab -->
        <div v-else-if="activeTab === 'casino'">
          <CasinoView />
        </div>

        <!-- Profile tab -->
        <div v-else-if="activeTab === 'profile'">
          <GameProfilePanel />
        </div>
      </div>

      <!-- Offline earnings modal -->
      <GameOfflineEarningsModal
        v-if="offlineData"
        v-model:open="showOfflineModal"
        :credits="offlineData.credits"
        :energy="offlineData.energy"
        :seconds="offlineData.seconds"
      />
    </template>
  </div>
</template>
