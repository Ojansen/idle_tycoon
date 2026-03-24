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

// ── Empire size (Stellaris-style: weighted sources) ──
// Threshold above which penalties apply
export const EMPIRE_SIZE_THRESHOLD = 100
// +0.4% research and maintenance cost per point over threshold
export const SPRAWL_PENALTY_RATE = 0.004

// Weights per source (from Stellaris docs, adapted)
export const EMPIRE_SIZE_PER_PLANET = 10
export const EMPIRE_SIZE_PER_MEGASTRUCTURE = 5
export const EMPIRE_SIZE_PER_DIVISION_LEVEL = 0.5
export const EMPIRE_SIZE_PER_100_POPS = 1

export function calcEmpireSize(colonizedPlanets: number, completedMegastructures: number, totalDivisionLevels: number, totalPops: number): number {
  return colonizedPlanets * EMPIRE_SIZE_PER_PLANET
    + completedMegastructures * EMPIRE_SIZE_PER_MEGASTRUCTURE
    + totalDivisionLevels * EMPIRE_SIZE_PER_DIVISION_LEVEL
    + Math.floor(totalPops / 100) * EMPIRE_SIZE_PER_100_POPS
}

// Sprawl penalty: cost multiplier when over threshold
export function calcSprawlPenalty(empireSize: number): number {
  const over = Math.max(0, empireSize - EMPIRE_SIZE_THRESHOLD)
  return 1 + over * SPRAWL_PENALTY_RATE
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

// ── Planet System ──

// Housing capacity: base from planet size + Admin division levels
export function calcHousingCap(baseHousing: number, adminLevels: number, housingPerLevel: number): number {
  return baseHousing + adminLevels * housingPerLevel
}

// Overcrowding efficiency: 1.0 when pops <= cap, drops linearly when over
export function calcOvercrowdingEfficiency(pops: number, housingCap: number): number {
  if (housingCap <= 0) return pops > 0 ? 0.25 : 1.0
  if (pops <= housingCap) return 1.0
  return Math.max(0.25, housingCap / pops)
}

// Pop growth: linear rate, hard capped at housing cap
export function calcPopGrowth(
  baseGrowth: number,
  pops: number,
  housingCap: number,
  planetGrowthMod: number,
  cgAvailability: number, // 0-1, how much CG is available vs needed
  extraMultiplier: number = 1
): number {
  if (housingCap <= 0 || pops >= housingCap) return 0
  const growth = baseGrowth * planetGrowthMod * cgAvailability * extraMultiplier
  // Don't grow past housing cap
  return Math.min(growth, housingCap - pops)
}

// Division output: baseProd × filledJobs × planetTypeBonus × efficiency
// Level determines job count (more jobs = more pops can work = more output)
// Output per job is flat — the "upgrade" is about capacity, not power per worker
export function calcDivisionOutput(
  baseProd: number,
  _level: number,
  filledJobs: number,
  planetTypeBonus: number,
  efficiency: number
): number {
  return baseProd * filledJobs * planetTypeBonus * efficiency
}

// Division upgrade cost: geometric scaling
export function calcDivisionUpgradeCost(baseCost: number, costMultiplier: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel))
}

// Colony cost (direct from definition, but can be modified by multipliers)
export function calcColonyCost(baseCost: number, costMultiplier: number = 1): number {
  return Math.floor(baseCost * costMultiplier)
}

// Planet maintenance (base × planet type modifier × trait modifiers)
export function calcPlanetMaintenance(baseMaintenance: number, typeModifier: number, traitModifier: number = 1): number {
  return baseMaintenance * typeModifier * traitModifier
}

// ── Jobs system ──

// Jobs created by a division at a given level (Admin creates 0 jobs)
export function calcJobCount(level: number): number {
  return level
}

// CG consumed per filled job at a given division level
// Higher-tech divisions need more supplies: CG_PER_POP × (1 + 0.5 × level)
export function calcCgPerJob(cgPerPop: number, level: number): number {
  return cgPerPop * (1 + 0.5 * level)
}

// Pop-to-job assignment: distributes pops across division jobs based on policy
// Each division has a job cap (= its level). Pops fill jobs; excess pops are unemployed.
// Returns array of filled jobs per slot (not fractional pops — integer jobs filled).
export function calcPopDistribution(
  totalPops: number,
  divisions: { type: string | null; level: number }[], // null for empty slots
  policy: string
): number[] {
  const result = new Array(divisions.length).fill(0)
  const jobSlots = divisions.map((d, i) => ({
    index: i,
    type: d.type,
    jobs: (d.type && d.type !== 'administrative') ? d.level : 0,
  }))

  const activeSlots = jobSlots.filter(s => s.jobs > 0)
  if (activeSlots.length === 0) return result

  let remaining = Math.floor(totalPops)

  // Determine priority type
  let priorityType: string | null = null
  if (policy === 'prioritize_production') priorityType = 'mining'
  else if (policy === 'prioritize_cg') priorityType = 'industrial'
  else if (policy === 'prioritize_trade') priorityType = 'commerce'

  if (priorityType && activeSlots.some(s => s.type === priorityType)) {
    // Fill priority divisions first
    const priority = activeSlots.filter(s => s.type === priorityType)
    const others = activeSlots.filter(s => s.type !== priorityType)

    // Fill priority jobs
    for (const s of priority) {
      const fill = Math.min(s.jobs, remaining)
      result[s.index] = fill
      remaining -= fill
    }
    // Then fill the rest
    for (const s of others) {
      const fill = Math.min(s.jobs, remaining)
      result[s.index] = fill
      remaining -= fill
    }
  } else {
    // Balanced: round-robin fill, 1 job at a time across divisions
    let filled = true
    while (remaining > 0 && filled) {
      filled = false
      for (const s of activeSlots) {
        if (remaining <= 0) break
        if (result[s.index] < s.jobs) {
          result[s.index]++
          remaining--
          filled = true
        }
      }
    }
  }

  return result
}

// Pop transfer cost
export function calcTransferCost(popCount: number, baseCost: number, tierScale: number, tierDiff: number): number {
  return Math.floor(popCount * baseCost * Math.pow(tierScale, tierDiff))
}
