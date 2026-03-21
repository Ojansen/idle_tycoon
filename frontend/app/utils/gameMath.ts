// ── Exchange constants ──
export const BASE_RATE = 10
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
  return Math.floor(Math.sqrt(totalEnergyEarned / 1e5))
}

// ── Repeatable upgrade cost ──
export function calcRepeatableCost(baseCost: number, costScale: number, level: number): number {
  return Math.floor(baseCost * Math.pow(costScale, level))
}

// ── Building milestone multiplier ──
export function calcBuildingMultiplier(owned: number): number {
  return Math.pow(2, Math.floor(owned / 25))
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

// ── Click power with pop boost ──
export function calcClickPower(baseClick: number, autoclickPerSecond: number): number {
  const popBoost = 1 + Math.sqrt(autoclickPerSecond)
  return Math.max(1, Math.floor(baseClick * popBoost))
}

// ── Resource exchange: sell energy → credits ──
export function calcCreditsReceived(amount: number, pressure: number): number {
  if (amount <= 0) return 0
  const k = ENERGY_PRESSURE_K
  return (BASE_RATE / k) * Math.log((1 + k * (pressure + amount)) / (1 + k * pressure))
}

// ── Resource exchange: sell credits → energy ──
export function calcEnergyReceived(amount: number, pressure: number): number {
  if (amount <= 0) return 0
  const k = CREDITS_PRESSURE_K
  // Integral of (1/BASE_RATE) / (1 + k*(p + x)) dx from 0 to amount
  // = (1 / (BASE_RATE * k)) * ln((1 + k*(p + amount)) / (1 + k*p))
  return (1 / (BASE_RATE * k)) * Math.log((1 + k * (pressure + amount)) / (1 + k * pressure))
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
