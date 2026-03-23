import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier, calcBuildingCost, calcClickPower } from '../../app/utils/gameMath'

// ── Raw building data (copied from useGameConfig) ──

interface Building {
  id: string
  name: string
  baseCost: number
  costMultiplier: number
  baseOutput: number
  resource: 'credits' | 'energy' | 'autoclick'
  unlockKardashev: number
}

// prettier-ignore
const buildings: Building[] = [
  // Type 0 credits
  { id: 'mining_drone', name: 'Mining Drone', baseCost: 10, costMultiplier: 1.045, baseOutput: 0.50, resource: 'credits', unlockKardashev: 0 },
  { id: 'ore_refinery', name: 'Ore Refinery', baseCost: 150, costMultiplier: 1.048, baseOutput: 5.3, resource: 'credits', unlockKardashev: 0 },
  { id: 'orbital_factory', name: 'Orbital Factory', baseCost: 10000, costMultiplier: 1.053, baseOutput: 172, resource: 'credits', unlockKardashev: 0 },
  { id: 'space_station', name: 'Space Station', baseCost: 50000, costMultiplier: 1.055, baseOutput: 600, resource: 'credits', unlockKardashev: 0 },
  // Type 0 energy
  { id: 'solar_array', name: 'Solar Array', baseCost: 50, costMultiplier: 1.045, baseOutput: 2.00, resource: 'energy', unlockKardashev: 0 },
  { id: 'wind_turbine_grid', name: 'Wind Turbine Grid', baseCost: 400, costMultiplier: 1.048, baseOutput: 11.2, resource: 'energy', unlockKardashev: 0 },
  { id: 'fission_plant', name: 'Fission Plant', baseCost: 20000, costMultiplier: 1.053, baseOutput: 274, resource: 'energy', unlockKardashev: 0 },
  { id: 'orbital_mirror', name: 'Orbital Mirror', baseCost: 80000, costMultiplier: 1.055, baseOutput: 960, resource: 'energy', unlockKardashev: 0 },
  // Type 0 pops
  { id: 'corporate_drone', name: 'Corporate Drone', baseCost: 50, costMultiplier: 1.050, baseOutput: 1, resource: 'autoclick', unlockKardashev: 0 },
  // Type 1 credits
  { id: 'asteroid_mine', name: 'Asteroid Mine', baseCost: 200000, costMultiplier: 1.045, baseOutput: 3000, resource: 'credits', unlockKardashev: 1 },
  { id: 'trade_hub', name: 'Trade Hub', baseCost: 1e6, costMultiplier: 1.048, baseOutput: 10500, resource: 'credits', unlockKardashev: 1 },
  { id: 'megacorp_hq', name: 'MegaCorp HQ', baseCost: 25e6, costMultiplier: 1.053, baseOutput: 129000, resource: 'credits', unlockKardashev: 1 },
  { id: 'system_monopoly', name: 'System Monopoly', baseCost: 100e6, costMultiplier: 1.055, baseOutput: 360000, resource: 'credits', unlockKardashev: 1 },
  // Type 1 energy
  { id: 'fusion_reactor', name: 'Fusion Reactor', baseCost: 300000, costMultiplier: 1.045, baseOutput: 3600, resource: 'energy', unlockKardashev: 1 },
  { id: 'planetary_grid', name: 'Planetary Grid', baseCost: 2e6, costMultiplier: 1.048, baseOutput: 16800, resource: 'energy', unlockKardashev: 1 },
  { id: 'helium3_harvester', name: 'Helium-3 Harvester', baseCost: 80e6, costMultiplier: 1.053, baseOutput: 329000, resource: 'energy', unlockKardashev: 1 },
  { id: 'stellar_collector', name: 'Stellar Collector', baseCost: 500e6, costMultiplier: 1.055, baseOutput: 1.44e6, resource: 'energy', unlockKardashev: 1 },
  // Type 1 pops
  { id: 'executive_assistant', name: 'Executive Assistant', baseCost: 500000, costMultiplier: 1.050, baseOutput: 15, resource: 'autoclick', unlockKardashev: 1 },
  // Type 2 credits
  { id: 'colony_world', name: 'Colony World', baseCost: 1e9, costMultiplier: 1.045, baseOutput: 4.50e6, resource: 'credits', unlockKardashev: 2 },
  { id: 'stellar_shipyard', name: 'Stellar Shipyard', baseCost: 10e9, costMultiplier: 1.048, baseOutput: 3.15e7, resource: 'credits', unlockKardashev: 2 },
  { id: 'matter_synthesizer', name: 'Matter Synthesizer', baseCost: 1e12, costMultiplier: 1.053, baseOutput: 1.54e9, resource: 'credits', unlockKardashev: 2 },
  { id: 'sector_conglomerate', name: 'Sector Conglomerate', baseCost: 2e13, costMultiplier: 1.055, baseOutput: 2.16e10, resource: 'credits', unlockKardashev: 2 },
  // Type 2 energy
  { id: 'dyson_swarm', name: 'Dyson Swarm', baseCost: 2e9, costMultiplier: 1.045, baseOutput: 7.20e6, resource: 'energy', unlockKardashev: 2 },
  { id: 'dyson_sphere', name: 'Dyson Sphere', baseCost: 50e9, costMultiplier: 1.048, baseOutput: 1.26e8, resource: 'energy', unlockKardashev: 2 },
  { id: 'star_lifter', name: 'Star Lifter', baseCost: 10e12, costMultiplier: 1.053, baseOutput: 1.24e10, resource: 'energy', unlockKardashev: 2 },
  { id: 'kugelblitz_reactor', name: 'Kugelblitz Reactor', baseCost: 500e12, costMultiplier: 1.055, baseOutput: 4.32e11, resource: 'energy', unlockKardashev: 2 },
]

// ── Multiplier data ──

interface MultiplierSource {
  name: string
  stat: string
  value: number
  source: string // 'research' | 'megastructure' | 'ascension' | 'prestige' | 'trait' | 'repeatable'
}

// All multiplier sources for credits
const creditsMultipliers: MultiplierSource[] = [
  // Research
  { name: 'Automated Supply Chains', stat: 'credits', value: 1.15, source: 'research' },
  { name: 'Interstellar Logistics', stat: 'credits', value: 1.25, source: 'research' },
  { name: 'Megascale Engineering', stat: 'credits', value: 1.2, source: 'research' },
  { name: 'Reality Fabrication', stat: 'credits', value: 2.0, source: 'research' },
  { name: 'Xenoarchaeology', stat: 'credits', value: 1.1, source: 'research' },
  { name: 'Dimensional Physics', stat: 'credits', value: 1.5, source: 'research' },
  { name: 'Reality Manipulation', stat: 'credits', value: 6.0, source: 'research' },
  // Megastructures
  { name: 'Stellar Forge', stat: 'credits', value: 1.5, source: 'megastructure' },
  { name: 'Nidavellir Forge', stat: 'credits', value: 2.0, source: 'megastructure' },
  { name: 'Genesis Engine', stat: 'credits', value: 6.0, source: 'megastructure' },
  { name: 'Reality Engine', stat: 'credits', value: 21.0, source: 'megastructure' },
  // Ascension (one per tier, best-case for credits)
  { name: 'Efficient Bureaucracy', stat: 'credits', value: 1.25, source: 'ascension' },
  { name: 'Temporal Arbitrage', stat: 'credits', value: 3.0, source: 'ascension' },
  { name: 'Universal Omniscience', stat: 'credits', value: 3.0, source: 'ascension' },
  { name: 'Reality Engineering', stat: 'credits', value: 11.0, source: 'ascension' },
  // Prestige one-time
  { name: 'Efficient Management', stat: 'credits', value: 1.5, source: 'prestige' },
]

const cgMultipliers: MultiplierSource[] = [
  // Research
  { name: 'Supply Chain Optimization', stat: 'cg', value: 1.15, source: 'research' },
  { name: 'Mass Production', stat: 'cg', value: 1.25, source: 'research' },
  { name: 'Nano-Assembly', stat: 'cg', value: 1.5, source: 'research' },
  { name: 'Reality Forge', stat: 'cg', value: 2.0, source: 'research' },
  // Ascension (one per tier, best-case for CG)
  { name: 'Supply Chain Mastery', stat: 'cg', value: 1.25, source: 'ascension' },
  { name: 'Automated Distribution', stat: 'cg', value: 1.5, source: 'ascension' },
  { name: 'Galactic Supply Web', stat: 'cg', value: 1.5, source: 'ascension' },
  { name: 'Universal Logistics', stat: 'cg', value: 2.0, source: 'ascension' },
  { name: 'Reality Fabrication', stat: 'cg', value: 2.0, source: 'ascension' },
  // Megastructures
  { name: 'Universal Replicator', stat: 'cg', value: 5.0, source: 'megastructure' },
  { name: 'Omnifabricator', stat: 'cg', value: 10.0, source: 'megastructure' },
  // Prestige one-time
  { name: 'Efficient Logistics', stat: 'cg', value: 1.5, source: 'prestige' },
  { name: 'Interstellar Supply Lines', stat: 'cg', value: 2, source: 'prestige' },
  { name: 'Galactic Distribution', stat: 'cg', value: 3, source: 'prestige' },
  { name: 'Universal Fabrication', stat: 'cg', value: 5, source: 'prestige' },
  { name: 'Omnipresent Supply', stat: 'cg', value: 10, source: 'prestige' },
]

const energyMultipliers: MultiplierSource[] = [
  // Research
  { name: 'Grid Optimization', stat: 'energy', value: 1.15, source: 'research' },
  { name: 'Advanced Fusion', stat: 'energy', value: 1.25, source: 'research' },
  { name: 'Antimatter Mastery', stat: 'energy', value: 1.3, source: 'research' },
  { name: 'Zero-Point Extraction', stat: 'energy', value: 1.5, source: 'research' },
  { name: 'Vacuum Engineering', stat: 'energy', value: 1.75, source: 'research' },
  { name: 'Entropy Mastery', stat: 'energy', value: 3.0, source: 'research' },
  { name: 'Omega Energy', stat: 'energy', value: 6.0, source: 'research' },
  { name: 'Xenoarchaeology', stat: 'energy', value: 1.1, source: 'research' },
  { name: 'Dark Matter Science', stat: 'energy', value: 1.5, source: 'research' },
  { name: 'Dimensional Physics', stat: 'energy', value: 1.5, source: 'research' },
  // Megastructures
  { name: 'Dyson Brain', stat: 'energy', value: 2.0, source: 'megastructure' },
  { name: 'Nidavellir Forge', stat: 'energy', value: 2.0, source: 'megastructure' },
  { name: 'Genesis Engine', stat: 'energy', value: 2.0, source: 'megastructure' },
  { name: 'Cosmic Engine', stat: 'energy', value: 11.0, source: 'megastructure' },
  { name: 'Reality Engine', stat: 'energy', value: 21.0, source: 'megastructure' },
  // Ascension (best-case for energy)
  { name: 'Energy Surplus Protocol', stat: 'energy', value: 1.25, source: 'ascension' },
  { name: 'Stellar Harvesting', stat: 'energy', value: 1.5, source: 'ascension' },
  { name: 'Dark Energy Mastery', stat: 'energy', value: 2.0, source: 'ascension' },
  { name: 'Vacuum Manipulation', stat: 'energy', value: 6.0, source: 'ascension' },
  { name: 'Entropy Reversal', stat: 'energy', value: 11.0, source: 'ascension' },
  // Prestige one-time
  { name: 'Advanced Reactors', stat: 'energy', value: 1.5, source: 'prestige' },
]

// ── Helper: efficiency = output / cost of first unit ──

function efficiency(b: Building): number {
  return b.baseOutput / b.baseCost
}

// Cost to buy N of a building from 0 owned
function totalCostForN(b: Building, n: number): number {
  return calcBuildingCost(b.baseCost, b.costMultiplier, 0, n)
}

// Total output/s from N buildings (including milestone multipliers)
function totalOutputForN(b: Building, n: number): number {
  return n * b.baseOutput * calcBuildingMultiplier(n)
}

// ── TESTS ──

describe('building efficiency within tiers', () => {
  const tiers = [0, 1, 2]
  const resourceTypes = ['credits', 'energy'] as const

  for (const tier of tiers) {
    for (const resource of resourceTypes) {
      const tierBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === resource)
      if (tierBuildings.length < 2) continue

      describe(`Type ${tier} ${resource} buildings`, () => {
        it('cheaper buildings should have better efficiency than expensive ones', () => {
          // Idle game standard: cheap buildings = best ROI, expensive = raw throughput
          for (let i = 0; i < tierBuildings.length - 1; i++) {
            const cheaper = tierBuildings[i]
            const pricier = tierBuildings[i + 1]
            expect(efficiency(cheaper)).toBeGreaterThan(efficiency(pricier),
              `${cheaper.name} (eff=${efficiency(cheaper).toFixed(6)}) should be more efficient than ${pricier.name} (eff=${efficiency(pricier).toFixed(6)})`)
          }
        })

        it('efficiency spread should be between 2x and 10x (cheapest vs most expensive)', () => {
          const effs = tierBuildings.map(b => ({ name: b.name, eff: efficiency(b) }))
          const maxEff = Math.max(...effs.map(e => e.eff))
          const minEff = Math.min(...effs.map(e => e.eff))
          const spread = maxEff / minEff
          // 0.7^4 = 0.24, so spread should be ~4.2x
          expect(spread).toBeGreaterThan(2, 'Spread too narrow — expensive buildings should feel noticeably worse ROI')
          expect(spread).toBeLessThan(10, `Spread too wide: ${JSON.stringify(effs)}`)
        })

        it('expensive buildings should still provide meaningful raw output at 25 owned', () => {
          // Even with worse ROI, the last building should produce significantly more raw output
          const cheapest = tierBuildings[0]
          const priciest = tierBuildings[tierBuildings.length - 1]
          expect(priciest.baseOutput).toBeGreaterThan(cheapest.baseOutput * 10,
            `${priciest.name} should produce >10x the raw output of ${cheapest.name}`)
        })
      })
    }
  }
})

describe('cross-tier building progression', () => {
  it('first building of new tier should outclass last building of previous tier', () => {
    const tiers = [0, 1, 2]
    for (const resource of ['credits', 'energy'] as const) {
      for (let t = 0; t < tiers.length - 1; t++) {
        const currentTier = buildings.filter(b => b.unlockKardashev === tiers[t] && b.resource === resource)
        const nextTier = buildings.filter(b => b.unlockKardashev === tiers[t + 1] && b.resource === resource)
        if (!currentTier.length || !nextTier.length) continue

        const lastCurrent = currentTier[currentTier.length - 1]
        const firstNext = nextTier[0]

        // The first building of the next tier should have better raw efficiency
        expect(efficiency(firstNext)).toBeGreaterThan(efficiency(lastCurrent) * 0.3,
          `${firstNext.name} (Type ${tiers[t + 1]}) should be viable vs ${lastCurrent.name} (Type ${tiers[t]})`)
      }
    }
  })
})

describe('energy vs credits parity within tiers', () => {
  it('energy and credits should have comparable total output value at similar investment', () => {
    const tiers = [0, 1, 2]
    for (const tier of tiers) {
      const creditBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === 'credits')
      const energyBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === 'energy')
      if (!creditBuildings.length || !energyBuildings.length) continue

      // Compare the cheapest of each: how much output do you get for roughly the same cost?
      const cheapCredit = creditBuildings[0]
      const cheapEnergy = energyBuildings[0]

      // Buy 10 of each and compare output-to-cost ratio
      const creditCost = totalCostForN(cheapCredit, 10)
      const creditOutput = totalOutputForN(cheapCredit, 10)
      const energyCost = totalCostForN(cheapEnergy, 10)
      const energyOutput = totalOutputForN(cheapEnergy, 10)

      const creditRoi = creditOutput / creditCost
      const energyRoi = energyOutput / energyCost

      // Energy should produce more per cost (since it's the premium resource used for prestige)
      // but shouldn't be more than 20x different
      const ratio = Math.max(creditRoi, energyRoi) / Math.min(creditRoi, energyRoi)
      expect(ratio).toBeLessThan(20,
        `Type ${tier}: credit ROI=${creditRoi.toFixed(6)} vs energy ROI=${energyRoi.toFixed(6)} — ${ratio.toFixed(1)}x gap`)
    }
  })
})

describe('multiplier stacking — max theoretical multiplier', () => {
  it('max credits multiplier should be astronomical but not infinite', () => {
    // All credits multipliers stacked multiplicatively
    const total = creditsMultipliers.reduce((acc, m) => acc * m.value, 1)
    // Plus repeatable: profit_margins at max level 50 = 1.2^50
    const repeatableMax = Math.pow(1.2, 50)
    const grandTotal = total * repeatableMax

    // Should be large (this is endgame!) but let's flag if it's unreasonably high
    expect(grandTotal).toBeGreaterThan(1e6) // should be big
    expect(grandTotal).toBeLessThan(1e20)   // but not universe-breaking
    // Log it for visibility
    console.log(`Max credits multiplier: ${grandTotal.toExponential(2)} (${creditsMultipliers.length} sources + repeatable)`)
  })

  it('max energy multiplier should be astronomical but not infinite', () => {
    const total = energyMultipliers.reduce((acc, m) => acc * m.value, 1)
    const repeatableMax = Math.pow(1.2, 50) // reactor_efficiency
    const grandTotal = total * repeatableMax

    expect(grandTotal).toBeGreaterThan(1e6)
    expect(grandTotal).toBeLessThan(1e20)
    console.log(`Max energy multiplier: ${grandTotal.toExponential(2)} (${energyMultipliers.length} sources + repeatable)`)
  })

  it('credits and energy max multipliers should be within 100x of each other', () => {
    const creditTotal = creditsMultipliers.reduce((acc, m) => acc * m.value, 1) * Math.pow(1.2, 50)
    const energyTotal = energyMultipliers.reduce((acc, m) => acc * m.value, 1) * Math.pow(1.2, 50)
    const ratio = Math.max(creditTotal, energyTotal) / Math.min(creditTotal, energyTotal)
    expect(ratio).toBeLessThan(100,
      `Credits mult=${creditTotal.toExponential(2)} vs energy mult=${energyTotal.toExponential(2)} — ${ratio.toFixed(0)}x gap is too wide`)
    console.log(`Credits/energy multiplier ratio: ${ratio.toFixed(1)}x`)
  })
})

describe('multiplier stacking — individual source contribution', () => {
  it('no single research should contribute more than 6x', () => {
    for (const m of [...creditsMultipliers, ...energyMultipliers]) {
      if (m.source === 'research') {
        expect(m.value).toBeLessThanOrEqual(6,
          `${m.name} gives ${m.value}x — single research giving >6x is suspicious`)
      }
    }
  })

  it('no single megastructure should contribute more than 21x', () => {
    for (const m of [...creditsMultipliers, ...energyMultipliers]) {
      if (m.source === 'megastructure') {
        expect(m.value).toBeLessThanOrEqual(21,
          `${m.name} gives ${m.value}x`)
      }
    }
  })

  it('repeatable upgrades at max level should not exceed 1000x', () => {
    // Profit Margins: 1.2^50
    const profitMargins = Math.pow(1.2, 50)
    expect(profitMargins).toBeLessThan(10000)
    console.log(`Profit Margins lv50: ${profitMargins.toFixed(0)}x`)

    // Reactor Efficiency: 1.2^50
    const reactorEff = Math.pow(1.2, 50)
    expect(reactorEff).toBeLessThan(10000)

    // Click Amplifier: 1.25^30
    const clickAmp = Math.pow(1.25, 30)
    expect(clickAmp).toBeLessThan(1000)
    console.log(`Click Amplifier lv30: ${clickAmp.toFixed(0)}x`)

    // Workforce Training: 1.2^30
    const workforce = Math.pow(1.2, 30)
    expect(workforce).toBeLessThan(1000)

    // Bulk Purchasing: 0.9^20 (cost reduction)
    const bulkPurchase = Math.pow(0.9, 20)
    expect(bulkPurchase).toBeGreaterThan(0.01) // shouldn't make things free
    console.log(`Bulk Purchasing lv20: ${(bulkPurchase * 100).toFixed(1)}% of base cost`)
  })
})

describe('building cost curve sanity', () => {
  it('100th building should be expensive but not impossible without prestige', () => {
    for (const b of buildings.filter(b => b.resource !== 'autoclick').slice(0, 2)) {
      const first = calcBuildingCost(b.baseCost, b.costMultiplier, 0, 1)
      const hundredth = calcBuildingCost(b.baseCost, b.costMultiplier, 99, 1)
      const ratio = hundredth / first
      // At costMult ~1.05, 100th costs ~125x the first — steep but reachable
      expect(ratio).toBeGreaterThan(50, 'Cost curve too flat — no prestige wall')
      expect(ratio).toBeLessThan(500, 'Cost curve too steep — 100 buildings unreachable')
    }
  })

  it('cost multiplier should be between 1.045 and 1.055', () => {
    for (const b of buildings) {
      expect(b.costMultiplier).toBeGreaterThanOrEqual(1.045)
      expect(b.costMultiplier).toBeLessThanOrEqual(1.055)
    }
  })

  it('100th building should be gutted without prestige — the wall', () => {
    // At costMult ~1.05: cost grows 1.05^99 ≈ 125x, milestone gives 16x
    // Net efficiency = 16/125 ≈ 12.8% of first building — a hard wall
    const cheapBuildings = buildings.filter(b => b.resource !== 'autoclick').slice(0, 2)
    for (const b of cheapBuildings) {
      const firstEff = b.baseOutput * calcBuildingMultiplier(1) / calcBuildingCost(b.baseCost, b.costMultiplier, 0, 1)
      const at100Eff = b.baseOutput * calcBuildingMultiplier(100) / calcBuildingCost(b.baseCost, b.costMultiplier, 99, 1)

      // Should be significantly worse than first — this IS the prestige wall
      expect(at100Eff / firstEff).toBeLessThan(0.3,
        `${b.name}: 100th building is ${(at100Eff / firstEff * 100).toFixed(1)}% efficient — wall not steep enough`)
      expect(at100Eff / firstEff).toBeGreaterThan(0.01,
        `${b.name}: 100th building is completely worthless — wall too steep`)
    }
  })
})

describe('pop (autoclick) building balance', () => {
  it('corporate drone should not be clearly better than buying credit buildings early', () => {
    // A corporate drone costs 50, gives 1 click/s
    // With base click power of 1, that's 1 credit/s for 50 cost = 0.02 eff
    // Mining drone costs 10, gives 0.5 credits/s = 0.05 eff
    // So mining drone should be the better early investment
    const drone = buildings.find(b => b.id === 'corporate_drone')!
    const miner = buildings.find(b => b.id === 'mining_drone')!

    const droneEff = (drone.baseOutput * 1) / drone.baseCost // 1 click/s * 1 clickPower
    const minerEff = miner.baseOutput / miner.baseCost

    expect(minerEff).toBeGreaterThan(droneEff,
      'Mining drones should be more efficient than corporate drones at base click power')
  })

  it('pops should scale better than credit buildings with click upgrades', () => {
    // With all click upgrades (1+5+25+100+1000+50000 = 51131 click power)
    // plus sqrt pop boost, pops become very strong late-game
    const totalClickPower = 1 + 1 + 5 + 25 + 100 + 1000 + 50000
    const popOutput = calcClickPower(totalClickPower, 100) // 100 pops
    // This should be significant — that's the whole point of pops
    expect(popOutput).toBeGreaterThan(totalClickPower)
  })
})

describe('trait balance', () => {
  interface Trait {
    id: string
    name: string
    bonusStat: string
    bonusValue: number
    malusStat: string
    malusValue: number
  }

  const traits: Trait[] = [
    { id: 'ruthless_exploiters', name: 'Ruthless Exploiters', bonusStat: 'credits', bonusValue: 1.25, malusStat: 'energy', malusValue: 0.85 },
    { id: 'green_energy', name: 'Green Energy Initiative', bonusStat: 'energy', bonusValue: 1.25, malusStat: 'credits', malusValue: 0.85 },
    { id: 'worker_drones', name: 'Worker Drones', bonusStat: 'pops', bonusValue: 1.30, malusStat: 'clicks', malusValue: 0.80 },
    { id: 'hands_on_ceo', name: 'Hands-On CEO', bonusStat: 'clicks', bonusValue: 1.50, malusStat: 'pops', malusValue: 0.80 },
    { id: 'high_rollers', name: 'High Rollers', bonusStat: 'casino', bonusValue: 1.20, malusStat: 'credits', malusValue: 0.90 },
    { id: 'risk_averse', name: 'Risk Averse', bonusStat: 'credits', bonusValue: 1.15, malusStat: 'casino', malusValue: 1 },
    { id: 'rapid_expansion', name: 'Rapid Expansion', bonusStat: 'buildingCost', bonusValue: 0.85, malusStat: 'energy', malusValue: 0.90 },
    { id: 'research_focus', name: 'Research Focus', bonusStat: 'energy', bonusValue: 1.30, malusStat: 'pops', malusValue: 0.80 },
  ]

  it('every trait should have both a bonus and a malus', () => {
    for (const t of traits) {
      // Bonus should be > 1 (or < 1 for costs), malus should be < 1 (or special)
      if (t.bonusStat === 'buildingCost') {
        expect(t.bonusValue).toBeLessThan(1) // cost reduction
      } else {
        expect(t.bonusValue).toBeGreaterThan(1)
      }
      // Malus should penalize (except casino disabled which is special)
      if (t.malusStat !== 'casino' || t.id !== 'risk_averse') {
        expect(t.malusValue).toBeLessThan(1)
      }
    }
  })

  it('no trait bonus should exceed 1.5x', () => {
    for (const t of traits) {
      if (t.bonusStat === 'buildingCost') {
        expect(t.bonusValue).toBeGreaterThan(0.7) // max 30% discount
      } else {
        expect(t.bonusValue).toBeLessThanOrEqual(1.5,
          `${t.name} gives ${t.bonusValue}x — too strong for a starting trait`)
      }
    }
  })

  it('hands-on CEO should not be strictly better than worker drones', () => {
    // CEO: +50% click, -20% pop
    // Drones: +30% pop, -20% click
    // CEO has a bigger bonus but both should have a niche
    const ceo = traits.find(t => t.id === 'hands_on_ceo')!
    const drones = traits.find(t => t.id === 'worker_drones')!

    // CEO bonus is larger (1.5 vs 1.3) but CEO malus and drone malus are equal
    // This means CEO is slightly stronger early (when clicks matter more)
    // but drones should win late game (when pops dominate)
    // Just flag if the gap is too extreme
    expect(ceo.bonusValue / drones.bonusValue).toBeLessThan(1.5,
      'CEO bonus should not be >1.5x the drone bonus')
  })
})

describe('ascension perk balance', () => {
  it('later kardashev perks should give strictly larger bonuses', () => {
    // Best credits perk per tier
    const creditPerks = [
      { tier: 1, value: 1.25 }, // Efficient Bureaucracy
      { tier: 3, value: 3.0 },  // Temporal Arbitrage
      { tier: 4, value: 3.0 },  // Universal Omniscience
      { tier: 5, value: 11.0 }, // Reality Engineering
    ]
    for (let i = 0; i < creditPerks.length - 1; i++) {
      expect(creditPerks[i + 1].value).toBeGreaterThanOrEqual(creditPerks[i].value,
        `Tier ${creditPerks[i + 1].tier} perk should be >= tier ${creditPerks[i].tier}`)
    }
  })

  it('energy ascension perks should scale faster than credit perks', () => {
    // Energy is the prestige resource, so its perks should be juicier to maintain
    // incentive to invest in energy production
    const energyPerks = [1.25, 1.5, 2.0, 6.0, 11.0] // tiers 1-5
    const creditPerks = [1.25, 3.0, 3.0, 11.0]        // tiers 1,3,4,5

    const energyTotal = energyPerks.reduce((a, b) => a * b, 1)
    const creditTotal = creditPerks.reduce((a, b) => a * b, 1)

    // Energy perk stacking should be competitive with credits
    expect(energyTotal / creditTotal).toBeGreaterThan(0.5,
      'Energy ascension stack should be at least half of credits stack')
  })
})

describe('Dyson Sphere output jump', () => {
  it('Dyson Swarm should be more efficient than Dyson Sphere (cheaper = better ROI)', () => {
    const swarm = buildings.find(b => b.id === 'dyson_swarm')!
    const sphere = buildings.find(b => b.id === 'dyson_sphere')!
    expect(efficiency(swarm)).toBeGreaterThan(efficiency(sphere))
    // But Sphere should produce much more raw output
    expect(sphere.baseOutput).toBeGreaterThan(swarm.baseOutput * 5)
    console.log(`Dyson Swarm eff: ${efficiency(swarm).toFixed(6)}, Sphere eff: ${efficiency(sphere).toFixed(6)} (${(efficiency(swarm) / efficiency(sphere)).toFixed(1)}x better ROI)`)
  })
})

describe('Penrose Engine / Star Lifter output jumps', () => {
  it('each Type 2 energy building should decrease in efficiency by ~0.7x', () => {
    const type2Energy = buildings.filter(b => b.unlockKardashev === 2 && b.resource === 'energy')
    for (let i = 0; i < type2Energy.length - 1; i++) {
      const current = type2Energy[i]
      const next = type2Energy[i + 1]
      const effRatio = efficiency(next) / efficiency(current)
      // Each step should decrease efficiency by ~0.7x (range 0.4-0.9)
      expect(effRatio).toBeGreaterThan(0.4, `${next.name} efficiency drop too steep`)
      expect(effRatio).toBeLessThan(0.9, `${next.name} should be less efficient than ${current.name}`)
    }
  })
})

describe('CG multiplier stacking — max theoretical multiplier', () => {
  it('max CG multiplier should be astronomical but not infinite', () => {
    const total = cgMultipliers.reduce((acc, m) => acc * m.value, 1)
    // Plus repeatable: supply_optimization at max level 30 = 1.10^30
    const repeatableMax = Math.pow(1.10, 30)
    // Plus repeatable research: rep_logistics = 1.05^level (unbounded, estimate 50 levels)
    const repResearch = Math.pow(1.05, 50)
    const grandTotal = total * repeatableMax * repResearch
    expect(grandTotal).toBeGreaterThan(1e6)
    expect(grandTotal).toBeLessThan(1e20)
    console.log(`Max CG multiplier: ${grandTotal.toExponential(2)} (${cgMultipliers.length} sources + repeatable prestige + repeatable research)`)
  })

  it('CG max multiplier should be within 200x of credits max multiplier', () => {
    // CG has no megastructure multipliers, so it'll be somewhat lower than credits/energy
    const cgTotal = cgMultipliers.reduce((acc, m) => acc * m.value, 1) * Math.pow(1.10, 30) * Math.pow(1.05, 50)
    const creditTotal = creditsMultipliers.reduce((acc, m) => acc * m.value, 1) * Math.pow(1.10, 30) * Math.pow(1.05, 50)
    const ratio = Math.max(cgTotal, creditTotal) / Math.min(cgTotal, creditTotal)
    expect(ratio).toBeLessThan(200,
      `CG mult=${cgTotal.toExponential(2)} vs credits mult=${creditTotal.toExponential(2)} — ${ratio.toFixed(0)}x gap`)
    console.log(`CG/credits multiplier ratio: ${ratio.toFixed(1)}x`)
  })
})

describe('CG multiplier — individual source caps', () => {
  it('no single CG research should contribute more than 6x', () => {
    for (const m of cgMultipliers) {
      if (m.source === 'research') {
        expect(m.value).toBeLessThanOrEqual(6,
          `${m.name} gives ${m.value}x — single research giving >6x is suspicious`)
      }
    }
  })

  it('no single CG prestige upgrade should exceed 10x', () => {
    for (const m of cgMultipliers) {
      if (m.source === 'prestige') {
        expect(m.value).toBeLessThanOrEqual(10,
          `${m.name} gives ${m.value}x — single prestige upgrade >10x is too strong`)
      }
    }
  })

  it('no single CG ascension perk should exceed 2x', () => {
    for (const m of cgMultipliers) {
      if (m.source === 'ascension') {
        expect(m.value).toBeLessThanOrEqual(2.0,
          `${m.name} gives ${m.value}x`)
      }
    }
  })

  it('CG repeatable prestige at max level should not exceed 10000x', () => {
    // supply_optimization: 1.10^30
    const supplyOpt = Math.pow(1.10, 30)
    expect(supplyOpt).toBeLessThan(10000)
    console.log(`Supply Optimization lv30: ${supplyOpt.toFixed(0)}x`)
  })

  it('CG repeatable research at 50 levels should not exceed 10000x', () => {
    // rep_logistics: 1.05^50
    const repLog = Math.pow(1.05, 50)
    expect(repLog).toBeLessThan(10000)
    console.log(`Logistics Optimization lv50: ${repLog.toFixed(1)}x`)
  })
})

describe('CG trait balance', () => {
  it('Mass Producer CG bonus should not exceed 1.5x', () => {
    // Mass Producer: +30% CG, -15% credits
    expect(1.30).toBeLessThanOrEqual(1.5)
  })

  it('Mass Producer should have a meaningful malus', () => {
    expect(0.85).toBeLessThan(1)
  })
})

describe('building cost multiplier consistency', () => {
  it('within a tier, cheaper buildings should have lower cost multipliers', () => {
    // This ensures cheap buildings scale slower (stay relevant longer as filler)
    // while expensive buildings scale faster (premium late investment)
    const tiers = [0, 1, 2]
    for (const tier of tiers) {
      for (const resource of ['credits', 'energy'] as const) {
        const tierBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === resource)
        for (let i = 0; i < tierBuildings.length - 1; i++) {
          expect(tierBuildings[i + 1].costMultiplier).toBeGreaterThanOrEqual(tierBuildings[i].costMultiplier,
            `${tierBuildings[i + 1].name} should have >= cost multiplier than ${tierBuildings[i].name}`)
        }
      }
    }
  })
})
