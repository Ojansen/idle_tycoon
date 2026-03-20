export function useCasino() {
  const { state, getTraitMultiplier, getRepeatableMultiplier } = useGameState()

  const casinoDisabled = computed(() =>
    (state.value.companyTraits || []).includes('risk_averse')
  )

  const { getAscensionMultiplier } = useAscensionPerks()

  const casinoWinningsMultiplier = computed(() =>
    getTraitMultiplier('casinoMultiplier') * getAscensionMultiplier('casinoMultiplier') * getRepeatableMultiplier('casinoMultiplier')
  )

  function canWager(amount: number): boolean {
    return !casinoDisabled.value && amount > 0 && amount <= state.value.credits
  }

  function placeWager(amount: number): boolean {
    if (!canWager(amount)) return false
    state.value.credits -= amount
    state.value.casinoStats.totalWagered += amount
    state.value.casinoStats.gamesPlayed++
    return true
  }

  function collectWinnings(amount: number) {
    const boosted = Math.floor(amount * casinoWinningsMultiplier.value)
    state.value.credits += boosted
    state.value.casinoStats.totalWon += boosted
  }

  function generateCrashPoint(): number {
    return Math.max(1.0, 0.97 / (1 - Math.random()))
  }

  return {
    casinoDisabled,
    casinoWinningsMultiplier,
    canWager,
    placeWager,
    collectWinnings,
    generateCrashPoint
  }
}
