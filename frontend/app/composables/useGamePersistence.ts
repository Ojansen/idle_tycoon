export function useGamePersistence() {
  const { state, loadState } = useGameState()
  const playerId = useCookie('megacorp-player-id', {
    maxAge: 365 * 24 * 60 * 60,
    path: '/'
  })

  // Ensure player has an ID
  if (import.meta.client && !playerId.value) {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    arr[6] = (arr[6] & 0x0f) | 0x40
    arr[8] = (arr[8] & 0x3f) | 0x80
    const hex = [...arr].map(b => b.toString(16).padStart(2, '0')).join('')
    playerId.value = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  async function saveGame() {
    state.value.lastSaveTimestamp = Date.now()
    try {
      await $fetch('/api/game/save', {
        method: 'POST',
        body: { state: JSON.stringify(state.value) }
      })
    } catch (e) {
      console.warn('Failed to save game:', e)
    }
  }

  async function loadGame(): Promise<{ offlineCredits: number; offlineEnergy: number; offlineSeconds: number }> {
    try {
      const { state: saved } = await $fetch('/api/game/load')
      if (!saved) return { offlineCredits: 0, offlineEnergy: 0, offlineSeconds: 0 }

      loadState(saved as any)

      // Calculate offline earnings
      const now = Date.now()
      const elapsed = (now - state.value.lastSaveTimestamp) / 1000
      const maxOffline = 24 * 60 * 60 // 24h cap
      const cappedElapsed = Math.min(elapsed, maxOffline)

      if (cappedElapsed > 10) {
        const { netCreditsPerSecond, netEnergyPerSecond } = useUpkeep()
        const offlineCredits = Math.max(0, cappedElapsed * netCreditsPerSecond.value)
        const offlineEnergy = Math.max(0, cappedElapsed * netEnergyPerSecond.value)

        state.value.credits += offlineCredits
        state.value.totalCreditsEarned += offlineCredits
        state.value.energy += offlineEnergy
        state.value.totalEnergyEarned += offlineEnergy
        state.value.lastSaveTimestamp = now

        return { offlineCredits, offlineEnergy, offlineSeconds: cappedElapsed }
      }

      state.value.lastSaveTimestamp = now
      return { offlineCredits: 0, offlineEnergy: 0, offlineSeconds: 0 }
    } catch (e) {
      console.warn('Failed to load game:', e)
      return { offlineCredits: 0, offlineEnergy: 0, offlineSeconds: 0 }
    }
  }

  // Debounced save — triggers 2s after last state change (catches purchases)
  const debouncedSave = useDebounceFn(saveGame, 2000)

  function startAutoSave() {
    // Periodic save every 30s
    const { pause } = useIntervalFn(saveGame, 30000)

    // Watch for building/upgrade purchases and save shortly after
    watch(() => [
      Object.keys(state.value.buildings).length + Object.values(state.value.buildings).reduce((a, b) => a + b, 0),
      state.value.clickUpgradeLevel,
      state.value.prestigeUpgradesBought.length,
      state.value.prestigeCount
    ], () => {
      debouncedSave()
    })

    // Save on page unload (tab close, navigate away, refresh)
    useEventListener(window, 'beforeunload', () => {
      state.value.lastSaveTimestamp = Date.now()
      const body = JSON.stringify({ state: JSON.stringify(state.value) })
      navigator.sendBeacon('/api/game/save', new Blob([body], { type: 'application/json' }))
    })

    return pause
  }

  return {
    saveGame,
    loadGame,
    startAutoSave,
    playerId
  }
}
