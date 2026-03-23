// ── Exchange constants ──
export const BASE_RATE = 1
export const ENERGY_PRESSURE_K = 0.001
export const CREDITS_PRESSURE_K = 0.0001
export const PRESSURE_DECAY_RATE = 0.01

// ── Number formatting ──
const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n < 0) return '-' + formatNumber(-n)
  if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString()

  const tier = Math.min(Math.floor(Math.log10(n) / 3), suffixes.length - 1)
  const scaled = n / Math.pow(10, tier * 3)
  const formatted = scaled < 10 ? scaled.toFixed(2) : scaled < 100 ? scaled.toFixed(1) : Math.floor(scaled).toString()
  return formatted + suffixes[tier]
}

// ── Prestige ──
export function calcPrestigeInfluence(totalEnergyEarned: number): number {
  if (totalEnergyEarned < 1e5) return 0
  return Math.floor(Math.log2(totalEnergyEarned / 1e5) * 50)
}

// One-time Kardashev milestone influence grants (awarded when kardashevHighWaterMark increases)
// Index = Kardashev level reached
export const KARDASHEV_MILESTONE_GRANTS: Record<number, number> = {
  1: 500,
  2: 5000,
  3: 50000,
  4: 500000,
  5: 2000000,
  6: 10000000,
}

// ── Repeatable upgrade cost ──
export function calcRepeatableCost(baseCost: number, costScale: number, level: number): number {
  return Math.floor(baseCost * Math.pow(costScale, level))
}

// ── Building milestone multiplier ──
export function calcBuildingMultiplier(owned: number): number {
  return Math.pow(2, Math.floor(owned / 25))
}

// ── Dampened multiplier for CG system (upkeep + CG production) ──
export const UPKEEP_DAMPENING = 0.8

export function calcUpkeepMultiplier(owned: number): number {
  return Math.pow(calcBuildingMultiplier(owned), UPKEEP_DAMPENING)
}

// ── Empire size (composite metric — buildings, megastructures, pops) ──
export const EMPIRE_SIZE_PER_BUILDING = 0.5
export const EMPIRE_SIZE_PER_MEGASTRUCTURE = 5
export const EMPIRE_SIZE_PER_POP_RATE = 0.01  // 1 empire size per 100 autoclick/s

export function calcEmpireSize(totalBuildings: number, completedMegastructures: number, autoclickPerSecond: number): number {
  return totalBuildings * EMPIRE_SIZE_PER_BUILDING
    + completedMegastructures * EMPIRE_SIZE_PER_MEGASTRUCTURE
    + autoclickPerSecond * EMPIRE_SIZE_PER_POP_RATE
}

// ── Empire scale pressure on CG consumption (logarithmic) ──
// Grows steadily but never explodes — suitable for idle games scaling to 10k+ buildings
export const EMPIRE_PRESSURE_THRESHOLD = 25    // empire size below this = no pressure
export const EMPIRE_PRESSURE_LOG_SCALE = 0.15  // controls steepness of log curve

export function calcEmpirePressure(empireSize: number): number {
  if (empireSize <= EMPIRE_PRESSURE_THRESHOLD) return 1
  return 1 + EMPIRE_PRESSURE_LOG_SCALE * Math.log(empireSize / EMPIRE_PRESSURE_THRESHOLD)
}

// ── Building cost (geometric sum with multipliers) ──
export function calcBuildingCost(
  baseCost: number,
  costMultiplier: number,
  owned: number,
  quantity: number,
  combinedMult: number = 1
): number {
  let total = 0
  for (let i = 0; i < quantity; i++) {
    total += Math.floor(baseCost * Math.pow(costMultiplier, owned + i) * combinedMult)
  }
  return total
}

// ── Max buyable buildings for a budget ──
export function calcMaxBuyable(
  baseCost: number,
  costMultiplier: number,
  owned: number,
  budget: number,
  combinedMult: number = 1
): number {
  if (budget <= 0) return 0
  // Binary search for the max quantity affordable
  let lo = 0
  let hi = 1
  // Find upper bound
  while (calcBuildingCost(baseCost, costMultiplier, owned, hi, combinedMult) <= budget) {
    hi *= 2
    if (hi > 10000) break // safety cap
  }
  // Binary search
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    if (calcBuildingCost(baseCost, costMultiplier, owned, mid, combinedMult) <= budget) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }
  return lo
}

// ── Click power with pop boost ──
export function calcClickPower(baseClick: number, autoclickPerSecond: number): number {
  const popBoost = 1 + Math.sqrt(autoclickPerSecond)
  return Math.max(1, Math.floor(baseClick * popBoost))
}

// ── Resource exchange: sell energy → credits ──
// productionRate normalizes the trade so market impact is relative to economy size
export function calcCreditsReceived(amount: number, pressure: number, productionRate: number = 1): number {
  if (amount <= 0 || productionRate <= 0) return 0
  const k = ENERGY_PRESSURE_K
  const norm = productionRate
  const normAmount = amount / norm
  const normPressure = pressure / norm
  const normResult = (BASE_RATE / k) * Math.log((1 + k * (normPressure + normAmount)) / (1 + k * normPressure))
  return normResult * norm
}

// ── Resource exchange: sell credits → energy ──
// productionRate normalizes the trade so market impact is relative to economy size
export function calcEnergyReceived(amount: number, pressure: number, productionRate: number = 1): number {
  if (amount <= 0 || productionRate <= 0) return 0
  const k = CREDITS_PRESSURE_K
  const norm = productionRate
  const normAmount = amount / norm
  const normPressure = pressure / norm
  const normResult = (1 / (BASE_RATE * k)) * Math.log((1 + k * (normPressure + normAmount)) / (1 + k * normPressure))
  return normResult * norm
}

// ── Exchange spot rate ──
export function calcExchangeRate(baseRate: number, pressureK: number, pressure: number): number {
  return baseRate / (1 + pressureK * pressure)
}

// ── Market health percentage ──
export function calcMarketHealth(pressureK: number, pressure: number): number {
  return Math.round((1 / (1 + pressureK * pressure)) * 100)
}

// ── Pressure exponential decay ──
export function calcPressureDecay(pressure: number, decayRate: number, dt: number): number {
  return pressure * Math.exp(-decayRate * dt)
}

// ── Casino crash point ──
export function calcCrashPoint(random: number): number {
  return Math.max(1.0, 0.97 / (1 - random))
}
