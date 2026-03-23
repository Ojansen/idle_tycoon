<script setup lang="ts">
const { state, tick } = useGameState()
const { loadGame, startAutoSave } = useGamePersistence()
const { checkAchievements, suppressExistingToasts } = useAchievements()
const { sample: sampleHistory } = useProductionHistory()

// Game tick - 100ms
useIntervalFn(() => {
  tick()
}, 100)

// Achievement check + production history sampling - every 1s
useIntervalFn(() => {
  if (state.value.setupComplete) {
    checkAchievements()
    sampleHistory()
  }
}, 1000)

// Tab state
const activeTab = ref('planets')

// Loading state
const loaded = ref(false)

// Offline earnings modal
const offlineData = ref<{ credits: number; seconds: number } | null>(null)
const showOfflineModal = ref(false)

// Victory modal
const showVictoryModal = ref(false)

watch(
  () => state.value.megastructures.omega_structure?.completed,
  (completed) => {
    if (completed && !state.value.victoryAchieved) {
      state.value.victoryAchieved = true
      showVictoryModal.value = true
    }
  }
)

onMounted(async () => {
  const { offlineCredits, offlineSeconds } = await loadGame()
  suppressExistingToasts()
  if (offlineCredits > 0) {
    offlineData.value = { credits: offlineCredits, seconds: offlineSeconds }
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
      <div class="sticky top-0 z-50">
        <GameHeader v-model:tab="activeTab" />
        <GameStatsBar />
      </div>

      <div class="flex-1 max-w-6xl mx-auto w-full px-4 py-4 space-y-4">

        <!-- Kardashev Scale (always visible) -->
        <GameKardashevDisplay />

        <!-- Planets tab -->
        <div v-if="activeTab === 'planets'">
          <PlanetList />
        </div>

        <!-- Overview tab -->
        <div v-else-if="activeTab === 'overview'">
          <GameOverviewPanel />
        </div>

        <!-- Prestige tab -->
        <div v-else-if="activeTab === 'prestige'">
          <GamePrestigePanel />
        </div>

        <!-- Research tab -->
        <div v-else-if="activeTab === 'research'">
          <ResearchView />
        </div>

        <!-- Trade tab -->
        <div v-else-if="activeTab === 'trade'">
          <GameTradePanel />
        </div>

        <!-- Stats tab -->
        <div v-else-if="activeTab === 'stats'">
          <GameStatsPanel />
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
        :seconds="offlineData.seconds"
      />

      <!-- Victory modal -->
      <GameVictoryModal v-model:open="showVictoryModal" />
    </template>
  </div>
</template>
