import {
  BASE_RATE,
  ENERGY_PRESSURE_K,
  CREDITS_PRESSURE_K,
  PRESSURE_DECAY_RATE,
  calcCreditsReceived,
  calcEnergyReceived,
  calcExchangeRate,
  calcMarketHealth,
  calcPressureDecay
} from '~/utils/gameMath'

// Ephemeral module-level state (resets on page load, like stock prices)
const energyPressure = ref(0)
const creditsPressure = ref(0)

export function useResourceExchange() {
  const { state } = useGameState()

  // Spot rates (what 1 unit gets you right now, before pressure from the trade itself)
  const energyToCreditsRate = computed(() => {
    return calcExchangeRate(BASE_RATE, ENERGY_PRESSURE_K, energyPressure.value)
  })

  const creditsToEnergyRate = computed(() => {
    return calcExchangeRate(1 / BASE_RATE, CREDITS_PRESSURE_K, creditsPressure.value)
  })

  // Market health: 100% = no pressure, approaches 0% when heavily flooded
  const energyMarketHealth = computed(() => {
    return calcMarketHealth(ENERGY_PRESSURE_K, energyPressure.value)
  })

  const creditsMarketHealth = computed(() => {
    return calcMarketHealth(CREDITS_PRESSURE_K, creditsPressure.value)
  })

  function previewSellEnergy(amount: number) {
    const qty = Math.min(amount, state.value.energy)
    if (qty <= 0) return { spent: 0, received: 0, avgRate: BASE_RATE }
    const received = calcCreditsReceived(qty, energyPressure.value)
    return { spent: qty, received, avgRate: received / qty }
  }

  function previewSellCredits(amount: number) {
    const qty = Math.min(amount, state.value.credits)
    if (qty <= 0) return { spent: 0, received: 0, avgRate: BASE_RATE }
    const received = calcEnergyReceived(qty, creditsPressure.value)
    return { spent: qty, received, avgRate: qty / received }
  }

  function sellEnergy(amount: number): boolean {
    const qty = Math.min(amount, state.value.energy)
    if (qty <= 0) return false

    const creditsGained = calcCreditsReceived(qty, energyPressure.value)
    state.value.energy -= qty
    state.value.credits += creditsGained
    // Intentionally NOT adding to totalCreditsEarned or totalEnergyEarned
    energyPressure.value += qty

    return true
  }

  function sellCredits(amount: number): boolean {
    const qty = Math.min(amount, state.value.credits)
    if (qty <= 0) return false

    const energyGained = calcEnergyReceived(qty, creditsPressure.value)
    state.value.credits -= qty
    state.value.energy += energyGained
    // Intentionally NOT adding to totalEnergyEarned — prevents prestige exploit
    creditsPressure.value += qty / BASE_RATE

    return true
  }

  function tickExchange(dt: number) {
    energyPressure.value = calcPressureDecay(energyPressure.value, PRESSURE_DECAY_RATE, dt)
    creditsPressure.value = calcPressureDecay(creditsPressure.value, PRESSURE_DECAY_RATE, dt)
    // Snap to zero below threshold to avoid float drift
    if (energyPressure.value < 0.01) energyPressure.value = 0
    if (creditsPressure.value < 0.01) creditsPressure.value = 0
  }

  return {
    energyToCreditsRate,
    creditsToEnergyRate,
    energyMarketHealth,
    creditsMarketHealth,
    previewSellEnergy,
    previewSellCredits,
    sellEnergy,
    sellCredits,
    tickExchange,
    BASE_RATE
  }
}
