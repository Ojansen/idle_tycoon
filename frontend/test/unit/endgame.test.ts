import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier, calcBuildingCost } from '../../app/utils/gameMath'

// ─────────────────────────────────────────────────────────────────────────────
// Raw data mirrored from config files (read-only copies for test isolation)
// ─────────────────────────────────────────────────────────────────────────────

interface Building {
  id: string
  baseCost: number
  costMultiplier: number
  baseOutput: number
  resource: 'credits' | 'energy' | 'autoclick'
  energyUpkeep?: number
  creditsUpkeep?: number
}

// prettier-ignore
const TYPE_VI_BUILDINGS: Building[] = [
  // Credits
  { id: 'genesis_compiler', baseCost: 1e42,   costMultiplier: 1.045, baseOutput: 3.65e37, resource: 'credits', energyUpkeep: 1.75e37 },
  { id: 'axiom_mint',       baseCost: 50e42,  costMultiplier: 1.048, baseOutput: 1.28e39, resource: 'credits', energyUpkeep: 2.46e38 },
  { id: 'void_consortium',  baseCost: 50e45,  costMultiplier: 1.053, baseOutput: 6.26e41, resource: 'credits', energyUpkeep: 1.20e41 },
  { id: 'absolute_engine',  baseCost: 1e48,   costMultiplier: 1.055, baseOutput: 8.77e42, resource: 'credits', energyUpkeep: 4.21e42 },
  // Energy
  { id: 'planck_harvester',   baseCost: 5e42,   costMultiplier: 1.045, baseOutput: 1.46e38, resource: 'energy', creditsUpkeep: 4.38e36 },
  { id: 'logos_reactor',      baseCost: 100e42, costMultiplier: 1.048, baseOutput: 2.05e39, resource: 'energy', creditsUpkeep: 1.54e38 },
  { id: 'eschaton_dynamo',    baseCost: 100e45, costMultiplier: 1.053, baseOutput: 1.00e42, resource: 'energy', creditsUpkeep: 7.52e40 },
  { id: 'source_code_engine', baseCost: 5e48,   costMultiplier: 1.055, baseOutput: 3.51e43, resource: 'energy', creditsUpkeep: 1.05e42 },
]

// Last two Type V buildings (for cross-tier comparison)
const LAST_TYPE_V_CREDITS: Building = {
  id: 'omniscience_engine', baseCost: 1e39, costMultiplier: 1.055,
  baseOutput: 2.92e34, resource: 'credits', energyUpkeep: 1.40e34
}
const LAST_TYPE_V_ENERGY: Building = {
  id: 'omega_point_engine', baseCost: 5e39, costMultiplier: 1.055,
  baseOutput: 1.17e35, resource: 'energy', creditsUpkeep: 3.51e33
}

// Megastructure definitions relevant to endgame (from useResearchConfig)
interface Mega {
  id: string
  requiredResearch: string[]
  creditsMultiplier?: number
  energyMultiplier?: number
  popMultiplier?: number
  upkeepReduction?: number
  researchSpeed?: number
}

// prettier-ignore
const MEGASTRUCTURES: Mega[] = [
  { id: 'stellar_forge',    requiredResearch: ['ind_megascale'],                                    creditsMultiplier: 1.5 },
  { id: 'dyson_brain',      requiredResearch: ['nrg_zero_point'],                                   energyMultiplier: 2.0, popMultiplier: 1.5 },
  { id: 'nidavellir_forge', requiredResearch: ['exo_dark_matter'],                                  creditsMultiplier: 2.0, energyMultiplier: 2.0 },
  { id: 'matrioshka_brain', requiredResearch: ['ind_matter_prog', 'nrg_vacuum'],                    popMultiplier: 2.0, researchSpeed: 2.0 },
  { id: 'genesis_engine',   requiredResearch: ['ind_reality_fab'],                                  creditsMultiplier: 3.0, energyMultiplier: 2.0 },
  { id: 'cosmic_engine',    requiredResearch: ['nrg_entropy_rev', 'exo_dimension'],                 creditsMultiplier: 2.0, energyMultiplier: 3.0 },
  { id: 'reality_engine',   requiredResearch: ['exo_reality'],                                      creditsMultiplier: 5.0, energyMultiplier: 5.0 },
  { id: 'omega_structure',  requiredResearch: ['exo_reality', 'ind_reality_fab', 'nrg_omega', 'soc_omega'], creditsMultiplier: 10.0, energyMultiplier: 10.0, popMultiplier: 5.0 },
  { id: 'infinity_forge',   requiredResearch: ['ind_reality_fab'],                                  creditsMultiplier: 3.0, energyMultiplier: 3.0, upkeepReduction: 0.8 },
  { id: 'chronosphere',     requiredResearch: ['exo_reality'],                                      creditsMultiplier: 2.0, energyMultiplier: 2.0, researchSpeed: 3.0 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function efficiency(b: Building): number {
  return b.baseOutput / b.baseCost
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TYPE VI BUILDING BALANCE
// ─────────────────────────────────────────────────────────────────────────────

describe('Type VI building balance', () => {
  for (const resource of ['credits', 'energy'] as const) {
    const buildings = TYPE_VI_BUILDINGS.filter(b => b.resource === resource)

    describe(`Type VI ${resource} buildings`, () => {
      it('cheaper buildings should have strictly better efficiency (output/cost)', () => {
        for (let i = 0; i < buildings.length - 1; i++) {
          const cheaper = buildings[i]
          const pricier = buildings[i + 1]
          expect(efficiency(cheaper)).toBeGreaterThan(
            efficiency(pricier),
            `${cheaper.id} (eff=${efficiency(cheaper).toExponential(3)}) should beat ${pricier.id} (eff=${efficiency(pricier).toExponential(3)})`
          )
        }
      })

      it('efficiency spread across tier should be between 2x and 10x', () => {
        const effs = buildings.map(b => efficiency(b))
        const spread = Math.max(...effs) / Math.min(...effs)
        expect(spread).toBeGreaterThan(2, 'Spread too narrow — no tradeoff between buildings')
        expect(spread).toBeLessThan(10, 'Spread too wide — later buildings feel worthless')
      })

      it('most expensive building should produce >10x the raw output of the cheapest', () => {
        const cheapest = buildings[0]
        const priciest = buildings[buildings.length - 1]
        expect(priciest.baseOutput).toBeGreaterThan(cheapest.baseOutput * 10,
          `${priciest.id} raw output (${priciest.baseOutput.toExponential(2)}) should be >10x ${cheapest.id} (${cheapest.baseOutput.toExponential(2)})`)
      })

      it('cost multipliers should be between 1.045 and 1.055', () => {
        for (const b of buildings) {
          expect(b.costMultiplier).toBeGreaterThanOrEqual(1.045,
            `${b.id} costMultiplier ${b.costMultiplier} is below 1.045`)
          expect(b.costMultiplier).toBeLessThanOrEqual(1.055,
            `${b.id} costMultiplier ${b.costMultiplier} is above 1.055`)
        }
      })

      it('upkeep ratio should be between 1% and 50% of output', () => {
        for (const b of buildings) {
          const upkeep = resource === 'credits' ? (b.energyUpkeep ?? 0) : (b.creditsUpkeep ?? 0)
          expect(upkeep).toBeGreaterThan(0, `${b.id} must have an upkeep value`)
          const ratio = upkeep / b.baseOutput
          expect(ratio).toBeGreaterThan(0.01, `${b.id} upkeep ratio ${(ratio * 100).toFixed(1)}% is below 1% — upkeep too trivial`)
          expect(ratio).toBeLessThan(0.50,    `${b.id} upkeep ratio ${(ratio * 100).toFixed(1)}% exceeds 50% — too punishing`)
        }
      })

      it('cost multipliers should be non-decreasing within the tier (cheaper buildings scale slower)', () => {
        for (let i = 0; i < buildings.length - 1; i++) {
          expect(buildings[i + 1].costMultiplier).toBeGreaterThanOrEqual(
            buildings[i].costMultiplier,
            `${buildings[i + 1].id} should have >= costMultiplier than ${buildings[i].id}`
          )
        }
      })
    })
  }

  it('first Type VI credit building should outclass last Type V in raw output (>100x)', () => {
    const firstVI = TYPE_VI_BUILDINGS.find(b => b.resource === 'credits')!
    expect(firstVI.baseOutput).toBeGreaterThan(LAST_TYPE_V_CREDITS.baseOutput * 100,
      `genesis_compiler (${firstVI.baseOutput.toExponential(2)}) should be >100x omniscience_engine (${LAST_TYPE_V_CREDITS.baseOutput.toExponential(2)})`)
  })

  it('first Type VI energy building should outclass last Type V in raw output (>100x)', () => {
    const firstVI = TYPE_VI_BUILDINGS.find(b => b.resource === 'energy')!
    expect(firstVI.baseOutput).toBeGreaterThan(LAST_TYPE_V_ENERGY.baseOutput * 100,
      `planck_harvester (${firstVI.baseOutput.toExponential(2)}) should be >100x omega_point_engine (${LAST_TYPE_V_ENERGY.baseOutput.toExponential(2)})`)
  })

  it('100th Type VI building should cost ~50–210x the first (same cost-curve steepness as other tiers)', () => {
    for (const b of TYPE_VI_BUILDINGS) {
      const firstCost = calcBuildingCost(b.baseCost, b.costMultiplier, 0, 1)
      const hundredthCost = calcBuildingCost(b.baseCost, b.costMultiplier, 99, 1)
      const ratio = hundredthCost / firstCost
      expect(ratio).toBeGreaterThan(50,
        `${b.id}: 100th building costs only ${ratio.toFixed(0)}x the first — curve too flat`)
      expect(ratio).toBeLessThan(210,
        `${b.id}: 100th building costs ${ratio.toFixed(0)}x the first — curve too steep`)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. MEGASTRUCTURE BALANCE
// ─────────────────────────────────────────────────────────────────────────────

describe('Megastructure balance', () => {
  const omegaStructure = MEGASTRUCTURES.find(m => m.id === 'omega_structure')!
  const infinityForge = MEGASTRUCTURES.find(m => m.id === 'infinity_forge')!
  const chronosphere = MEGASTRUCTURES.find(m => m.id === 'chronosphere')!

  describe('Omega Structure', () => {
    it('should give exactly 10x credits multiplier', () => {
      expect(omegaStructure.creditsMultiplier).toBe(10.0)
    })

    it('should give exactly 10x energy multiplier', () => {
      expect(omegaStructure.energyMultiplier).toBe(10.0)
    })

    it('should give exactly 5x pop multiplier', () => {
      expect(omegaStructure.popMultiplier).toBe(5.0)
    })

    it('should require exactly 4 research entries (including all key branches)', () => {
      expect(omegaStructure.requiredResearch).toHaveLength(4)
      expect(omegaStructure.requiredResearch).toContain('exo_reality')
      expect(omegaStructure.requiredResearch).toContain('ind_reality_fab')
      expect(omegaStructure.requiredResearch).toContain('nrg_omega')
      expect(omegaStructure.requiredResearch).toContain('soc_omega')
    })

    it('Omega Structure bonus should be the largest single credits multiplier among all megas', () => {
      const maxOtherCredits = MEGASTRUCTURES
        .filter(m => m.id !== 'omega_structure')
        .map(m => m.creditsMultiplier ?? 1)
        .reduce((a, b) => Math.max(a, b), 0)
      expect(omegaStructure.creditsMultiplier!).toBeGreaterThan(maxOtherCredits)
    })
  })

  describe('Infinity Forge', () => {
    it('should give exactly 3x credits', () => {
      expect(infinityForge.creditsMultiplier).toBe(3.0)
    })

    it('should give exactly 3x energy', () => {
      expect(infinityForge.energyMultiplier).toBe(3.0)
    })

    it('should reduce upkeep by 20% (upkeepReduction = 0.8)', () => {
      expect(infinityForge.upkeepReduction).toBe(0.8)
    })

    it('should require ind_reality_fab as prerequisite research', () => {
      expect(infinityForge.requiredResearch).toContain('ind_reality_fab')
    })
  })

  describe('Chronosphere', () => {
    it('should give exactly 3x research speed', () => {
      expect(chronosphere.researchSpeed).toBe(3.0)
    })

    it('should give exactly 2x credits', () => {
      expect(chronosphere.creditsMultiplier).toBe(2.0)
    })

    it('should give exactly 2x energy', () => {
      expect(chronosphere.energyMultiplier).toBe(2.0)
    })

    it('should require exo_reality as prerequisite research', () => {
      expect(chronosphere.requiredResearch).toContain('exo_reality')
    })
  })

  it('all megastructure credits/energy multipliers should be individually < 500x', () => {
    for (const m of MEGASTRUCTURES) {
      if (m.creditsMultiplier) {
        expect(m.creditsMultiplier).toBeLessThan(500,
          `${m.id} credits mult ${m.creditsMultiplier}x is unreasonably large`)
      }
      if (m.energyMultiplier) {
        expect(m.energyMultiplier).toBeLessThan(500,
          `${m.id} energy mult ${m.energyMultiplier}x is unreasonably large`)
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. BUILDING MULTIPLIER AT LARGE QUANTITIES
// ─────────────────────────────────────────────────────────────────────────────

describe('calcBuildingMultiplier at large quantities', () => {
  it('500 buildings gives 2^20 = 1,048,576x', () => {
    expect(calcBuildingMultiplier(500)).toBe(1048576)
  })

  it('1000 buildings gives 2^40 ≈ 1.1 trillion', () => {
    expect(calcBuildingMultiplier(1000)).toBe(Math.pow(2, 40))
  })

  it('multiplier doubles every 25 buildings consistently', () => {
    for (let n = 0; n <= 200; n += 25) {
      const current = calcBuildingMultiplier(n)
      const next25 = calcBuildingMultiplier(n + 25)
      expect(next25).toBe(current * 2,
        `multiplier at ${n + 25} should be 2x ${n}`)
    }
  })
})
