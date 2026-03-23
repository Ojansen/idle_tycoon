import type { PlanetState } from '~/types/planet'
import {
  calcHousingCap,
  calcOvercrowdingEfficiency,
  calcPopGrowth,
  calcDivisionOutput,
  calcPopDistribution,
  calcCgPerJob,
} from '~/utils/gameMath'
import {
  HOUSING_PER_ADMIN_LEVEL,
  BASE_POP_GROWTH,
  CG_PER_POP,
  MAINTENANCE_PER_DIVISION_LEVEL,
} from '~/composables/usePlanetConfig'

export interface PlanetJobStats {
  totalJobs: number
  filledJobs: number
  unemployed: number
  perDivision: { type: string | null; jobs: number; filled: number }[]
}

export function usePlanets(): {
  totalPops: ComputedRef<number>
  totalDivisionLevels: ComputedRef<number>
  grossCreditsPerSecond: ComputedRef<number>
  grossCgPerSecond: ComputedRef<number>
  rawTradeValue: ComputedRef<number>
  totalMaintenance: ComputedRef<number>
  baseCgConsumption: ComputedRef<number>
  getPlanetHousingCap: (planet: PlanetState) => number
  getPlanetEfficiency: (planet: PlanetState) => number
  getPlanetTotalLevels: (planet: PlanetState) => number
  getPlanetMaxLevels: (planet: PlanetState) => number
  getPlanetProduction: (planet: PlanetState) => { credits: number; cg: number; trade: number }
  getPlanetPopDistribution: (planet: PlanetState) => number[]
  getPlanetJobStats: (planet: PlanetState) => PlanetJobStats
  getPlanetTypeBonus: (planet: PlanetState, stat: 'credits' | 'cg' | 'popGrowth') => number
  getPlanetTraitModifier: (planet: PlanetState, stat: 'credits' | 'cg' | 'popGrowth' | 'maintenance' | 'trade') => number
  tickPopGrowth: (dt: number, cgAvailability: number) => void
  getMultiplierStack: (stat: 'creditsMultiplier' | 'cgMultiplier' | 'tradeMultiplier') => number
} {
  const { state, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
  const { getPlanetDef, getPlanetType, getPlanetSize, getPlanetTrait, getDivision } = usePlanetConfig()
  const { getAscensionMultiplier } = useAscensionPerks()
  const { getResearchMultiplier } = useResearchActions()

  // ── Multiplier stacks ──

  function getMultiplierStack(stat: 'creditsMultiplier' | 'cgMultiplier' | 'tradeMultiplier'): number {
    return getPrestigeMultiplier(stat)
      * getTraitMultiplier(stat)
      * getAscensionMultiplier(stat)
      * getRepeatableMultiplier(stat)
      * getResearchMultiplier(stat)
      * getTraitMultiplier('allProductionMultiplier')
  }

  function getWorkerOutputStack(): number {
    return getPrestigeMultiplier('workerOutputMultiplier')
      * getTraitMultiplier('workerOutputMultiplier')
      * getAscensionMultiplier('workerOutputMultiplier')
      * getRepeatableMultiplier('workerOutputMultiplier')
      * getResearchMultiplier('workerOutputMultiplier')
  }

  function getPopGrowthMultiplier(): number {
    return getPrestigeMultiplier('popGrowthMultiplier')
      * getTraitMultiplier('popGrowthMultiplier')
      * getAscensionMultiplier('popGrowthMultiplier')
      * getRepeatableMultiplier('popGrowthMultiplier')
      * getResearchMultiplier('popGrowthMultiplier')
  }

  // ── Per-planet computations ──

  function getPlanetHousingCap(planet: PlanetState): number {
    const def = getPlanetDef(planet.definitionId)
    if (!def) return 0
    const sizeDef = getPlanetSize(def.size)
    if (!sizeDef) return 0

    let adminLevels = 0
    for (const div of planet.divisions) {
      if (div && div.type === 'administrative') adminLevels += div.level
    }
    return calcHousingCap(sizeDef.baseHousing, adminLevels, HOUSING_PER_ADMIN_LEVEL)
  }

  function getPlanetEfficiency(_planet: PlanetState): number {
    // Pops hard-capped at housing — no overcrowding possible
    return 1.0
  }

  function getPlanetTotalLevels(planet: PlanetState): number {
    let total = 0
    for (const div of planet.divisions) {
      if (div) total += div.level
    }
    return total
  }

  function getPlanetMaxLevels(planet: PlanetState): number {
    const def = getPlanetDef(planet.definitionId)
    if (!def) return 0
    const sizeDef = getPlanetSize(def.size)
    return sizeDef?.maxLevels ?? 0
  }

  function getPlanetTraitModifier(planet: PlanetState, stat: 'credits' | 'cg' | 'popGrowth' | 'maintenance' | 'trade'): number {
    const def = getPlanetDef(planet.definitionId)
    if (!def) return 1
    let mod = 1
    for (const traitId of def.traits) {
      const trait = getPlanetTrait(traitId)
      if (!trait) continue
      for (const effect of trait.effects) {
        if (effect.stat === stat) mod *= effect.value
      }
    }
    return mod
  }

  function getPlanetTypeBonus(planet: PlanetState, stat: 'credits' | 'cg' | 'popGrowth'): number {
    const def = getPlanetDef(planet.definitionId)
    if (!def) return 1
    const typeDef = getPlanetType(def.type)
    if (!typeDef) return 1
    return typeDef.bonuses[stat]
  }

  // Job-aware pop distribution: pops fill division jobs up to capacity
  function getPlanetPopDistribution(planet: PlanetState): number[] {
    const divs = planet.divisions.map(d => ({
      type: d?.type ?? null,
      level: d?.level ?? 0,
    }))
    return calcPopDistribution(Math.floor(planet.pops), divs, planet.policy)
  }

  // Job stats for UI display
  function getPlanetJobStats(planet: PlanetState): PlanetJobStats {
    const popDist = getPlanetPopDistribution(planet)
    let totalJobs = 0
    let filledJobs = 0
    const perDivision: PlanetJobStats['perDivision'] = []

    for (let i = 0; i < planet.divisions.length; i++) {
      const div = planet.divisions[i]
      if (!div || div.type === 'administrative') {
        perDivision.push({ type: div?.type ?? null, jobs: 0, filled: 0 })
        continue
      }
      const jobs = div.level
      const filled = popDist[i] ?? 0
      totalJobs += jobs
      filledJobs += filled
      perDivision.push({ type: div.type, jobs, filled })
    }

    const unemployed = Math.max(0, Math.floor(planet.pops) - filledJobs)
    return { totalJobs, filledJobs, unemployed, perDivision }
  }

  // ── Production per planet ──

  function getPlanetProduction(planet: PlanetState): { credits: number; cg: number; trade: number } {
    const efficiency = getPlanetEfficiency(planet)
    const popDist = getPlanetPopDistribution(planet)
    const result = { credits: 0, cg: 0, trade: 0 }

    for (let i = 0; i < planet.divisions.length; i++) {
      const div = planet.divisions[i]
      if (!div || div.type === 'administrative') continue

      const divDef = getDivision(div.type)
      if (!divDef) continue

      const filledJobs = popDist[i] ?? 0
      let typeBonus = 1
      if (div.type === 'mining') typeBonus = getPlanetTypeBonus(planet, 'credits') * getPlanetTraitModifier(planet, 'credits')
      else if (div.type === 'industrial') typeBonus = getPlanetTypeBonus(planet, 'cg') * getPlanetTraitModifier(planet, 'cg')
      else if (div.type === 'commerce') typeBonus = getPlanetTraitModifier(planet, 'trade')

      const output = calcDivisionOutput(divDef.baseProd, div.level, filledJobs, typeBonus, efficiency) * getWorkerOutputStack()

      if (div.type === 'mining') result.credits += output
      else if (div.type === 'industrial') result.cg += output
      else if (div.type === 'commerce') result.trade += output
    }

    return result
  }

  // ── Global totals ──

  const totalPops = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      total += planet.pops
    }
    return total
  })

  const totalDivisionLevels = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      for (const div of planet.divisions) {
        if (div) total += div.level
      }
    }
    return total
  })

  const grossCreditsPerSecond = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      total += getPlanetProduction(planet).credits
    }
    return total * getMultiplierStack('creditsMultiplier')
  })

  const grossCgPerSecond = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      total += getPlanetProduction(planet).cg
    }
    return total * getMultiplierStack('cgMultiplier')
  })

  const rawTradeValue = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      const prod = getPlanetProduction(planet)
      total += prod.trade
      total += planet.pops * 0.05
    }
    return total
  })

  const totalMaintenance = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      const def = getPlanetDef(planet.definitionId)
      if (!def) continue
      const typeDef = getPlanetType(def.type)
      const typeMod = typeDef?.maintenanceModifier ?? 1
      const traitMod = getPlanetTraitModifier(planet, 'maintenance')
      // Base planet maintenance
      total += def.maintenanceCost * typeMod * traitMod
      // Per-division-level maintenance: higher infrastructure = higher upkeep
      for (const div of planet.divisions) {
        if (div) total += div.level * MAINTENANCE_PER_DIVISION_LEVEL
      }
    }
    return total
  })

  // CG consumption: sum of CG per filled job (scales with level) + unemployed base + admin upkeep
  const baseCgConsumption: ComputedRef<number> = computed(() => {
    let total = 0
    for (const planet of state.value.planets || []) {
      const popDist = getPlanetPopDistribution(planet)

      for (let i = 0; i < planet.divisions.length; i++) {
        const div = planet.divisions[i]
        if (!div) continue

        if (div.type === 'administrative') {
          // Admin: flat CG per level (infrastructure upkeep)
          total += div.level * CG_PER_POP
        } else {
          // Each filled job consumes CG scaled by division level
          const filledJobs = popDist[i] ?? 0
          total += filledJobs * calcCgPerJob(CG_PER_POP, div.level)
        }
      }

      // Unemployed pops still eat base CG
      const totalFilled = popDist.reduce((a, b) => a + b, 0)
      const unemployed = Math.max(0, Math.floor(planet.pops) - totalFilled)
      total += unemployed * CG_PER_POP
    }
    return total
  })

  // ── Pop growth tick ──

  function tickPopGrowth(dt: number, cgAvailability: number) {
    const growthMult = getPopGrowthMultiplier()

    for (const planet of state.value.planets || []) {
      const housingCap = getPlanetHousingCap(planet)
      const planetGrowthMod = getPlanetTypeBonus(planet, 'popGrowth') * getPlanetTraitModifier(planet, 'popGrowth')

      const growthPerSec = calcPopGrowth(
        BASE_POP_GROWTH,
        planet.pops,
        housingCap,
        planetGrowthMod,
        cgAvailability,
        growthMult
      )

      planet.pops = Math.min(planet.pops + growthPerSec * dt, housingCap)
    }
  }

  return {
    totalPops,
    totalDivisionLevels,
    grossCreditsPerSecond,
    grossCgPerSecond,
    rawTradeValue,
    totalMaintenance,
    baseCgConsumption,
    getPlanetHousingCap,
    getPlanetEfficiency,
    getPlanetTotalLevels,
    getPlanetMaxLevels,
    getPlanetProduction,
    getPlanetPopDistribution,
    getPlanetJobStats,
    getPlanetTypeBonus,
    getPlanetTraitModifier,
    tickPopGrowth,
    getMultiplierStack,
  }
}
