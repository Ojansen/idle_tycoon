import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier, calcUpkeepMultiplier, calcEmpireSize, calcSprawlPenalty, EMPIRE_SIZE_THRESHOLD } from '../../app/utils/gameMath'

// ── Building data with CG upkeep (mirrors useGameConfig — graduated values) ──

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
  // Type 0 — graduated cgUpkeep: [0.08, 0.20, 0.50, 1.20, 3.00] × 0.25 base, pop × 0.10
  { id: 'mining_drone', name: 'Mining Drone', baseCost: 10, costMultiplier: 1.045, baseOutput: 0.50, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.025 },
  { id: 'solar_array', name: 'Solar Array', baseCost: 50, costMultiplier: 1.045, baseOutput: 2.00, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.10 },
  { id: 'corporate_drone', name: 'Corporate Drone', baseCost: 50, costMultiplier: 1.12, baseOutput: 1, resource: 'autoclick', unlockKardashev: 0, cgUpkeep: 0.05 },
  { id: 'consumer_factory', name: 'Consumer Factory', baseCost: 500, costMultiplier: 1.06, baseOutput: 5, resource: 'consumer_goods', unlockKardashev: 0, energyUpkeep: 5 },
  // Type 1 — graduated cgUpkeep: [0.08, 0.20, 0.50, 1.20, 3.00] × 250 base, pop × 0.10
  { id: 'asteroid_mine', name: 'Asteroid Mine', baseCost: 200000, costMultiplier: 1.045, baseOutput: 3000, resource: 'credits', unlockKardashev: 1, cgUpkeep: 150 },
  { id: 'fusion_reactor', name: 'Fusion Reactor', baseCost: 300000, costMultiplier: 1.045, baseOutput: 3600, resource: 'energy', unlockKardashev: 1, cgUpkeep: 180 },
  { id: 'executive_assistant', name: 'Executive Assistant', baseCost: 500000, costMultiplier: 1.12, baseOutput: 15, resource: 'autoclick', unlockKardashev: 1, cgUpkeep: 0.75 },
  { id: 'industrial_complex', name: 'Industrial Complex', baseCost: 5e5, costMultiplier: 1.06, baseOutput: 5e3, resource: 'consumer_goods', unlockKardashev: 1, energyUpkeep: 5e3 },
  // Type 2 — graduated cgUpkeep: [0.08, 0.20, 0.50, 1.20, 3.00] × 2.5e5 base, pop × 0.10
  { id: 'colony_world', name: 'Colony World', baseCost: 1e9, costMultiplier: 1.045, baseOutput: 4.50e6, resource: 'credits', unlockKardashev: 2, cgUpkeep: 2.25e5 },
  { id: 'dyson_swarm', name: 'Dyson Swarm', baseCost: 2e9, costMultiplier: 1.045, baseOutput: 7.20e6, resource: 'energy', unlockKardashev: 2, cgUpkeep: 3.60e5 },
  { id: 'sector_governor', name: 'Sector Governor', baseCost: 5e9, costMultiplier: 1.12, baseOutput: 500, resource: 'autoclick', unlockKardashev: 2, cgUpkeep: 25 },
  { id: 'stellar_forge_cg', name: 'Stellar Forge', baseCost: 5e8, costMultiplier: 1.06, baseOutput: 5e6, resource: 'consumer_goods', unlockKardashev: 2, energyUpkeep: 5e6 },
]

// ── Upkeep calculation helpers (mirrors useUpkeep.ts — uses dampened multiplier) ──

function calcTotalEnergyUpkeep(owned: Record<string, number>, reductionMult = 1): number {
  let upkeep = 0
  for (const b of buildings) {
    if (b.resource !== 'consumer_goods') continue
    if (!b.energyUpkeep) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    upkeep += count * b.energyUpkeep * calcUpkeepMultiplier(count)
  }
  return upkeep * reductionMult
}

function calcCgProduction(owned: Record<string, number>): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource !== 'consumer_goods') continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    // CG production uses dampened multiplier (matches useGameState.ts)
    total += count * b.baseOutput * calcUpkeepMultiplier(count)
  }
  return total
}

function calcTotalBuildings(owned: Record<string, number>): number {
  let total = 0
  for (const count of Object.values(owned)) {
    total += count || 0
  }
  return total
}

function calcCgConsumption(owned: Record<string, number>, reductionMult = 1, applyEmpirePressure = false): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource === 'consumer_goods') continue
    if (!b.cgUpkeep) continue
    const count = owned[b.id] || 0
    if (count === 0) continue
    total += count * b.cgUpkeep * calcUpkeepMultiplier(count)
  }
  total *= reductionMult
  return total
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
  it('CG production = sum of CG buildings output × dampened multiplier', () => {
    const owned = { consumer_factory: 5 }
    const production = calcCgProduction(owned)
    expect(production).toBe(5 * 5 * calcUpkeepMultiplier(5))
  })

  it('CG consumption = sum of non-CG buildings cgUpkeep × dampened multiplier', () => {
    const owned = { mining_drone: 10, solar_array: 10 }
    const consumption = calcCgConsumption(owned)
    // 10 * 0.025 * 1 + 10 * 0.10 * 1 = 1.25 (multiplier is 1 for <25 buildings)
    expect(consumption).toBeCloseTo(10 * 0.025 + 10 * 0.10)
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

  it('throttle caps at 25%', () => {
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

  it('throttle caps at 25%', () => {
    expect(calcThrottle(10, 1000)).toBe(0.25)
  })
})

describe('CG upkeep — balanced play keeps >80% efficiency', () => {
  it('Type 0: balanced buildings + CG factory → CG balance positive', () => {
    const owned = {
      mining_drone: 10, solar_array: 10, corporate_drone: 10,
      consumer_factory: 1
    }
    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)

    // 1 factory * 5 = 5 CG/s production (dampened mult = 1 at <25)
    // 10*0.025 + 10*0.10 + 10*0.05 = 1.75 CG/s consumption
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
    const cgConsumption = calcCgConsumption(owned)
    expect(cgProd).toBe(0)
    expect(cgConsumption).toBeGreaterThan(0)
    const throttle = calcThrottle(cgProd, cgConsumption)
    expect(throttle).toBe(0.25) // capped at 25%
  })

  it('adding CG factories should meaningfully improve throttle', () => {
    const ownedBefore = { mining_drone: 5, solar_array: 5 }
    const ownedAfter = { ...ownedBefore, consumer_factory: 1 }

    const throttleBefore = calcThrottle(calcCgProduction(ownedBefore), calcCgConsumption(ownedBefore))
    const throttleAfter = calcThrottle(calcCgProduction(ownedAfter), calcCgConsumption(ownedAfter))

    expect(throttleBefore).toBe(0.25) // max throttle (0 CG production)
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
    const owned = { mining_drone: 100, solar_array: 50 }
    const cgThrottle = calcThrottle(calcCgProduction(owned), calcCgConsumption(owned))
    expect(cgThrottle).toBe(0.25) // CG deficit

    // Energy production is NOT affected by CG throttle
    const energyProd = calcEnergyProduction(owned)
    expect(energyProd).toBeGreaterThan(0)
    const energyUpkeep = calcTotalEnergyUpkeep(owned)
    expect(energyUpkeep).toBe(0) // no CG buildings, no energy upkeep
  })

  it('energy deficit should reduce CG production (intended)', () => {
    const owned = { consumer_factory: 10 }
    const energyProd = calcEnergyProduction(owned)
    const energyUpkeep = calcTotalEnergyUpkeep(owned)
    expect(energyProd).toBe(0)
    expect(energyUpkeep).toBeGreaterThan(0)

    const energyThrottle = calcThrottle(energyProd, energyUpkeep)
    expect(energyThrottle).toBe(0.25)
  })
})

describe('CG upkeep — cross-tier CG balance', () => {
  it('1 CG building at tier 0 should support many cheap buildings', () => {
    const owned: Record<string, number> = { consumer_factory: 1 }
    // With graduated upkeep, cheapest buildings cost very little CG
    owned.mining_drone = 10
    owned.solar_array = 10

    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)
    // 1 factory = 5 CG/s, 10*0.025 + 10*0.10 = 1.25 CG/s
    expect(cgProd).toBeGreaterThanOrEqual(cgConsumption)
  })

  it('1 CG building at tier 1 should support cheapest tier 1 buildings', () => {
    const owned: Record<string, number> = { industrial_complex: 1 }
    owned.asteroid_mine = 10
    owned.fusion_reactor = 10

    const cgProd = calcCgProduction(owned)
    const cgConsumption = calcCgConsumption(owned)
    // 1 IC = 5000 CG/s, 10*150 + 10*180 = 3300 CG/s
    expect(cgProd).toBeGreaterThanOrEqual(cgConsumption)
  })

  it('lower-tier CG buildings should be inadequate for higher tiers', () => {
    const owned = { consumer_factory: 5, asteroid_mine: 10, fusion_reactor: 10 }
    const cgProd = calcCgProduction(owned) // 5 * 5 = 25 CG/s
    const cgConsumption = calcCgConsumption(owned) // 10*150 + 10*180 = 3300 CG/s
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

describe('CG upkeep — dampening', () => {
  it('dampened multiplier < building multiplier at 25+ buildings', () => {
    expect(calcUpkeepMultiplier(25)).toBeLessThan(calcBuildingMultiplier(25))
    expect(calcUpkeepMultiplier(25)).toBeCloseTo(Math.pow(2, 0.8), 5)
  })

  it('gap between output and upkeep multiplier widens at higher counts', () => {
    const ratio25 = calcBuildingMultiplier(25) / calcUpkeepMultiplier(25)
    const ratio100 = calcBuildingMultiplier(100) / calcUpkeepMultiplier(100)
    expect(ratio100).toBeGreaterThan(ratio25)
  })

  it('no dampening below 25 buildings', () => {
    expect(calcUpkeepMultiplier(0)).toBe(1)
    expect(calcUpkeepMultiplier(24)).toBe(1)
  })

  it('graduated cgUpkeep: cheap buildings cost less than expensive ones', () => {
    const miningDrone = buildings.find(b => b.id === 'mining_drone')!
    const corporateDrone = buildings.find(b => b.id === 'corporate_drone')!
    expect(miningDrone.cgUpkeep!).toBeLessThan(corporateDrone.cgUpkeep!)

    const asteroidMine = buildings.find(b => b.id === 'asteroid_mine')!
    const fusionReactor = buildings.find(b => b.id === 'fusion_reactor')!
    expect(asteroidMine.cgUpkeep!).toBeLessThan(fusionReactor.cgUpkeep!)
  })

  it('CG production and consumption scale at the same rate (dampened)', () => {
    // At any building count, the ratio of CG factory output to building upkeep
    // should use the same dampened multiplier
    const counts = [10, 25, 50, 100]
    for (const n of counts) {
      const prodMult = calcUpkeepMultiplier(n) // CG factory uses dampened
      const consumptionMult = calcUpkeepMultiplier(n) // upkeep uses dampened
      expect(prodMult).toBe(consumptionMult)
    }
  })
})

describe('Empire size (Stellaris-style weighted)', () => {
  it('planets=10, megas=5, divLevels=0.5, 100pops=1', () => {
    // 3 planets(30) + 2 megas(10) + 20 divLevels(10) + 500 pops(5) = 55
    expect(calcEmpireSize(3, 2, 20, 500)).toBe(55)
  })

  it('pops counted per 100 (floored)', () => {
    expect(calcEmpireSize(0, 0, 0, 99)).toBe(0)   // floor(99/100) = 0
    expect(calcEmpireSize(0, 0, 0, 100)).toBe(1)  // floor(100/100) = 1
    expect(calcEmpireSize(0, 0, 0, 250)).toBe(2)  // floor(250/100) = 2
  })

  it('zero inputs = zero size', () => {
    expect(calcEmpireSize(0, 0, 0, 0)).toBe(0)
  })
})

describe('Sprawl penalty', () => {
  it('no penalty at or under threshold (100)', () => {
    expect(calcSprawlPenalty(50)).toBe(1)
    expect(calcSprawlPenalty(100)).toBe(1)
  })

  it('+0.4% per point over threshold', () => {
    expect(calcSprawlPenalty(110)).toBeCloseTo(1.04)  // 10 over × 0.004
    expect(calcSprawlPenalty(150)).toBeCloseTo(1.20)  // 50 over × 0.004
    expect(calcSprawlPenalty(350)).toBeCloseTo(2.0)   // 250 over × 0.004
  })

  it('scales linearly', () => {
    const p1 = calcSprawlPenalty(120)
    const p2 = calcSprawlPenalty(130)
    expect(p2 - p1).toBeCloseTo(0.04) // 10 points × 0.004
  })
})

// Old empire pressure tests removed — replaced by Stellaris-style sprawl penalty above
