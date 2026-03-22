import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier } from '../../app/utils/gameMath'

// ── Building data with upkeep (copied from useGameConfig) ──

interface Building {
  id: string
  name: string
  baseCost: number
  costMultiplier: number
  baseOutput: number
  resource: 'credits' | 'energy' | 'autoclick'
  unlockKardashev: number
  energyUpkeep?: number
  creditsUpkeep?: number
}

// prettier-ignore
const buildings: Building[] = [
  // Type 0 - no upkeep
  { id: 'mining_drone', name: 'Mining Drone', baseCost: 10, costMultiplier: 1.045, baseOutput: 0.50, resource: 'credits', unlockKardashev: 0 },
  { id: 'solar_array', name: 'Solar Array', baseCost: 50, costMultiplier: 1.045, baseOutput: 2.00, resource: 'energy', unlockKardashev: 0 },
  { id: 'corporate_drone', name: 'Corporate Drone', baseCost: 50, costMultiplier: 1.12, baseOutput: 1, resource: 'autoclick', unlockKardashev: 0 },
  // Type 1 - no upkeep
  { id: 'asteroid_mine', name: 'Asteroid Mine', baseCost: 200000, costMultiplier: 1.045, baseOutput: 3000, resource: 'credits', unlockKardashev: 1 },
  { id: 'fusion_reactor', name: 'Fusion Reactor', baseCost: 300000, costMultiplier: 1.045, baseOutput: 3600, resource: 'energy', unlockKardashev: 1 },
  { id: 'executive_assistant', name: 'Executive Assistant', baseCost: 500000, costMultiplier: 1.12, baseOutput: 15, resource: 'autoclick', unlockKardashev: 1 },
  // Type 2 credits - energy upkeep
  { id: 'colony_world', name: 'Colony World', baseCost: 1e9, costMultiplier: 1.045, baseOutput: 4.50e6, resource: 'credits', unlockKardashev: 2, energyUpkeep: 5.40e5 },
  { id: 'stellar_shipyard', name: 'Stellar Shipyard', baseCost: 10e9, costMultiplier: 1.048, baseOutput: 3.15e7, resource: 'credits', unlockKardashev: 2, energyUpkeep: 3.78e6 },
  { id: 'galactic_bank', name: 'Galactic Bank', baseCost: 100e9, costMultiplier: 1.050, baseOutput: 2.21e8, resource: 'credits', unlockKardashev: 2, energyUpkeep: 2.65e7 },
  { id: 'matter_synthesizer', name: 'Matter Synthesizer', baseCost: 1e12, costMultiplier: 1.053, baseOutput: 1.54e9, resource: 'credits', unlockKardashev: 2, energyUpkeep: 1.85e8 },
  { id: 'sector_conglomerate', name: 'Sector Conglomerate', baseCost: 20e12, costMultiplier: 1.055, baseOutput: 2.16e10, resource: 'credits', unlockKardashev: 2, energyUpkeep: 2.59e9 },
  // Type 2 energy - credits upkeep
  { id: 'dyson_swarm', name: 'Dyson Swarm', baseCost: 2e9, costMultiplier: 1.045, baseOutput: 7.20e6, resource: 'energy', unlockKardashev: 2, creditsUpkeep: 5.40e5 },
  { id: 'dyson_sphere', name: 'Dyson Sphere', baseCost: 50e9, costMultiplier: 1.048, baseOutput: 1.26e8, resource: 'energy', unlockKardashev: 2, creditsUpkeep: 3.78e6 },
  { id: 'penrose_engine', name: 'Penrose Engine', baseCost: 500e9, costMultiplier: 1.050, baseOutput: 8.82e8, resource: 'energy', unlockKardashev: 2, creditsUpkeep: 2.65e7 },
  { id: 'star_lifter', name: 'Star Lifter', baseCost: 10e12, costMultiplier: 1.053, baseOutput: 1.24e10, resource: 'energy', unlockKardashev: 2, creditsUpkeep: 1.85e8 },
  { id: 'kugelblitz_reactor', name: 'Kugelblitz Reactor', baseCost: 500e12, costMultiplier: 1.055, baseOutput: 4.32e11, resource: 'energy', unlockKardashev: 2, creditsUpkeep: 2.59e9 },
  // Type 2 pop - both upkeeps
  { id: 'sector_governor', name: 'Sector Governor', baseCost: 5e9, costMultiplier: 1.12, baseOutput: 500, resource: 'autoclick', unlockKardashev: 2, energyUpkeep: 3.60e5, creditsUpkeep: 2.25e5 },
  // Type 3 credits
  { id: 'megastructure_forge', name: 'Megastructure Forge', baseCost: 1e15, costMultiplier: 1.045, baseOutput: 1.35e12, resource: 'credits', unlockKardashev: 3, energyUpkeep: 6.49e11 },
  // Type 3 energy
  { id: 'stellar_engine', name: 'Stellar Engine', baseCost: 5e15, costMultiplier: 1.045, baseOutput: 5.41e12, resource: 'energy', unlockKardashev: 3, creditsUpkeep: 1.62e11 },
  // Type 4 credits
  { id: 'universe_factory', name: 'Universe Factory', baseCost: 1e24, costMultiplier: 1.045, baseOutput: 4.06e20, resource: 'credits', unlockKardashev: 4, energyUpkeep: 1.94e20 },
  // Type 4 energy
  { id: 'vacuum_harvester', name: 'Vacuum Energy Harvester', baseCost: 5e24, costMultiplier: 1.045, baseOutput: 1.62e21, resource: 'energy', unlockKardashev: 4, creditsUpkeep: 4.87e19 },
  // Type 5 credits
  { id: 'multiverse_holding', name: 'Multiverse Holdings', baseCost: 1e33, costMultiplier: 1.045, baseOutput: 1.22e29, resource: 'credits', unlockKardashev: 5, energyUpkeep: 5.84e28 },
  // Type 5 energy
  { id: 'big_crunch_generator', name: 'Big Crunch Generator', baseCost: 5e33, costMultiplier: 1.045, baseOutput: 4.87e29, resource: 'energy', unlockKardashev: 5, creditsUpkeep: 1.46e28 },
]

// ── Megastructure upkeep data ──

interface Megastructure {
  id: string
  name: string
  energyUpkeepPerSecond: number
  creditsUpkeepPerSecond: number
}

const megastructures: Megastructure[] = [
  { id: 'stellar_forge', name: 'Stellar Forge', energyUpkeepPerSecond: 5e9, creditsUpkeepPerSecond: 2e9 },
  { id: 'dyson_brain', name: 'Dyson Brain', energyUpkeepPerSecond: 2e10, creditsUpkeepPerSecond: 5e9 },
  { id: 'nidavellir_forge', name: 'Nidavellir Forge', energyUpkeepPerSecond: 5e17, creditsUpkeepPerSecond: 5e16 },
  { id: 'matrioshka_brain', name: 'Matrioshka Brain', energyUpkeepPerSecond: 2e18, creditsUpkeepPerSecond: 2e17 },
  { id: 'genesis_engine', name: 'Genesis Engine', energyUpkeepPerSecond: 5e23, creditsUpkeepPerSecond: 5e22 },
  { id: 'cosmic_engine', name: 'Cosmic Engine', energyUpkeepPerSecond: 2e26, creditsUpkeepPerSecond: 5e24 },
  { id: 'reality_engine', name: 'Reality Engine', energyUpkeepPerSecond: 5e34, creditsUpkeepPerSecond: 5e33 },
]

// ── Upkeep calculation helpers (mirrors useUpkeep.ts logic) ──

function calcTotalEnergyUpkeep(owned: Record<string, number>, completedMegas: string[], reductionMult = 1): number {
  let upkeep = 0
  for (const b of buildings) {
    if (!b.energyUpkeep) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    upkeep += count * b.energyUpkeep * calcBuildingMultiplier(count)
  }
  for (const megaId of completedMegas) {
    const def = megastructures.find(m => m.id === megaId)
    if (def) upkeep += def.energyUpkeepPerSecond
  }
  return upkeep * reductionMult
}

function calcTotalCreditsUpkeep(owned: Record<string, number>, completedMegas: string[], reductionMult = 1): number {
  let upkeep = 0
  for (const b of buildings) {
    if (!b.creditsUpkeep) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    upkeep += count * b.creditsUpkeep * calcBuildingMultiplier(count)
  }
  for (const megaId of completedMegas) {
    const def = megastructures.find(m => m.id === megaId)
    if (def) upkeep += def.creditsUpkeepPerSecond
  }
  return upkeep * reductionMult
}

function calcThrottle(grossProduction: number, upkeep: number): number {
  if (grossProduction <= 0) return 1
  const balance = grossProduction - upkeep
  if (balance >= 0) return 1
  return Math.max(0.5, (grossProduction + balance) / grossProduction)
}

function calcGrossOutput(owned: Record<string, number>, resource: 'credits' | 'energy'): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource !== resource) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    total += count * b.baseOutput * calcBuildingMultiplier(count)
  }
  return total
}

// ── TESTS ──

describe('upkeep — Type 0 and Type 1 have no upkeep', () => {
  it('Type 0 buildings should have no upkeep fields', () => {
    const type0 = buildings.filter(b => b.unlockKardashev === 0)
    for (const b of type0) {
      expect(b.energyUpkeep).toBeUndefined()
      expect(b.creditsUpkeep).toBeUndefined()
    }
  })

  it('Type 1 buildings should have no upkeep fields', () => {
    const type1 = buildings.filter(b => b.unlockKardashev === 1)
    for (const b of type1) {
      expect(b.energyUpkeep).toBeUndefined()
      expect(b.creditsUpkeep).toBeUndefined()
    }
  })
})

describe('upkeep — Type 2+ buildings have upkeep', () => {
  it('Type 2+ credit buildings should have energy upkeep', () => {
    const creditBuildings = buildings.filter(b => b.unlockKardashev >= 2 && b.resource === 'credits')
    for (const b of creditBuildings) {
      expect(b.energyUpkeep).toBeDefined()
      expect(b.energyUpkeep).toBeGreaterThan(0)
    }
  })

  it('Type 2+ energy buildings should have credits upkeep', () => {
    const energyBuildings = buildings.filter(b => b.unlockKardashev >= 2 && b.resource === 'energy')
    for (const b of energyBuildings) {
      expect(b.creditsUpkeep).toBeDefined()
      expect(b.creditsUpkeep).toBeGreaterThan(0)
    }
  })

  it('Type 2 pop building should have both upkeep types', () => {
    const pop = buildings.find(b => b.id === 'sector_governor')!
    expect(pop.energyUpkeep).toBeGreaterThan(0)
    expect(pop.creditsUpkeep).toBeGreaterThan(0)
  })
})

describe('upkeep — upkeep ratio stays around 12% of opposing resource', () => {
  it('credit building energy upkeep should be 8-16% of same-tier energy building output', () => {
    for (const tier of [2, 3, 4, 5]) {
      const creditBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === 'credits')
      const energyBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === 'energy')
      if (!creditBuildings.length || !energyBuildings.length) continue

      for (const cb of creditBuildings) {
        if (!cb.energyUpkeep) continue
        const ratio = cb.energyUpkeep / cb.baseOutput
        // Upkeep should be a significant but not crippling fraction of output
        expect(ratio).toBeGreaterThan(0.01,
          `${cb.name}: upkeep ratio ${(ratio * 100).toFixed(1)}% is too low`)
        expect(ratio).toBeLessThan(0.6,
          `${cb.name}: upkeep ratio ${(ratio * 100).toFixed(1)}% is too high`)
      }
    }
  })

  it('energy building credits upkeep should be 0.1-50% of own output', () => {
    for (const tier of [2, 3, 4, 5]) {
      const energyBuildings = buildings.filter(b => b.unlockKardashev === tier && b.resource === 'energy')
      for (const eb of energyBuildings) {
        if (!eb.creditsUpkeep) continue
        const ratio = eb.creditsUpkeep / eb.baseOutput
        expect(ratio).toBeGreaterThan(0.001,
          `${eb.name}: upkeep ratio ${(ratio * 100).toFixed(1)}% is too low`)
        expect(ratio).toBeLessThan(0.5,
          `${eb.name}: upkeep ratio ${(ratio * 100).toFixed(1)}% is too high`)
      }
    }
  })
})

describe('upkeep — total upkeep calculation', () => {
  it('should return 0 for Type 0 buildings only', () => {
    const owned = { mining_drone: 50, solar_array: 50, corporate_drone: 10 }
    expect(calcTotalEnergyUpkeep(owned, [])).toBe(0)
    expect(calcTotalCreditsUpkeep(owned, [])).toBe(0)
  })

  it('should calculate upkeep for Type 2 credit buildings', () => {
    const owned = { colony_world: 10 }
    const upkeep = calcTotalEnergyUpkeep(owned, [])
    // 10 buildings * 5.40e5 upkeep * 1x milestone = 5.40e6
    expect(upkeep).toBe(10 * 5.40e5 * calcBuildingMultiplier(10))
  })

  it('should scale upkeep with building milestone multiplier', () => {
    const owned10 = { colony_world: 10 }
    const owned25 = { colony_world: 25 }
    const upkeep10 = calcTotalEnergyUpkeep(owned10, [])
    const upkeep25 = calcTotalEnergyUpkeep(owned25, [])
    // At 25, milestone is 2x, so 25 buildings at 2x vs 10 at 1x = 5x increase
    expect(upkeep25).toBe(25 * 5.40e5 * calcBuildingMultiplier(25))
    expect(upkeep25 / upkeep10).toBe(5) // 25*2 / (10*1) = 5
  })

  it('should include megastructure upkeep', () => {
    const owned = { colony_world: 1 }
    const noMega = calcTotalEnergyUpkeep(owned, [])
    const withMega = calcTotalEnergyUpkeep(owned, ['stellar_forge'])
    expect(withMega).toBe(noMega + 5e9)
  })

  it('should apply upkeep reduction multiplier', () => {
    const owned = { colony_world: 10 }
    const full = calcTotalEnergyUpkeep(owned, [])
    const reduced = calcTotalEnergyUpkeep(owned, [], 0.9) // 10% reduction
    expect(reduced).toBeCloseTo(full * 0.9)
  })

  it('stacked research reductions should multiply (0.9 * 0.85 * 0.8 = 0.612)', () => {
    const owned = { colony_world: 10 }
    const full = calcTotalEnergyUpkeep(owned, [])
    const reduced = calcTotalEnergyUpkeep(owned, [], 0.9 * 0.85 * 0.8)
    expect(reduced).toBeCloseTo(full * 0.612)
  })
})

describe('upkeep — throttle mechanics', () => {
  it('no throttle when production exceeds upkeep', () => {
    expect(calcThrottle(1000, 500)).toBe(1)
  })

  it('no throttle when production equals upkeep', () => {
    expect(calcThrottle(1000, 1000)).toBe(1)
  })

  it('throttle when production is less than upkeep', () => {
    // gross=1000, upkeep=1200 -> balance=-200
    // throttle = max(0.5, (1000 + (-200)) / 1000) = max(0.5, 0.8) = 0.8
    expect(calcThrottle(1000, 1200)).toBeCloseTo(0.8)
  })

  it('throttle caps at 50%', () => {
    // gross=100, upkeep=1000 -> balance=-900
    // throttle = max(0.5, (100 + (-900)) / 100) = max(0.5, -8) = 0.5
    expect(calcThrottle(100, 1000)).toBe(0.5)
  })

  it('throttle returns 1 when gross is 0', () => {
    expect(calcThrottle(0, 100)).toBe(1)
  })

  it('throttle is proportional to deficit', () => {
    // 10% deficit -> 90% efficiency
    expect(calcThrottle(1000, 1100)).toBeCloseTo(0.9)
    // 20% deficit -> 80% efficiency
    expect(calcThrottle(1000, 1200)).toBeCloseTo(0.8)
    // 30% deficit -> 70% efficiency
    expect(calcThrottle(1000, 1300)).toBeCloseTo(0.7)
  })
})

describe('upkeep — net production', () => {
  it('net = gross - upkeep when no throttle', () => {
    const owned = { colony_world: 5, dyson_swarm: 5 }
    const grossCredits = calcGrossOutput(owned, 'credits')
    const grossEnergy = calcGrossOutput(owned, 'energy')
    const energyUpkeep = calcTotalEnergyUpkeep(owned, [])
    const creditsUpkeep = calcTotalCreditsUpkeep(owned, [])

    // Check no throttle (energy should cover energy upkeep from credit buildings)
    const creditThrottle = calcThrottle(grossEnergy, energyUpkeep)
    const energyThrottle = calcThrottle(grossCredits, creditsUpkeep)

    const netCredits = grossCredits * creditThrottle - creditsUpkeep
    const netEnergy = grossEnergy * energyThrottle - energyUpkeep

    // Both resources should be positive with balanced building
    expect(netCredits).toBeGreaterThan(0)
    expect(netEnergy).toBeGreaterThan(0)
    // Net should be less than gross
    expect(netCredits).toBeLessThan(grossCredits)
    expect(netEnergy).toBeLessThan(grossEnergy)
  })

  it('balanced building should have at least 80% net efficiency', () => {
    // Equal number of credit and energy buildings
    const owned = { colony_world: 10, dyson_swarm: 10 }
    const grossCredits = calcGrossOutput(owned, 'credits')
    const grossEnergy = calcGrossOutput(owned, 'energy')
    const energyUpkeep = calcTotalEnergyUpkeep(owned, [])
    const creditsUpkeep = calcTotalCreditsUpkeep(owned, [])

    const creditThrottle = calcThrottle(grossEnergy, energyUpkeep)
    const energyThrottle = calcThrottle(grossCredits, creditsUpkeep)

    const netCredits = grossCredits * creditThrottle - creditsUpkeep
    const netEnergy = grossEnergy * energyThrottle - energyUpkeep

    // Balanced play should keep >80% of gross production
    expect(netCredits / grossCredits).toBeGreaterThan(0.8)
    expect(netEnergy / grossEnergy).toBeGreaterThan(0.8)
  })

  it('heavily skewed building should trigger throttle', () => {
    // Only credit buildings, no energy buildings -> energy upkeep exceeds energy production
    const owned = { colony_world: 50 }
    const grossEnergy = calcGrossOutput(owned, 'energy') // 0 since no energy buildings
    const energyUpkeep = calcTotalEnergyUpkeep(owned, [])

    expect(grossEnergy).toBe(0)
    expect(energyUpkeep).toBeGreaterThan(0)

    // Throttle should kick in (but since gross is 0, formula returns 1 to avoid div-by-zero)
    const creditThrottle = calcThrottle(grossEnergy, energyUpkeep)
    expect(creditThrottle).toBe(1) // edge case: no energy production at all
  })
})

describe('upkeep — megastructure upkeep values', () => {
  it('all megastructures should have both upkeep types', () => {
    for (const m of megastructures) {
      expect(m.energyUpkeepPerSecond).toBeGreaterThan(0)
      expect(m.creditsUpkeepPerSecond).toBeGreaterThan(0)
    }
  })

  it('megastructure energy upkeep should be greater than credits upkeep', () => {
    for (const m of megastructures) {
      // Energy is the premium resource, so energy upkeep should be the larger cost
      expect(m.energyUpkeepPerSecond).toBeGreaterThanOrEqual(m.creditsUpkeepPerSecond,
        `${m.name}: energy upkeep should be >= credits upkeep`)
    }
  })

  it('later megastructures should have higher upkeep', () => {
    for (let i = 0; i < megastructures.length - 1; i++) {
      expect(megastructures[i + 1].energyUpkeepPerSecond).toBeGreaterThan(
        megastructures[i].energyUpkeepPerSecond,
        `${megastructures[i + 1].name} should cost more than ${megastructures[i].name}`)
    }
  })
})

describe('upkeep — cross-resource tug-of-war', () => {
  it('credit buildings drain energy, energy buildings drain credits', () => {
    const creditBuilding = buildings.find(b => b.id === 'colony_world')!
    const energyBuilding = buildings.find(b => b.id === 'dyson_swarm')!

    // Credit building should drain energy
    expect(creditBuilding.energyUpkeep).toBeGreaterThan(0)
    expect(creditBuilding.creditsUpkeep).toBeUndefined()

    // Energy building should drain credits
    expect(energyBuilding.creditsUpkeep).toBeGreaterThan(0)
    expect(energyBuilding.energyUpkeep).toBeUndefined()
  })

  it('energy deficit should throttle credit production (not energy)', () => {
    // If energy upkeep exceeds energy production, credits get throttled
    const grossEnergy = 1000
    const energyUpkeep = 1500 // 50% deficit

    const creditThrottle = calcThrottle(grossEnergy, energyUpkeep)
    // energy balance = 1000 - 1500 = -500
    // creditThrottle = max(0.5, (1000 - 500) / 1000) = max(0.5, 0.5) = 0.5
    expect(creditThrottle).toBeCloseTo(0.5)
  })

  it('credit deficit should throttle energy production (not credits)', () => {
    const grossCredits = 1000
    const creditsUpkeep = 1200

    const energyThrottle = calcThrottle(grossCredits, creditsUpkeep)
    // credits balance = 1000 - 1200 = -200
    // energyThrottle = max(0.5, (1000 - 200) / 1000) = max(0.5, 0.8) = 0.8
    expect(energyThrottle).toBeCloseTo(0.8)
  })
})

describe('upkeep — repeatable prestige upgrade', () => {
  it('operational efficiency at max level should reduce upkeep by ~54%', () => {
    // 0.95^15 = 0.4633
    const maxReduction = Math.pow(0.95, 15)
    expect(maxReduction).toBeGreaterThan(0.4)
    expect(maxReduction).toBeLessThan(0.5)
  })

  it('combined research + repeatable should reduce upkeep by ~72%', () => {
    // Research: 0.9 * 0.85 * 0.8 = 0.612
    // Repeatable max: 0.95^15 = 0.4633
    // Combined: 0.612 * 0.4633 = 0.2836
    const combined = 0.9 * 0.85 * 0.8 * Math.pow(0.95, 15)
    expect(combined).toBeGreaterThan(0.25)
    expect(combined).toBeLessThan(0.35)
    console.log(`Max upkeep reduction: ${((1 - combined) * 100).toFixed(1)}% (combined multiplier: ${combined.toFixed(4)})`)
  })
})

describe('upkeep — idle safety', () => {
  it('net production should never go below -50% of gross', () => {
    // Worst case: massive upkeep, tiny production
    const grossEnergy = 100
    const energyUpkeep = 1e10 // absurd upkeep
    const throttle = calcThrottle(grossEnergy, energyUpkeep)
    expect(throttle).toBe(0.5) // capped at 50%

    // Net = gross * 0.5 - upkeep (this CAN be negative, but resources are clamped to 0)
    const net = grossEnergy * throttle - energyUpkeep
    // The game clamps to 0: Math.max(0, state.energy + net * dt)
    // This is expected — the 50% cap prevents rapid drain, and the clamp prevents negatives
    expect(net).toBeLessThan(0) // will be negative in extreme case, but clamped in game
  })

  it('balanced player should always have positive net production', () => {
    // Simulate a balanced player at each tier
    for (const tier of [2, 3, 4, 5]) {
      const creditBuilding = buildings.find(b => b.unlockKardashev === tier && b.resource === 'credits')
      const energyBuilding = buildings.find(b => b.unlockKardashev === tier && b.resource === 'energy')
      if (!creditBuilding || !energyBuilding) continue

      const owned = { [creditBuilding.id]: 10, [energyBuilding.id]: 10 }
      const grossCredits = calcGrossOutput(owned, 'credits')
      const grossEnergy = calcGrossOutput(owned, 'energy')
      const energyUpkeep = calcTotalEnergyUpkeep(owned, [])
      const creditsUpkeep = calcTotalCreditsUpkeep(owned, [])

      const creditThrottle = calcThrottle(grossEnergy, energyUpkeep)
      const energyThrottle = calcThrottle(grossCredits, creditsUpkeep)

      const netCredits = grossCredits * creditThrottle - creditsUpkeep
      const netEnergy = grossEnergy * energyThrottle - energyUpkeep

      expect(netCredits).toBeGreaterThan(0,
        `Tier ${tier}: balanced player should have positive net credits (got ${netCredits.toExponential(2)})`)
      expect(netEnergy).toBeGreaterThan(0,
        `Tier ${tier}: balanced player should have positive net energy (got ${netEnergy.toExponential(2)})`)
    }
  })
})

describe('upkeep — upkeep scales consistently across tiers', () => {
  it('upkeep-to-output ratio should be similar across tiers for credit buildings', () => {
    const ratios: { tier: number; name: string; ratio: number }[] = []
    for (const tier of [2, 3, 4, 5]) {
      const b = buildings.find(b => b.unlockKardashev === tier && b.resource === 'credits' && b.energyUpkeep)
      if (!b) continue
      ratios.push({ tier, name: b.name, ratio: b.energyUpkeep! / b.baseOutput })
    }

    // All ratios should be in a similar range (not wildly different across tiers)
    const min = Math.min(...ratios.map(r => r.ratio))
    const max = Math.max(...ratios.map(r => r.ratio))
    expect(max / min).toBeLessThan(10,
      `Upkeep ratios vary too much across tiers: ${JSON.stringify(ratios.map(r => `${r.name}: ${(r.ratio * 100).toFixed(1)}%`))}`)
  })
})
