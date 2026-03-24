<script setup lang="ts">
const { state, tick } = useGameState()
const { loadGame, startAutoSave } = useGamePersistence()
const { checkAchievements, suppressExistingToasts } = useAchievements()
const { sample: sampleHistory } = useProductionHistory()

// Game tick - 100ms
useIntervalFn(() => {
  try { tick() } catch (e) { console.error('tick error:', e) }
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

// Loading state
const loaded = ref(false)

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

const loadError = ref('')

onMounted(async () => {
  try {
    await loadGame()
    suppressExistingToasts()
    startAutoSave()
  } catch (e: any) {
    loadError.value = e.message + '\n' + (e.stack?.substring(0, 300) ?? '')
    console.error('Load failed:', e)
  }
  loaded.value = true
})

function onSetupComplete() {
  // Setup done, game will render
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading -->
    <div v-if="!loaded" class="text-white p-4">Loading game...</div>
    <div v-if="loadError" class="text-red-400 p-4 font-mono text-xs whitespace-pre-wrap">{{ loadError }}</div>

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

        <!-- Galaxy tab -->
        <div v-if="activeTab === 'galaxy'">
          <div class="text-white text-xs p-2 mb-2">Systems: {{ state.systems?.length ?? 'none' }}, claimed: {{ state.systems?.filter(s => s.status === 'claimed').length ?? 0 }}</div>
          <GalaxyView />
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

      <!-- Victory modal -->
      <GameVictoryModal v-model:open="showVictoryModal" />
    </template>
  </div>
</template>
