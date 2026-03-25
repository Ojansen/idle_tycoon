<script setup lang="ts">
const { state, tick } = useGameState()
const { loadGame, startAutoSave } = useGamePersistence()
const { checkAchievements, suppressExistingToasts } = useAchievements()
const { sample: sampleHistory } = useProductionHistory()

// Game tick - 100ms
useIntervalFn(() => {
  if (state.value.setupComplete) {
    try { tick() } catch (e) { console.error('tick error:', e) }
  }
}, 100)

// Achievement check + production history sampling - every 1s
useIntervalFn(() => {
  if (state.value.setupComplete) {
    checkAchievements()
    sampleHistory()
  }
}, 1000)

// Tab state
const activeTab = ref('galaxy')

// Loading + flow state
const loaded = ref(false)
const showLanding = ref(true)
const loadError = ref('')

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
  try {
    await loadGame()
    suppressExistingToasts()
    startAutoSave()
  } catch (e: any) {
    loadError.value = e.message + '\n' + (e.stack?.substring(0, 300) ?? '')
    console.error('Load failed:', e)
  }
  // Skip landing for returning players
  if (state.value.setupComplete) showLanding.value = false
  loaded.value = true
})

function onSetupComplete() {
  // Setup done, game will render via reactivity
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading -->
    <Transition name="fade" mode="out-in">
      <div v-if="!loaded" key="loading" class="min-h-screen flex items-center justify-center">
        <div class="text-zinc-500 text-sm">Loading...</div>
      </div>

      <!-- Landing page (new players only) -->
      <div v-else-if="showLanding && !state.setupComplete" key="landing">
        <SetupLandingPage @start="showLanding = false" />
      </div>

      <!-- Setup wizard -->
      <div v-else-if="!state.setupComplete" key="setup">
        <SetupWizard @complete="onSetupComplete" />
      </div>

      <!-- Game -->
      <div v-else key="game" class="flex flex-col min-h-screen">
        <div class="sticky top-0 z-50">
          <GameHeader v-model:tab="activeTab" />
          <GameStatsBar />
        </div>

        <div class="flex-1 max-w-6xl mx-auto w-full px-4 py-4 space-y-4">
          <div v-if="activeTab === 'galaxy'">
            <GalaxyView />
          </div>
          <div v-else-if="activeTab === 'overview'">
            <GameOverviewPanel />
          </div>
          <div v-else-if="activeTab === 'research'">
            <ResearchView />
          </div>
          <div v-else-if="activeTab === 'trade'">
            <GameTradePanel />
          </div>
          <div v-else-if="activeTab === 'stats'">
            <GameStatsPanel />
          </div>
          <div v-else-if="activeTab === 'profile'">
            <GameProfilePanel />
          </div>
        </div>

        <GameVictoryModal v-model:open="showVictoryModal" />
      </div>
    </Transition>

    <!-- Error display -->
    <div v-if="loadError" class="fixed bottom-0 left-0 right-0 text-red-400 p-4 font-mono text-xs bg-zinc-950/90">{{ loadError }}</div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
