import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier, calcBuildingCost, calcPrestigeInfluence, calcRepeatableCost } from '../../app/utils/gameMath'

// ─────────────────────────────────────────────────────────────────────────────
// Raw data mirrored from config files (read-only copies for test isolation)
// ─────────────────────────────────────────────────────────────────────────────

interface Building {
  id: string
  baseCost: number
  costMultiplier: number
  baseOutput: number
  resource: 'credits' | 'energy' | 'autoclick'
  unlockKardashev: number
  energyUpkeep?: number
  creditsUpkeep?: number
}

// prettier-ignore
const TYPE_VI_BUILDINGS: Building[] = [
  // Credits
  { id: 'genesis_compiler', baseCost: 1e42,   costMultiplier: 1.045, baseOutput: 3.65e37, resource: 'credits', unlockKardashev: 6, energyUpkeep: 1.75e37 },
  { id: 'axiom_mint',       baseCost: 50e42,  costMultiplier: 1.048, baseOutput: 1.28e39, resource: 'credits', unlockKardashev: 6, energyUpkeep: 2.46e38 },
  { id: 'void_consortium',  baseCost: 50e45,  costMultiplier: 1.053, baseOutput: 6.26e41, resource: 'credits', unlockKardashev: 6, energyUpkeep: 1.20e41 },
  { id: 'absolute_engine',  baseCost: 1e48,   costMultiplier: 1.055, baseOutput: 8.77e42, resource: 'credits', unlockKardashev: 6, energyUpkeep: 4.21e42 },
  // Energy
  { id: 'planck_harvester',   baseCost: 5e42,   costMultiplier: 1.045, baseOutput: 1.46e38, resource: 'energy', unlockKardashev: 6, creditsUpkeep: 4.38e36 },
  { id: 'logos_reactor',      baseCost: 100e42, costMultiplier: 1.048, baseOutput: 2.05e39, resource: 'energy', unlockKardashev: 6, creditsUpkeep: 1.54e38 },
  { id: 'eschaton_dynamo',    baseCost: 100e45, costMultiplier: 1.053, baseOutput: 1.00e42, resource: 'energy', unlockKardashev: 6, creditsUpkeep: 7.52e40 },
  { id: 'source_code_engine', baseCost: 5e48,   costMultiplier: 1.055, baseOutput: 3.51e43, resource: 'energy', unlockKardashev: 6, creditsUpkeep: 1.05e42 },
]

// Last two Type V buildings (for cross-tier comparison)
const LAST_TYPE_V_CREDITS: Building = {
  id: 'omniscience_engine', baseCost: 1e39, costMultiplier: 1.055,
  baseOutput: 2.92e34, resource: 'credits', unlockKardashev: 5, energyUpkeep: 1.40e34
}
const LAST_TYPE_V_ENERGY: Building = {
  id: 'omega_point_engine', baseCost: 5e39, costMultiplier: 1.055,
  baseOutput: 1.17e35, resource: 'energy', unlockKardashev: 5, creditsUpkeep: 3.51e33
}

// Repeatable research definitions (from useResearchConfig)
interface RepResearch {
  id: string
  baseEnergyCost: number
  costScale: number
  baseResearchTime: number
  timeScale: number
  valuePerLevel: number
  stat: string
}

// prettier-ignore
const REPEATABLE_RESEARCH: RepResearch[] = [
  { id: 'rep_industry', baseEnergyCost: 1e30, costScale: 2.0, baseResearchTime: 120, timeScale: 1.2, valuePerLevel: 1.05, stat: 'creditsMultiplier' },
  { id: 'rep_energy',   baseEnergyCost: 1e30, costScale: 2.0, baseResearchTime: 120, timeScale: 1.2, valuePerLevel: 1.05, stat: 'energyMultiplier'  },
  { id: 'rep_society',  baseEnergyCost: 1e30, costScale: 2.0, baseResearchTime: 120, timeScale: 1.2, valuePerLevel: 1.05, stat: 'popMultiplier'     },
  { id: 'rep_exotic',   baseEnergyCost: 2e30, costScale: 2.5, baseResearchTime: 180, timeScale: 1.3, valuePerLevel: 1.02, stat: 'creditsMultiplier' },
]

// Megastructure definitions relevant to endgame (from useResearchConfig)
interface Mega {
  id: string
  unlockKardashev: number
  requiredResearch: string[]
  creditsMultiplier?: number
  energyMultiplier?: number
  popMultiplier?: number
  upkeepReduction?: number
  researchSpeed?: number
}

// prettier-ignore
const MEGASTRUCTURES: Mega[] = [
  { id: 'stellar_forge',    unlockKardashev: 2, requiredResearch: ['ind_megascale'],                                    creditsMultiplier: 1.5 },
  { id: 'dyson_brain',      unlockKardashev: 2, requiredResearch: ['nrg_zero_point'],                                   energyMultiplier: 2.0, popMultiplier: 1.5 },
  { id: 'nidavellir_forge', unlockKardashev: 3, requiredResearch: ['exo_dark_matter'],                                  creditsMultiplier: 2.0, energyMultiplier: 2.0 },
  { id: 'matrioshka_brain', unlockKardashev: 3, requiredResearch: ['ind_matter_prog', 'nrg_vacuum'],                    popMultiplier: 2.0, researchSpeed: 2.0 },
  { id: 'genesis_engine',   unlockKardashev: 4, requiredResearch: ['ind_reality_fab'],                                  creditsMultiplier: 3.0, energyMultiplier: 2.0 },
  { id: 'cosmic_engine',    unlockKardashev: 4, requiredResearch: ['nrg_entropy_rev', 'exo_dimension'],                 creditsMultiplier: 2.0, energyMultiplier: 3.0 },
  { id: 'reality_engine',   unlockKardashev: 5, requiredResearch: ['exo_reality'],                                      creditsMultiplier: 5.0, energyMultiplier: 5.0 },
  { id: 'omega_structure',  unlockKardashev: 5, requiredResearch: ['exo_reality', 'ind_reality_fab', 'nrg_omega', 'soc_omega'], creditsMultiplier: 10.0, energyMultiplier: 10.0, popMultiplier: 5.0 },
  { id: 'infinity_forge',   unlockKardashev: 6, requiredResearch: ['ind_reality_fab'],                                  creditsMultiplier: 3.0, energyMultiplier: 3.0, upkeepReduction: 0.8 },
  { id: 'chronosphere',     unlockKardashev: 6, requiredResearch: ['exo_reality'],                                      creditsMultiplier: 2.0, energyMultiplier: 2.0, researchSpeed: 3.0 },
]

// One-time prestige upgrades affecting credits and energy (from useGameConfig)
const PRESTIGE_CREDITS_MULTIPLIERS = [
  { id: 'quantum_computing',  value: 2 },
  { id: 'corporate_synergy',  value: 3 },
  { id: 'galactic_monopoly',  value: 5 },
]
const PRESTIGE_ENERGY_MULTIPLIERS = [
  { id: 'plasma_reactors',     value: 2 },
  { id: 'fusion_breakthrough', value: 3 },
  { id: 'stellar_mastery',     value: 5 },
]

// Repeatable prestige upgrades (from useGameConfig)
const REPEATABLE_PRESTIGE = [
  { id: 'profit_margins',         baseCost: 2, costScale: 1.5, maxLevel: 20, valuePerLevel: 1.15, stat: 'creditsMultiplier'     },
  { id: 'reactor_efficiency',     baseCost: 2, costScale: 1.5, maxLevel: 20, valuePerLevel: 1.15, stat: 'energyMultiplier'       },
  { id: 'click_amplifier',        baseCost: 3, costScale: 1.5, maxLevel: 20, valuePerLevel: 1.15, stat: 'clickMultiplier'        },
  { id: 'workforce_training',     baseCost: 3, costScale: 1.5, maxLevel: 20, valuePerLevel: 1.15, stat: 'popMultiplier'          },
  { id: 'bulk_purchasing',        baseCost: 4, costScale: 1.8, maxLevel: 15, valuePerLevel: 0.95, stat: 'buildingCostMultiplier' },
  { id: 'casino_vip',             baseCost: 3, costScale: 1.6, maxLevel: 15, valuePerLevel: 1.1,  stat: 'casinoMultiplier'       },
  { id: 'operational_efficiency', baseCost: 4, costScale: 1.8, maxLevel: 15, valuePerLevel: 0.95, stat: 'upkeepReduction'        },
]

// Research credits multipliers (from useResearchConfig)
const RESEARCH_CREDITS_MULTS = [
  { id: 'ind_automation',  value: 1.15 },
  { id: 'ind_logistics',   value: 1.25 },
  { id: 'ind_megascale',   value: 1.2  },
  { id: 'ind_reality_fab', value: 2.0  },
  { id: 'exo_xeno_arch',   value: 1.1  },
  { id: 'exo_dimension',   value: 1.5  },
  { id: 'exo_reality',     value: 3.0  },
]
// Research energy multipliers
const RESEARCH_ENERGY_MULTS = [
  { id: 'nrg_grid_opt',    value: 1.15 },
  { id: 'nrg_fusion_adv',  value: 1.25 },
  { id: 'nrg_antimatter',  value: 1.3  },
  { id: 'nrg_zero_point',  value: 1.5  },
  { id: 'nrg_vacuum',      value: 1.75 },
  { id: 'nrg_entropy_rev', value: 2.0  },
  { id: 'nrg_omega',       value: 3.0  },
  { id: 'exo_xeno_arch',   value: 1.1  },
  { id: 'exo_dark_matter', value: 1.5  },
  { id: 'exo_dimension',   value: 1.5  },
]

// Ascension perks: best per tier for each resource (from useAscensionPerks)
// One perk chosen per Kardashev tier 1-5
const ASCENSION_CREDITS_BEST = [
  { tier: 1, id: 'efficient_bureaucracy', value: 1.25 }, // +25% credits
  { tier: 2, id: 'none',                  value: 1.0  }, // no credits perk at tier 2
  { tier: 3, id: 'temporal_arbitrage',    value: 1.5  }, // +50% credits
  { tier: 4, id: 'universal_omniscience', value: 1.5  }, // +50% credits
  { tier: 5, id: 'reality_engineering',   value: 2.0  }, // +100% credits
]
const ASCENSION_ENERGY_BEST = [
  { tier: 1, id: 'energy_surplus_protocol', value: 1.25 }, // +25% energy
  { tier: 2, id: 'stellar_harvesting',      value: 1.5  }, // +50% energy
  { tier: 3, id: 'dark_energy_mastery',     value: 1.5  }, // +50% energy
  { tier: 4, id: 'vacuum_manipulation',     value: 2.0  }, // +100% energy
  { tier: 5, id: 'entropy_reversal',        value: 2.0  }, // +100% energy
]

// Achievement IDs from useAchievements (35 total, verified)
const ACHIEVEMENT_IDS = [
  'first_click', 'click_100', 'click_10000',
  'credits_10k', 'credits_1m', 'credits_1b', 'credits_1t', 'credits_1q',
  'energy_10k', 'energy_1m', 'energy_1b', 'energy_1t',
  'type_1', 'type_2', 'type_3', 'type_4', 'type_5',
  'first_prestige', 'prestige_5', 'prestige_10', 'prestige_25', 'prestige_50',
  'casino_win_big', 'casino_100_games',
  'first_subsidiary', 'portfolio_1m',
  'building_100', 'all_type0', 'building_500', 'building_1000',
  'research_all',
  'mega_first', 'mega_all',
  'all_prestige_bought',
  'influence_10k',
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
    // At 1.045: 1.045^99 ≈ 78x. At 1.055: 1.055^99 ≈ 200.4x. Bound is [50, 210].
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

  it('all Type VI buildings should have unlockKardashev 6', () => {
    for (const b of TYPE_VI_BUILDINGS) {
      expect(b.unlockKardashev).toBe(6, `${b.id} should require Kardashev 6`)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. REPEATABLE RESEARCH BALANCE
// ─────────────────────────────────────────────────────────────────────────────

describe('Repeatable research balance', () => {
  it('costScale for industry/energy/society should be exactly 2.0 (doubles each level)', () => {
    for (const r of REPEATABLE_RESEARCH.filter(r => r.id !== 'rep_exotic')) {
      expect(r.costScale).toBe(2.0, `${r.id} costScale should be 2.0`)
    }
  })

  it('rep_exotic costScale should be 2.5 (more expensive scaling)', () => {
    const exotic = REPEATABLE_RESEARCH.find(r => r.id === 'rep_exotic')!
    expect(exotic.costScale).toBe(2.5)
  })

  it('at level 10, cost should equal baseEnergyCost * costScale^10 (=1024x base for industry/energy)', () => {
    for (const r of REPEATABLE_RESEARCH.filter(r => r.id !== 'rep_exotic')) {
      const expectedLevel10Cost = r.baseEnergyCost * Math.pow(r.costScale, 10)
      // costScale=2.0 -> 2^10 = 1024
      expect(expectedLevel10Cost).toBeCloseTo(r.baseEnergyCost * 1024, 0)
      // Verify via calcRepeatableCost helper
      const computed = calcRepeatableCost(r.baseEnergyCost, r.costScale, 10)
      expect(computed).toBe(Math.floor(expectedLevel10Cost))
    }
  })

  it('at level 1, cost doubles from base (costScale=2.0)', () => {
    for (const r of REPEATABLE_RESEARCH.filter(r => r.id !== 'rep_exotic')) {
      const level1Cost = calcRepeatableCost(r.baseEnergyCost, r.costScale, 1)
      expect(level1Cost).toBe(Math.floor(r.baseEnergyCost * 2))
    }
  })

  it('multiplier at level 10 (industry/energy) should be 1.05^10 ≈ 1.629x — modest, not runaway', () => {
    const expected = Math.pow(1.05, 10) // ≈ 1.6289
    for (const r of REPEATABLE_RESEARCH.filter(r => r.id !== 'rep_exotic')) {
      const mult = Math.pow(r.valuePerLevel, 10)
      expect(mult).toBeCloseTo(expected, 3)
      expect(mult).toBeLessThan(2.0, `${r.id} lv10 mult ${mult.toFixed(3)}x should be < 2x (not runaway)`)
    }
  })

  it('multiplier at level 50 (industry/energy) should be 1.05^50 ≈ 11.47x — significant but bounded', () => {
    const expected = Math.pow(1.05, 50) // ≈ 11.467
    for (const r of REPEATABLE_RESEARCH.filter(r => r.id !== 'rep_exotic')) {
      const mult = Math.pow(r.valuePerLevel, 50)
      expect(mult).toBeCloseTo(expected, 1)
      expect(mult).toBeGreaterThan(10, `${r.id} lv50 mult should be > 10x (meaningful endgame bonus)`)
      expect(mult).toBeLessThan(15,   `${r.id} lv50 mult ${mult.toFixed(2)}x should be < 15x (bounded)`)
    }
  })

  it('exotic branch gives less per level (1.02x vs 1.05x) but affects all production', () => {
    const exotic = REPEATABLE_RESEARCH.find(r => r.id === 'rep_exotic')!
    const industry = REPEATABLE_RESEARCH.find(r => r.id === 'rep_industry')!
    expect(exotic.valuePerLevel).toBeLessThan(industry.valuePerLevel,
      'rep_exotic valuePerLevel should be smaller than rep_industry')
    expect(exotic.valuePerLevel).toBe(1.02)

    // At lv50: 1.02^50 ≈ 2.69x vs 1.05^50 ≈ 11.47x
    const exoticMult50 = Math.pow(exotic.valuePerLevel, 50)
    const industryMult50 = Math.pow(industry.valuePerLevel, 50)
    expect(exoticMult50).toBeCloseTo(2.69, 1)
    expect(industryMult50 / exoticMult50).toBeGreaterThan(3,
      'Industry lv50 should be >3x more potent than exotic lv50 to justify the tradeoff')
  })

  it('research time should increase with each level (timeScale > 1.0)', () => {
    for (const r of REPEATABLE_RESEARCH) {
      expect(r.timeScale).toBeGreaterThan(1.0, `${r.id} timeScale must be > 1 so time increases`)
      const timeAtLevel10 = r.baseResearchTime * Math.pow(r.timeScale, 10)
      expect(timeAtLevel10).toBeGreaterThan(r.baseResearchTime,
        `${r.id} time at level 10 should exceed base time`)
    }
  })

  it('rep_exotic time and cost should be higher than standard repeatables at level 0', () => {
    const exotic = REPEATABLE_RESEARCH.find(r => r.id === 'rep_exotic')!
    const standard = REPEATABLE_RESEARCH.find(r => r.id === 'rep_industry')!
    expect(exotic.baseEnergyCost).toBeGreaterThan(standard.baseEnergyCost)
    expect(exotic.baseResearchTime).toBeGreaterThan(standard.baseResearchTime)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. MEGASTRUCTURE BALANCE
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

    it('should require exactly 4 tier-5 research entries (including all key branches)', () => {
      // requiredResearch: ['exo_reality', 'ind_reality_fab', 'nrg_omega', 'soc_omega']
      expect(omegaStructure.requiredResearch).toHaveLength(4)
      expect(omegaStructure.requiredResearch).toContain('exo_reality')
      expect(omegaStructure.requiredResearch).toContain('ind_reality_fab')
      expect(omegaStructure.requiredResearch).toContain('nrg_omega')
      expect(omegaStructure.requiredResearch).toContain('soc_omega')
    })

    it('should be gated at Kardashev 5 (unlocks during KV play)', () => {
      expect(omegaStructure.unlockKardashev).toBe(5)
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

    it('should require Kardashev 6', () => {
      expect(infinityForge.unlockKardashev).toBe(6)
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

    it('should require Kardashev 6', () => {
      expect(chronosphere.unlockKardashev).toBe(6)
    })

    it('should require exo_reality as prerequisite research', () => {
      expect(chronosphere.requiredResearch).toContain('exo_reality')
    })
  })

  it('both post-victory megastructures (infinity_forge, chronosphere) require unlockKardashev 6', () => {
    const postVictoryMegas = MEGASTRUCTURES.filter(m =>
      m.id === 'infinity_forge' || m.id === 'chronosphere'
    )
    expect(postVictoryMegas).toHaveLength(2)
    for (const m of postVictoryMegas) {
      expect(m.unlockKardashev).toBe(6,
        `${m.id} should require KVI (unlockKardashev=6), got ${m.unlockKardashev}`)
    }
  })

  it('pre-victory megastructures should require Kardashev <= 5', () => {
    const preVictory = MEGASTRUCTURES.filter(m =>
      m.id !== 'infinity_forge' && m.id !== 'chronosphere'
    )
    for (const m of preVictory) {
      expect(m.unlockKardashev).toBeLessThanOrEqual(5,
        `${m.id} is not a post-victory mega but requires KVI`)
    }
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
// 4. ACHIEVEMENT COMPLETENESS
// ─────────────────────────────────────────────────────────────────────────────

describe('Achievement completeness', () => {
  it('total achievement count should be 35', () => {
    expect(ACHIEVEMENT_IDS).toHaveLength(35)
  })

  it('all achievement IDs should be unique (no duplicates)', () => {
    const unique = new Set(ACHIEVEMENT_IDS)
    expect(unique.size).toBe(ACHIEVEMENT_IDS.length,
      `Found ${ACHIEVEMENT_IDS.length - unique.size} duplicate achievement ID(s)`)
  })

  it('every Kardashev level 1 through 5 should have a dedicated achievement', () => {
    for (let level = 1; level <= 5; level++) {
      expect(ACHIEVEMENT_IDS).toContain(`type_${level}`,
        `Missing achievement for Kardashev Type ${level}`)
    }
  })

  it('should NOT have a type_6 achievement (Type VI is post-victory, not an achievement gate)', () => {
    expect(ACHIEVEMENT_IDS).not.toContain('type_6')
  })

  it('prestige milestone achievements should exist at 1, 5, 10, 25, and 50 prestiges', () => {
    expect(ACHIEVEMENT_IDS).toContain('first_prestige')
    expect(ACHIEVEMENT_IDS).toContain('prestige_5')
    expect(ACHIEVEMENT_IDS).toContain('prestige_10')
    expect(ACHIEVEMENT_IDS).toContain('prestige_25')
    expect(ACHIEVEMENT_IDS).toContain('prestige_50')
  })

  it('should have both megastructure achievements (first and all)', () => {
    expect(ACHIEVEMENT_IDS).toContain('mega_first')
    expect(ACHIEVEMENT_IDS).toContain('mega_all')
  })

  it('credits milestone achievements should cover early, mid, and late game', () => {
    // 10K (early), 1M, 1B, 1T, 1Qa (endgame)
    expect(ACHIEVEMENT_IDS).toContain('credits_10k')
    expect(ACHIEVEMENT_IDS).toContain('credits_1m')
    expect(ACHIEVEMENT_IDS).toContain('credits_1b')
    expect(ACHIEVEMENT_IDS).toContain('credits_1t')
    expect(ACHIEVEMENT_IDS).toContain('credits_1q')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. FULL MULTIPLIER STACK VALIDATION (CRITICAL)
// ─────────────────────────────────────────────────────────────────────────────

describe('Full multiplier stack validation', () => {
  // Pre-compute each category's contribution
  // These numbers are calculated from the exact config values above.

  // Prestige one-time: credits = 2 * 3 * 5 = 30x, energy = 2 * 3 * 5 = 30x
  const prestigeCreditsTotal = PRESTIGE_CREDITS_MULTIPLIERS.reduce((acc, p) => acc * p.value, 1)
  const prestigeEnergyTotal = PRESTIGE_ENERGY_MULTIPLIERS.reduce((acc, p) => acc * p.value, 1)

  // Repeatable prestige at max level: 1.15^20 ≈ 16.37x
  const profitMargins = REPEATABLE_PRESTIGE.find(r => r.id === 'profit_margins')!
  const reactorEff = REPEATABLE_PRESTIGE.find(r => r.id === 'reactor_efficiency')!
  const repeatPrestigeCreditsMax = Math.pow(profitMargins.valuePerLevel, profitMargins.maxLevel)
  const repeatPrestigeEnergyMax = Math.pow(reactorEff.valuePerLevel, reactorEff.maxLevel)

  // Research totals
  const researchCreditsTotal = RESEARCH_CREDITS_MULTS.reduce((acc, r) => acc * r.value, 1)
  const researchEnergyTotal = RESEARCH_ENERGY_MULTS.reduce((acc, r) => acc * r.value, 1)

  // Megastructures: multiply all individual creditsMultiplier / energyMultiplier values
  const megaCreditsTotal = MEGASTRUCTURES.reduce((acc, m) => acc * (m.creditsMultiplier ?? 1), 1)
  const megaEnergyTotal = MEGASTRUCTURES.reduce((acc, m) => acc * (m.energyMultiplier ?? 1), 1)

  // Ascension: one perk chosen per tier, best-case for each resource
  const ascensionCreditsTotal = ASCENSION_CREDITS_BEST.reduce((acc, p) => acc * p.value, 1)
  const ascensionEnergyTotal = ASCENSION_ENERGY_BEST.reduce((acc, p) => acc * p.value, 1)

  // Repeatable research at level 50 (endgame scenario)
  const repResearchCredits50 = Math.pow(1.05, 50) // rep_industry at lv50
  const repResearchEnergy50 = Math.pow(1.05, 50)  // rep_energy at lv50

  // Grand totals
  const totalCreditsMultiplier =
    prestigeCreditsTotal *
    repeatPrestigeCreditsMax *
    researchCreditsTotal *
    megaCreditsTotal *
    ascensionCreditsTotal *
    repResearchCredits50

  const totalEnergyMultiplier =
    prestigeEnergyTotal *
    repeatPrestigeEnergyMax *
    researchEnergyTotal *
    megaEnergyTotal *
    ascensionEnergyTotal *
    repResearchEnergy50

  it('prestige one-time credits total should be 30x (2 * 3 * 5)', () => {
    expect(prestigeCreditsTotal).toBe(30)
  })

  it('prestige one-time energy total should be 30x (2 * 3 * 5)', () => {
    expect(prestigeEnergyTotal).toBe(30)
  })

  it('repeatable prestige at max level 20 should be 1.15^20 ≈ 16.37x', () => {
    expect(repeatPrestigeCreditsMax).toBeCloseTo(16.37, 1)
    expect(repeatPrestigeEnergyMax).toBeCloseTo(16.37, 1)
  })

  it('all research credits multipliers stacked should be ~17x', () => {
    // 1.15 * 1.25 * 1.2 * 2.0 * 1.1 * 1.5 * 3.0 = 17.078
    expect(researchCreditsTotal).toBeCloseTo(17.08, 1)
  })

  it('all research energy multipliers stacked should be ~72.8x', () => {
    // 1.15 * 1.25 * 1.3 * 1.5 * 1.75 * 2.0 * 3.0 * 1.1 * 1.5 * 1.5 = 72.846
    expect(researchEnergyTotal).toBeCloseTo(72.85, 1)
  })

  it('all megastructure credits multipliers stacked should be 5400x', () => {
    // 1.5 * 2.0 * 3.0 * 2.0 * 5.0 * 10.0 * 3.0 * 2.0 = 5400
    expect(megaCreditsTotal).toBe(5400)
  })

  it('all megastructure energy multipliers stacked should be 7200x', () => {
    // 2.0 * 2.0 * 2.0 * 3.0 * 5.0 * 10.0 * 3.0 * 2.0 = 7200
    expect(megaEnergyTotal).toBe(7200)
  })

  it('best-case ascension credits should be ~5.625x', () => {
    // 1.25 * 1.0 * 1.5 * 1.5 * 2.0 = 5.625
    expect(ascensionCreditsTotal).toBeCloseTo(5.625, 2)
  })

  it('best-case ascension energy should be ~11.25x', () => {
    // 1.25 * 1.5 * 1.5 * 2.0 * 2.0 = 11.25
    expect(ascensionEnergyTotal).toBeCloseTo(11.25, 2)
  })

  it('total credits multiplier (all sources maxed) should be < 1e11', () => {
    // Actual computed value: ~2.92e9
    expect(totalCreditsMultiplier).toBeLessThan(1e11)
    expect(totalCreditsMultiplier).toBeGreaterThan(1e6) // still large
    console.log(`Total credits multiplier: ${totalCreditsMultiplier.toExponential(3)}`)
  })

  it('total energy multiplier (all sources maxed) should be < 1e12', () => {
    // Actual computed value: ~3.32e10
    expect(totalEnergyMultiplier).toBeLessThan(1e12)
    expect(totalEnergyMultiplier).toBeGreaterThan(1e6)
    console.log(`Total energy multiplier: ${totalEnergyMultiplier.toExponential(3)}`)
  })

  it('credits and energy total multipliers should be within 50x of each other', () => {
    const ratio = Math.max(totalCreditsMultiplier, totalEnergyMultiplier) /
                  Math.min(totalCreditsMultiplier, totalEnergyMultiplier)
    expect(ratio).toBeLessThan(50,
      `Credits (${totalCreditsMultiplier.toExponential(2)}) vs energy (${totalEnergyMultiplier.toExponential(2)}) — ${ratio.toFixed(1)}x gap exceeds 50x`)
    console.log(`Credits/energy multiplier ratio: ${ratio.toFixed(2)}x`)
  })

  it('no individual megastructure should contribute more than 500x to any single resource', () => {
    for (const m of MEGASTRUCTURES) {
      if (m.creditsMultiplier) {
        expect(m.creditsMultiplier).toBeLessThan(500,
          `${m.id} credits mult ${m.creditsMultiplier}x exceeds 500x`)
      }
      if (m.energyMultiplier) {
        expect(m.energyMultiplier).toBeLessThan(500,
          `${m.id} energy mult ${m.energyMultiplier}x exceeds 500x`)
      }
    }
  })

  it('no individual research should contribute more than 500x to any single resource', () => {
    for (const r of [...RESEARCH_CREDITS_MULTS, ...RESEARCH_ENERGY_MULTS]) {
      expect(r.value).toBeLessThan(500,
        `${r.id} value ${r.value}x exceeds 500x`)
    }
  })

  it('no individual ascension perk should contribute more than 500x to any resource', () => {
    for (const p of [...ASCENSION_CREDITS_BEST, ...ASCENSION_ENERGY_BEST]) {
      expect(p.value).toBeLessThan(500,
        `${p.id} value ${p.value}x exceeds 500x`)
    }
  })

  it('sanity check: max TypeVI building * total energy multiplier should not exceed 1e60', () => {
    // source_code_engine baseOutput: 3.51e43 — the strongest Type VI energy building
    const maxTypeVIOutput = 3.51e43
    const effectiveOutput = maxTypeVIOutput * totalEnergyMultiplier
    expect(effectiveOutput).toBeLessThan(1e60,
      `source_code_engine * total energy mult = ${effectiveOutput.toExponential(2)} exceeds 1e60`)
    console.log(`Max TypeVI energy output with all multipliers: ${effectiveOutput.toExponential(3)}`)
  })

  it('sanity check: max TypeVI credits building * total credits multiplier should not exceed 1e60', () => {
    // absolute_engine baseOutput: 8.77e42
    const maxTypeVIOutput = 8.77e42
    const effectiveOutput = maxTypeVIOutput * totalCreditsMultiplier
    expect(effectiveOutput).toBeLessThan(1e60,
      `absolute_engine * total credits mult = ${effectiveOutput.toExponential(2)} exceeds 1e60`)
    console.log(`Max TypeVI credits output with all multipliers: ${effectiveOutput.toExponential(3)}`)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. PRESTIGE INFLUENCE AT ENDGAME
// ─────────────────────────────────────────────────────────────────────────────

describe('calcPrestigeInfluence at endgame values', () => {
  // Formula: floor(log2(totalEnergyEarned / 1e5) * 50)
  // Kardashev milestone grants are one-time awards handled separately in useGameState

  it('should return 0 below the 1e5 threshold', () => {
    expect(calcPrestigeInfluence(0)).toBe(0)
    expect(calcPrestigeInfluence(99999)).toBe(0)
    expect(calcPrestigeInfluence(1e5 - 1)).toBe(0)
  })

  it('should return a positive value at and above the 1e5 threshold', () => {
    expect(calcPrestigeInfluence(1e5)).toBe(0)   // exactly at threshold: log2(1) * 50 = 0
    expect(calcPrestigeInfluence(2e5)).toBe(50)   // log2(2) * 50 = 50
  })

  it('at 1e50 totalEnergyEarned, per-run influence stays controlled', () => {
    const influence = calcPrestigeInfluence(1e50)
    // log2(1e45) * 50 ≈ 7474
    expect(influence).toBeLessThan(10000,
      `Influence at 1e50: ${influence} — too high, prestige per-run becomes exploitable`)
    expect(influence).toBeGreaterThan(7000,
      `Influence at 1e50: ${influence} — too low, endgame per-run reward feels worthless`)
  })

  it('at 1e60 totalEnergyEarned, per-run influence stays controlled', () => {
    const influence = calcPrestigeInfluence(1e60)
    // log2(1e55) * 50 ≈ 9135
    expect(influence).toBeLessThan(10000)
    expect(influence).toBeGreaterThan(9000)
  })

  it('doubling energy always adds exactly 50 influence', () => {
    const testValues = [1e10, 1e20, 1e30, 1e50, 1e60]
    for (const base of testValues) {
      const at_base = calcPrestigeInfluence(base)
      const at_double = calcPrestigeInfluence(base * 2)
      expect(at_double - at_base).toBe(50,
        `Doubling energy from ${base.toExponential(0)} should add exactly 50 influence, got ${at_double - at_base}`)
    }
  })

  it('influence should increase monotonically (more energy = more influence)', () => {
    const values = [1e5, 1e10, 1e20, 1e30, 1e40, 1e50, 1e60]
    for (let i = 0; i < values.length - 1; i++) {
      expect(calcPrestigeInfluence(values[i + 1])).toBeGreaterThanOrEqual(
        calcPrestigeInfluence(values[i]),
        `Influence should be non-decreasing: ${values[i].toExponential(0)} -> ${values[i + 1].toExponential(0)}`
      )
    }
  })

  it('influence growth per decade (10x energy) should be ~166 (log2(10)*50, floor-bounded)', () => {
    const testBases = [1e10, 1e20, 1e30, 1e40]
    for (const base of testBases) {
      const delta = calcPrestigeInfluence(base * 10) - calcPrestigeInfluence(base)
      expect(delta).toBeGreaterThanOrEqual(166,
        `Delta at 1e${Math.log10(base)} should be >= 166`)
      expect(delta).toBeLessThanOrEqual(167,
        `Delta at 1e${Math.log10(base)} should be <= 167`)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// BONUS: Repeatable prestige cost curve sanity
// ─────────────────────────────────────────────────────────────────────────────

describe('Repeatable prestige upgrade cost curve', () => {
  it('profit_margins cost at level 10 should be baseCost * 1.5^10 ≈ 115x base (prestige currency)', () => {
    const pm = REPEATABLE_PRESTIGE.find(r => r.id === 'profit_margins')!
    const cost10 = calcRepeatableCost(pm.baseCost, pm.costScale, 10) // baseCost=2, costScale=1.5
    const expected = Math.floor(pm.baseCost * Math.pow(pm.costScale, 10))
    expect(cost10).toBe(expected)
    // 2 * 1.5^10 = 2 * 57.665 ≈ 115
    expect(cost10).toBeCloseTo(115, 0)
  })

  it('profit_margins cost at level 20 should be baseCost * 1.5^20 ≈ 6,634 influence', () => {
    const pm = REPEATABLE_PRESTIGE.find(r => r.id === 'profit_margins')!
    const cost20 = calcRepeatableCost(pm.baseCost, pm.costScale, 20)
    const expected = Math.floor(pm.baseCost * Math.pow(1.5, 20))
    expect(cost20).toBe(expected)
    expect(cost20).toBeGreaterThan(5000)
    expect(cost20).toBeLessThan(10000)
  })

  it('bulk_purchasing at max level 15 reduces building costs to 0.95^15 ≈ 46% of base', () => {
    const bp = REPEATABLE_PRESTIGE.find(r => r.id === 'bulk_purchasing')!
    const costMult = Math.pow(bp.valuePerLevel, bp.maxLevel) // 0.95^15
    expect(costMult).toBeCloseTo(0.463, 2)
    // Should never make buildings free
    expect(costMult).toBeGreaterThan(0.3)
    expect(costMult).toBeLessThan(1.0)
  })

  it('operational_efficiency at max level 15 reduces upkeep to 0.95^15 ≈ 46% of base', () => {
    const oe = REPEATABLE_PRESTIGE.find(r => r.id === 'operational_efficiency')!
    const reduction = Math.pow(oe.valuePerLevel, oe.maxLevel)
    expect(reduction).toBeCloseTo(0.463, 2)
    expect(reduction).toBeGreaterThan(0.3, 'Upkeep reduction should not make upkeep free')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// BONUS: calcBuildingMultiplier milestone behavior at endgame quantities
// ─────────────────────────────────────────────────────────────────────────────

describe('calcBuildingMultiplier at large quantities', () => {
  it('milestone at 25 buildings should give 2^1 = 2x', () => {
    expect(calcBuildingMultiplier(25)).toBe(2)
  })

  it('milestone at 50 buildings should give 2^2 = 4x', () => {
    expect(calcBuildingMultiplier(50)).toBe(4)
  })

  it('milestone at 100 buildings should give 2^4 = 16x', () => {
    expect(calcBuildingMultiplier(100)).toBe(16)
  })

  it('milestone at 200 buildings should give 2^8 = 256x', () => {
    expect(calcBuildingMultiplier(200)).toBe(256)
  })

  it('milestone multiplier should double every 25 additional buildings', () => {
    for (let owned = 25; owned <= 200; owned += 25) {
      const current = calcBuildingMultiplier(owned)
      const prev = calcBuildingMultiplier(owned - 25)
      expect(current / prev).toBe(2,
        `At ${owned} buildings, multiplier should be exactly 2x the ${owned - 25} milestone`)
    }
  })

  it('milestone at 24 buildings should still be 2^0 = 1x (no milestone yet)', () => {
    expect(calcBuildingMultiplier(24)).toBe(1)
    expect(calcBuildingMultiplier(1)).toBe(1)
  })
})
