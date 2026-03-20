// Base rate: 1 energy = 10 credits
const BASE_RATE = 10

// Pressure scaling factors (credits are ~10x more numerous, so lower k)
const ENERGY_PRESSURE_K = 0.001
const CREDITS_PRESSURE_K = 0.0001

// Exponential decay: ~95% recovery in 300s → decay constant ≈ ln(20)/300 ≈ 0.01/s
const PRESSURE_DECAY_RATE = 0.01

// Ephemeral module-level state (resets on page load, like stock prices)
const energyPressure = ref(0)
const creditsPressure = ref(0)

function calcCreditsReceived(amount: number, pressure: number): number {
  if (amount <= 0) return 0
  const k = ENERGY_PRESSURE_K
  // Integral of BASE_RATE / (1 + k*(p + x)) dx from 0 to amount
  return (BASE_RATE / k) * Math.log((1 + k * (pressure + amount)) / (1 + k * pressure))
}

function calcEnergyReceived(amount: number, pressure: number): number {
  if (amount <= 0) return 0
  const k = CREDITS_PRESSURE_K
  // Each unit of energy costs BASE_RATE * (1 + k*(p + x)) credits
  // Given `amount` credits, energy received = integral of 1 / (BASE_RATE * (1 + k*(p+x))) dx
  // But we need to integrate over credits spent, not energy bought.
  // Invert: amount of energy you can buy = (1/(BASE_RATE*k)) * ln((1 + k*(p + amount/BASE_RATE)) / (1 + k*p))
  return (1 / (BASE_RATE * k)) * Math.log((1 + k * (pressure + amount / BASE_RATE)) / (1 + k * pressure))
}

export function useResourceExchange() {
  const { state } = useGameState()

  // Spot rates (what 1 unit gets you right now, before pressure from the trade itself)
  const energyToCreditsRate = computed(() => {
    return BASE_RATE / (1 + ENERGY_PRESSURE_K * energyPressure.value)
  })

  const creditsToEnergyRate = computed(() => {
    return (1 / BASE_RATE) / (1 + CREDITS_PRESSURE_K * creditsPressure.value)
  })

  // Market health: 100% = no pressure, approaches 0% when heavily flooded
  const energyMarketHealth = computed(() => {
    return Math.round((1 / (1 + ENERGY_PRESSURE_K * energyPressure.value)) * 100)
  })

  const creditsMarketHealth = computed(() => {
    return Math.round((1 / (1 + CREDITS_PRESSURE_K * creditsPressure.value)) * 100)
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
    energyPressure.value *= Math.exp(-PRESSURE_DECAY_RATE * dt)
    creditsPressure.value *= Math.exp(-PRESSURE_DECAY_RATE * dt)
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
