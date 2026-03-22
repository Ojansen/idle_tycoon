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
// Pressure is now normalized (in "seconds of production" units)
const energyPressure = ref(0)
const creditsPressure = ref(0)

export function useResourceExchange() {
  const { state, creditsPerSecond, energyPerSecond } = useGameState()

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
    const prodRate = Math.max(1, energyPerSecond.value)
    const received = calcCreditsReceived(qty, energyPressure.value * prodRate, prodRate)
    return { spent: qty, received, avgRate: received / qty }
  }

  function previewSellCredits(amount: number) {
    const qty = Math.min(amount, state.value.credits)
    if (qty <= 0) return { spent: 0, received: 0, avgRate: BASE_RATE }
    const prodRate = Math.max(1, creditsPerSecond.value)
    const received = calcEnergyReceived(qty, creditsPressure.value * prodRate, prodRate)
    return { spent: qty, received, avgRate: qty / Math.max(1, received) }
  }

  function sellEnergy(amount: number): boolean {
    const qty = Math.min(amount, state.value.energy)
    if (qty <= 0) return false

    const prodRate = Math.max(1, energyPerSecond.value)
    const creditsGained = calcCreditsReceived(qty, energyPressure.value * prodRate, prodRate)
    state.value.energy -= qty
    state.value.credits += creditsGained
    // Intentionally NOT adding to totalCreditsEarned or totalEnergyEarned
    // Pressure stored in normalized "seconds of production" units
    energyPressure.value += qty / prodRate

    return true
  }

  function sellCredits(amount: number): boolean {
    const qty = Math.min(amount, state.value.credits)
    if (qty <= 0) return false

    const prodRate = Math.max(1, creditsPerSecond.value)
    const energyGained = calcEnergyReceived(qty, creditsPressure.value * prodRate, prodRate)
    state.value.credits -= qty
    state.value.energy += energyGained
    // Intentionally NOT adding to totalEnergyEarned — prevents prestige exploit
    // Pressure stored in normalized "seconds of production" units
    creditsPressure.value += qty / prodRate

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
