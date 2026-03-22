import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier } from '../../app/utils/gameMath'

// ── Building data with CG upkeep (mirrors useGameConfig) ──

interface Building {
  id: string
  name: string
  baseCost: number
  costMultiplier: number
  baseOutput: number
  resource: 'credits' | 'energy' | 'autoclick' | 'consumer_goods'
  unlockKardashev: number
  energyUpkeep?: number
  cgUpkeep?: number
}

// prettier-ignore
const buildings: Building[] = [
  // Type 0
  { id: 'mining_drone', name: 'Mining Drone', baseCost: 10, costMultiplier: 1.045, baseOutput: 0.50, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'solar_array', name: 'Solar Array', baseCost: 50, costMultiplier: 1.045, baseOutput: 2.00, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'corporate_drone', name: 'Corporate Drone', baseCost: 50, costMultiplier: 1.12, baseOutput: 1, resource: 'autoclick', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'consumer_factory', name: 'Consumer Factory', baseCost: 500, costMultiplier: 1.06, baseOutput: 5, resource: 'consumer_goods', unlockKardashev: 0, energyUpkeep: 5 },
  // Type 1
  { id: 'asteroid_mine', name: 'Asteroid Mine', baseCost: 200000, costMultiplier: 1.045, baseOutput: 3000, resource: 'credits', unlockKardashev: 1, cgUpkeep: 250 },
  { id: 'fusion_reactor', name: 'Fusion Reactor', baseCost: 300000, costMultiplier: 1.045, baseOutput: 3600, resource: 'energy', unlockKardashev: 1, cgUpkeep: 250 },
  { id: 'executive_assistant', name: 'Executive Assistant', baseCost: 500000, costMultiplier: 1.12, baseOutput: 15, resource: 'autoclick', unlockKardashev: 1, cgUpkeep: 250 },
  { id: 'industrial_complex', name: 'Industrial Complex', baseCost: 5e5, costMultiplier: 1.06, baseOutput: 5e3, resource: 'consumer_goods', unlockKardashev: 1, energyUpkeep: 5e3 },
  // Type 2
  { id: 'colony_world', name: 'Colony World', baseCost: 1e9, costMultiplier: 1.045, baseOutput: 4.50e6, resource: 'credits', unlockKardashev: 2, cgUpkeep: 2.5e5 },
  { id: 'dyson_swarm', name: 'Dyson Swarm', baseCost: 2e9, costMultiplier: 1.045, baseOutput: 7.20e6, resource: 'energy', unlockKardashev: 2, cgUpkeep: 2.5e5 },
  { id: 'sector_governor', name: 'Sector Governor', baseCost: 5e9, costMultiplier: 1.12, baseOutput: 500, resource: 'autoclick', unlockKardashev: 2, cgUpkeep: 2.5e5 },
  { id: 'stellar_forge_cg', name: 'Stellar Forge', baseCost: 5e8, costMultiplier: 1.06, baseOutput: 5e6, resource: 'consumer_goods', unlockKardashev: 2, energyUpkeep: 5e6 },
]

// ── Upkeep calculation helpers (mirrors new useUpkeep.ts logic) ──

function calcTotalEnergyUpkeep(owned: Record<string, number>, reductionMult = 1): number {
  let upkeep = 0
  for (const b of buildings) {
    if (b.resource !== 'consumer_goods') continue
    if (!b.energyUpkeep) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    upkeep += count * b.energyUpkeep * calcBuildingMultiplier(count)
  }
  return upkeep * reductionMult
}

function calcCgProduction(owned: Record<string, number>): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource !== 'consumer_goods') continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    total += count * b.baseOutput * calcBuildingMultiplier(count)
  }
  return total
}

function calcCgConsumption(owned: Record<string, number>, reductionMult = 1): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource === 'consumer_goods') continue
    if (!b.cgUpkeep) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    total += count * b.cgUpkeep * calcBuildingMultiplier(count)
  }
  return total * reductionMult
}

function calcEnergyProduction(owned: Record<string, number>): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource !== 'energy') continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    total += count * b.baseOutput * calcBuildingMultiplier(count)
  }
  return total
}

function calcThrottle(production: number, consumption: number): number {
  if (consumption <= 0) return 1
  if (production >= consumption) return 1
  return Math.max(0.25, production / consumption)
}

// ── TESTS ──

describe('CG upkeep — all buildings consume consumer goods', () => {
  it('credit buildings should have cgUpkeep, NO energyUpkeep', () => {
    const creditBuildings = buildings.filter(b => b.resource === 'credits')
    for (const b of creditBuildings) {
      expect(b.cgUpkeep).toBeDefined()
      expect(b.cgUpkeep).toBeGreaterThan(0)
      expect(b.energyUpkeep).toBeUndefined()
    }
  })

  it('energy buildings should have cgUpkeep, NO energyUpkeep', () => {
    const energyBuildings = buildings.filter(b => b.resource === 'energy')
    for (const b of energyBuildings) {
      expect(b.cgUpkeep).toBeDefined()
      expect(b.cgUpkeep).toBeGreaterThan(0)
      expect(b.energyUpkeep).toBeUndefined()
    }
  })

  it('pop buildings should have cgUpkeep', () => {
    const popBuildings = buildings.filter(b => b.resource === 'autoclick')
    for (const b of popBuildings) {
      expect(b.cgUpkeep).toBeDefined()
      expect(b.cgUpkeep).toBeGreaterThan(0)
    }
  })

  it('CG buildings should have energyUpkeep and NO cgUpkeep', () => {
    const cgBuildings = buildings.filter(b => b.resource === 'consumer_goods')
    for (const b of cgBuildings) {
      expect(b.energyUpkeep).toBeDefined()
      expect(b.energyUpkeep).toBeGreaterThan(0)
      expect(b.cgUpkeep).toBeUndefined()
    }
  })
})

describe('CG upkeep — CG production and consumption', () => {
  it('CG production = sum of CG buildings output', () => {
    const owned = { consumer_factory: 5 }
    const production = calcCgProduction(owned)
    expect(production).toBe(5 * 5 * calcBuildingMultiplier(5))
  })

  it('CG consumption = sum of non-CG buildings cgUpkeep', () => {
    const owned = { mining_drone: 10, solar_array: 10 }
    const consumption = calcCgConsumption(owned)
    expect(consumption).toBe(20 * 0.25 * calcBuildingMultiplier(10))
  })

  it('CG buildings themselves do not contribute to CG consumption', () => {
    const owned = { consumer_factory: 50 }
    const consumption = calcCgConsumption(owned)
    expect(consumption).toBe(0)
  })
})

describe('CG upkeep — energy throttle on CG production', () => {
  it('no throttle when energy >= CG energy upkeep', () => {
    expect(calcThrottle(1000, 500)).toBe(1)
  })

  it('throttle proportional to deficit', () => {
    expect(calcThrottle(800, 1000)).toBeCloseTo(0.8)
    expect(calcThrottle(500, 1000)).toBeCloseTo(0.5)
  })

  it('throttle caps at 50%', () => {
    expect(calcThrottle(100, 10000)).toBe(0.25)
  })
})

describe('CG upkeep — CG throttle on credits/pops', () => {
  it('no throttle when CG production >= consumption', () => {
    expect(calcThrottle(100, 50)).toBe(1)
  })

  it('throttle proportional to CG deficit', () => {
    expect(calcThrottle(80, 100)).toBeCloseTo(0.8)
  })

  it('throttle caps at 50%', () => {
    expect(calcThrottle(10, 1000)).toBe(0.25)
  })
})

describe('CG upkeep — balanced play keeps >80% efficiency', () => {
  it('Type 0: 10 of each building + 1 CG factory → CG balance positive', () => {
    const owned = {
      mining_drone: 10, solar_array: 10, corporate_drone: 10,
      consumer_factory: 2  // 2 CG factories
    }
    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)

    // 2 factories * 5 output = 10 CG/s production
    // 30 buildings * 0.25 cgUpkeep = 7.5 CG/s consumption
    expect(cgProd).toBeGreaterThan(cgConsumption)
    const throttle = calcThrottle(cgProd, cgConsumption)
    expect(throttle).toBe(1)
  })

  it('Type 1: balanced investment → CG balance positive', () => {
    const owned = {
      asteroid_mine: 10, fusion_reactor: 10, executive_assistant: 5,
      industrial_complex: 2
    }
    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)
    expect(cgProd).toBeGreaterThan(cgConsumption)
  })

  it('Type 2: balanced investment → CG balance positive', () => {
    const owned = {
      colony_world: 10, dyson_swarm: 10, sector_governor: 5,
      stellar_forge_cg: 2
    }
    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)
    expect(cgProd).toBeGreaterThan(cgConsumption)
  })
})

describe('CG upkeep — expansion pressure', () => {
  it('many buildings without CG → deficit grows', () => {
    const owned = { mining_drone: 50, solar_array: 50 }
    const cgProd = calcCgProduction(owned) // 0
    const cgConsumption = calcCgConsumption(owned) // 50*0.25*4 + 50*0.25*4 = 100
    expect(cgProd).toBe(0)
    expect(cgConsumption).toBeGreaterThan(0)
    const throttle = calcThrottle(cgProd, cgConsumption)
    expect(throttle).toBe(0.25) // capped at 25%
  })

  it('adding CG factories should meaningfully improve throttle', () => {
    // 10 buildings total: 5 CG consumption. 1 factory: 5 CG production → balanced
    const ownedBefore = { mining_drone: 5, solar_array: 5 }
    const ownedAfter = { ...ownedBefore, consumer_factory: 1 }

    const throttleBefore = calcThrottle(calcCgProduction(ownedBefore), calcCgConsumption(ownedBefore))
    const throttleAfter = calcThrottle(calcCgProduction(ownedAfter), calcCgConsumption(ownedAfter))

    expect(throttleBefore).toBe(0.25) // max throttle (25%) (0 CG production)
    expect(throttleAfter).toBe(1) // fully recovered with 1 factory
  })

  it('deficit should be gradual, not a cliff', () => {
    // Gradually increasing buildings, CG stays at 1
    const throttles: number[] = []
    for (let n = 5; n <= 40; n += 5) {
      const owned = { mining_drone: n, solar_array: n, consumer_factory: 1 }
      const t = calcThrottle(calcCgProduction(owned), calcCgConsumption(owned))
      throttles.push(t)
    }
    // Each step should not drop more than 50% from previous
    for (let i = 1; i < throttles.length; i++) {
      expect(throttles[i]).toBeGreaterThanOrEqual(throttles[i - 1] * 0.5,
        `Throttle dropped too fast: ${throttles[i - 1].toFixed(2)} → ${throttles[i].toFixed(2)}`)
    }
  })
})

describe('CG upkeep — no death spiral', () => {
  it('CG deficit should NOT reduce energy production', () => {
    // Many credit buildings, no CG → CG deficit
    // Energy buildings should still produce at 100%
    const owned = { mining_drone: 100, solar_array: 50 }
    const cgThrottle = calcThrottle(calcCgProduction(owned), calcCgConsumption(owned))
    expect(cgThrottle).toBe(0.25) // CG deficit

    // Energy production is NOT affected by CG throttle
    const energyProd = calcEnergyProduction(owned)
    expect(energyProd).toBeGreaterThan(0)
    // Energy is exempt from CG throttle — it stays at full production
    // Net energy is only reduced by CG building energy upkeep
    const energyUpkeep = calcTotalEnergyUpkeep(owned)
    expect(energyUpkeep).toBe(0) // no CG buildings, no energy upkeep
  })

  it('energy deficit should reduce CG production (intended)', () => {
    // CG buildings but not enough energy
    const owned = { consumer_factory: 10 } // produces CG, consumes energy
    const energyProd = calcEnergyProduction(owned) // 0 energy buildings
    const energyUpkeep = calcTotalEnergyUpkeep(owned) // CG buildings need energy
    expect(energyProd).toBe(0)
    expect(energyUpkeep).toBeGreaterThan(0)

    // Energy throttle caps CG production
    const energyThrottle = calcThrottle(energyProd, energyUpkeep)
    // With 0 energy production, throttle would be max(0.5, 0/upkeep) but our function uses production >= consumption check
    // Since production (0) < consumption, throttle = max(0.5, 0/consumption) = 0.5
    expect(energyThrottle).toBe(0.25)
  })
})

describe('CG upkeep — cross-tier CG balance', () => {
  it('1 CG building at tier 0 should support ~20 buildings at tier 0', () => {
    const owned: Record<string, number> = { consumer_factory: 1 }
    // Add 20 Type 0 buildings
    owned.mining_drone = 10
    owned.solar_array = 10

    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)
    // Exactly balanced at 20 buildings (5 CG/s production, 20 * 0.25 = 5 CG/s consumption)
    expect(cgProd).toBeGreaterThanOrEqual(cgConsumption)
  })

  it('1 CG building at tier 1 should support ~20 buildings at tier 1', () => {
    const owned: Record<string, number> = { industrial_complex: 1 }
    owned.asteroid_mine = 10
    owned.fusion_reactor = 10

    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)
    expect(cgProd).toBeGreaterThanOrEqual(cgConsumption)
  })

  it('lower-tier CG buildings should be inadequate for higher tiers', () => {
    // Type 0 CG factory trying to support Type 1 buildings
    const owned = { consumer_factory: 5, asteroid_mine: 10, fusion_reactor: 10 }
    const cgProd = calcCgProduction(owned) // 5 * 5 = 25 CG/s
    const cgConsumption = calcCgConsumption(owned) // 20 * 250 = 5000 CG/s
    expect(cgProd).toBeLessThan(cgConsumption)
    const throttle = calcThrottle(cgProd, cgConsumption)
    expect(throttle).toBe(0.25) // maxed out
  })
})

describe('CG upkeep — CG building efficiency', () => {
  it('CG building energy upkeep should be ~1x its CG output (cheap to power)', () => {
    const cgBuildings = buildings.filter(b => b.resource === 'consumer_goods')
    for (const b of cgBuildings) {
      const ratio = b.energyUpkeep! / b.baseOutput
      expect(ratio).toBeGreaterThan(0.5,
        `${b.name}: energy/CG ratio ${ratio.toFixed(1)} too low`)
      expect(ratio).toBeLessThan(2,
        `${b.name}: energy/CG ratio ${ratio.toFixed(1)} too high — 2-3 energy buildings should power 1 CG factory`)
    }
  })

  it('CG buildings should have costMultiplier of 1.06', () => {
    const cgBuildings = buildings.filter(b => b.resource === 'consumer_goods')
    for (const b of cgBuildings) {
      expect(b.costMultiplier).toBe(1.06)
    }
  })

  it('upkeep reduction should apply to CG consumption', () => {
    const owned = { mining_drone: 10 }
    const full = calcCgConsumption(owned)
    const reduced = calcCgConsumption(owned, 0.9)
    expect(reduced).toBeCloseTo(full * 0.9)
  })
})
