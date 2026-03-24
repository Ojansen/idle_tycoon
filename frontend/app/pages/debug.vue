<script setup lang="ts">
const results = ref<string[]>(['Loading...'])

onMounted(async () => {
  const r: string[] = []

  try {
    const { state } = useGameState()
    r.push('gameState OK, setupComplete=' + state.value.setupComplete + ', planets=' + state.value.systems.filter(s => s.status === 'claimed').reduce((n, s) => n + s.planets.length, 0))

    // Try loading saved game
    const { loadGame } = useGamePersistence()
    await loadGame()
    r.push('loadGame OK')
    r.push('after load: setupComplete=' + state.value.setupComplete + ', planets=' + state.value.systems.filter(s => s.status === 'claimed').reduce((n, s) => n + s.planets.length, 0))

    // If old save detected, show traits
    r.push('companyTraits: ' + JSON.stringify(state.value.companyTraits))

    // Force setupComplete for testing
    if (!state.value.setupComplete) {
      r.push('NOTE: setupComplete is false - you need to complete the setup wizard first')
      r.push('Setting setupComplete=true for testing...')
      state.value.setupComplete = true
      state.value.companyName = state.value.companyName || 'Debug Corp'
      state.value.companyTraits = state.value.companyTraits?.length ? state.value.companyTraits : ['ruthless_exploiters', 'mass_producer', 'colonial_pioneers']
    }

    r.push('DONE - go to / to see the game')
  } catch (e: any) {
    r.push('ERROR: ' + e.message + '\n' + e.stack?.substring(0, 500))
  }

  results.value = r
})
</script>

<template>
  <div style="padding: 20px; color: white; font-family: monospace; font-size: 13px; background: #111; min-height: 100vh; line-height: 2;">
    <h1 style="font-size: 18px; margin-bottom: 12px;">Debug</h1>
    <div v-for="(line, i) in results" :key="i" :style="line.includes('ERROR') ? 'color: red' : line.includes('OK') ? 'color: lime' : 'color: #ccc'">
      {{ line }}
    </div>
  </div>
</template>
