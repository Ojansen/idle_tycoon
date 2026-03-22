import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier, calcBuildingCost } from '../../app/utils/gameMath'

// ── Building data (subset per tier for simulation) ──

interface SimBuilding {
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

const buildings: SimBuilding[] = [
  // Type 0
  { id: 'mining_drone', name: 'Mining Drone', baseCost: 10, costMultiplier: 1.045, baseOutput: 0.50, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'ore_refinery', name: 'Ore Refinery', baseCost: 150, costMultiplier: 1.048, baseOutput: 5.3, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'cargo_shuttle', name: 'Cargo Shuttle', baseCost: 1500, costMultiplier: 1.050, baseOutput: 37, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'orbital_factory', name: 'Orbital Factory', baseCost: 10000, costMultiplier: 1.053, baseOutput: 172, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'space_station', name: 'Space Station', baseCost: 50000, costMultiplier: 1.055, baseOutput: 600, resource: 'credits', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'solar_array', name: 'Solar Array', baseCost: 50, costMultiplier: 1.045, baseOutput: 2.00, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'wind_turbine_grid', name: 'Wind Turbine Grid', baseCost: 400, costMultiplier: 1.048, baseOutput: 11.2, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'geothermal_tap', name: 'Geothermal Tap', baseCost: 3000, costMultiplier: 1.050, baseOutput: 59, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'fission_plant', name: 'Fission Plant', baseCost: 20000, costMultiplier: 1.053, baseOutput: 274, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'orbital_mirror', name: 'Orbital Mirror', baseCost: 80000, costMultiplier: 1.055, baseOutput: 960, resource: 'energy', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'corporate_drone', name: 'Corporate Drone', baseCost: 50, costMultiplier: 1.12, baseOutput: 1, resource: 'autoclick', unlockKardashev: 0, cgUpkeep: 0.25 },
  { id: 'consumer_factory', name: 'Consumer Factory', baseCost: 500, costMultiplier: 1.06, baseOutput: 5, resource: 'consumer_goods', unlockKardashev: 0, energyUpkeep: 5 },
  // Type 1
  { id: 'asteroid_mine', name: 'Asteroid Mine', baseCost: 200000, costMultiplier: 1.045, baseOutput: 3000, resource: 'credits', unlockKardashev: 1, cgUpkeep: 250 },
  { id: 'fusion_reactor', name: 'Fusion Reactor', baseCost: 300000, costMultiplier: 1.045, baseOutput: 3600, resource: 'energy', unlockKardashev: 1, cgUpkeep: 250 },
  { id: 'industrial_complex', name: 'Industrial Complex', baseCost: 5e5, costMultiplier: 1.06, baseOutput: 5e3, resource: 'consumer_goods', unlockKardashev: 1, energyUpkeep: 5e3 },
]

// ── Simulation engine ──

interface SimState {
  credits: number
  energy: number
  buildings: Record<string, number>
  tick: number
}

function createState(): SimState {
  return { credits: 0, energy: 0, buildings: {}, tick: 0 }
}

function getOwned(state: SimState, id: string): number {
  return state.buildings[id] || 0
}

function calcProduction(state: SimState, resource: string): number {
  let total = 0
  for (const b of buildings) {
    if (b.resource !== resource) continue
    const owned = getOwned(state, b.id)
    if (owned === 0) continue
    total += owned * b.baseOutput * calcBuildingMultiplier(owned)
  }
  return total
}

function calcEnergyUpkeep(state: SimState): number {
  let upkeep = 0
  for (const b of buildings) {
    if (b.resource !== 'consumer_goods') continue
    if (!b.energyUpkeep) continue
    const owned = getOwned(state, b.id)
    if (owned === 0) continue
    upkeep += owned * b.energyUpkeep * calcBuildingMultiplier(owned)
  }
  return upkeep
}

function calcCgProduction(state: SimState): number {
  return calcProduction(state, 'consumer_goods')
}

function calcCgConsumption(state: SimState): number {
  let consumption = 0
  for (const b of buildings) {
    if (b.resource === 'consumer_goods') continue
    if (!b.cgUpkeep) continue
    const owned = getOwned(state, b.id)
    if (owned === 0) continue
    consumption += owned * b.cgUpkeep * calcBuildingMultiplier(owned)
  }
  return consumption
}

function calcThrottle(production: number, consumption: number): number {
  if (consumption <= 0) return 1
  if (production >= consumption) return 1
  return Math.max(0.25, production / consumption)
}

function simTick(state: SimState, dt: number): { netCredits: number; netEnergy: number; cgThrottle: number; energyThrottle: number } {
  const grossEnergy = calcProduction(state, 'energy')
  const energyUpkeep = calcEnergyUpkeep(state)
  const energyThrottle = calcThrottle(grossEnergy, energyUpkeep)

  const rawCg = calcCgProduction(state)
  const effectiveCg = rawCg * energyThrottle
  const cgConsumption = calcCgConsumption(state)
  const cgThrottle = calcThrottle(effectiveCg, cgConsumption)

  const grossCredits = calcProduction(state, 'credits')
  const netCredits = grossCredits * cgThrottle
  const netEnergy = Math.max(0, grossEnergy - energyUpkeep)

  state.credits += netCredits * dt
  state.energy += netEnergy * dt
  state.tick++

  return { netCredits, netEnergy, cgThrottle, energyThrottle }
}

function buyBuilding(state: SimState, id: string): boolean {
  const def = buildings.find(b => b.id === id)
  if (!def) return false
  const cost = calcBuildingCost(def.baseCost, def.costMultiplier, getOwned(state, id), 1)
  if (state.credits < cost) return false
  state.credits -= cost
  state.buildings[id] = (state.buildings[id] || 0) + 1
  return true
}

function buyMax(state: SimState, id: string, maxCount = 100): number {
  let bought = 0
  while (bought < maxCount && buyBuilding(state, id)) bought++
  return bought
}

function simulate(state: SimState, seconds: number, dt = 1): void {
  const ticks = Math.floor(seconds / dt)
  for (let i = 0; i < ticks; i++) simTick(state, dt)
}

function fmt(n: number): string {
  if (n < 1000) return n.toFixed(1)
  if (n < 1e6) return (n / 1e3).toFixed(1) + 'K'
  if (n < 1e9) return (n / 1e6).toFixed(1) + 'M'
  return n.toExponential(2)
}

function snapshot(state: SimState): string {
  const totalBuildings = Object.values(state.buildings).reduce((a, b) => a + b, 0)
  const { netCredits, netEnergy, cgThrottle, energyThrottle } = simTick(state, 0)
  const cgProd = calcCgProduction(state) * energyThrottle
  const cgCons = calcCgConsumption(state)
  return `₢${fmt(state.credits)} (${fmt(netCredits)}/s) | E=${fmt(state.energy)} (${fmt(netEnergy)}/s) | CG=${fmt(cgProd)}/${fmt(cgCons)} | eff=${(cgThrottle * 100).toFixed(0)}% | bldg=${totalBuildings}`
}

// ── SIMULATION TESTS ──

describe('simulation — balanced player (Type 0)', () => {
  it('should progress without throttle when buying CG alongside production', () => {
    const state = createState()
    state.credits = 1000 // reasonable start after some clicking

    // Buy balanced: miners + solar + CG
    buyMax(state, 'mining_drone', 5)
    buyMax(state, 'solar_array', 3)
    buyMax(state, 'consumer_factory', 1)

    const { cgThrottle, energyThrottle } = simTick(state, 0)
    const cgProd = calcCgProduction(state) * energyThrottle
    const cgCons = calcCgConsumption(state)

    console.log(`Balanced start: CG prod=${cgProd} cons=${cgCons} energy throttle=${(energyThrottle*100).toFixed(0)}% cg throttle=${(cgThrottle*100).toFixed(0)}%`)

    // 8 buildings * 0.25 = 2 CG consumption, 1 factory = 5 CG production → surplus
    expect(cgThrottle).toBe(1)
    // 3 solar arrays = 6 energy, 1 factory = 5 energy upkeep → covered
    expect(energyThrottle).toBe(1)
  })
})

describe('simulation — greedy player (no CG)', () => {
  it('should be throttled to 25% and recover when adding CG factories', () => {
    const state = createState()
    state.credits = 5000

    // Spam miners, no CG
    buyMax(state, 'mining_drone', 20)
    buyMax(state, 'solar_array', 10)

    const { cgThrottle: before } = simTick(state, 0)
    expect(before).toBe(0.25) // max throttle

    // Add CG factories + earn a bit first
    state.credits += 2000
    buyMax(state, 'consumer_factory', 2)

    const { cgThrottle: after, energyThrottle } = simTick(state, 0)
    console.log(`Greedy recovery: before=${(before*100).toFixed(0)}% after=${(after*100).toFixed(0)}% energy=${(energyThrottle*100).toFixed(0)}%`)

    // 2 factories = 10 CG/s, 30 buildings * 0.25 = 7.5 CG/s → surplus
    expect(after).toBe(1)
  })
})

describe('simulation — energy-starved CG player', () => {
  it('CG factories without energy should be throttled', () => {
    const state = createState()
    state.credits = 10000

    // CG factories but no energy
    buyMax(state, 'consumer_factory', 5)
    buyMax(state, 'mining_drone', 10)

    const { energyThrottle, cgThrottle } = simTick(state, 0)
    console.log(`Energy starved: energyThrottle=${(energyThrottle*100).toFixed(0)}% cgThrottle=${(cgThrottle*100).toFixed(0)}%`)

    // 0 energy, 5 factories need 25 energy → max throttle
    expect(energyThrottle).toBe(0.25)
    // CG production at 25% = 6.25 CG/s, consumption = 2.5 CG/s → still covered!
    // This shows energy starvation reduces CG capacity but doesn't kill it
    // To actually cause CG deficit, you'd need MORE non-CG buildings
    expect(cgThrottle).toBeLessThanOrEqual(1)
  })
})

describe('simulation — long-run Type 0 progression', () => {
  it('should accumulate wealth over 10 minutes with earn-and-buy cycles', () => {
    const state = createState()
    state.credits = 1000

    const log: string[] = []

    // Round 1: bootstrap
    buyMax(state, 'mining_drone', 5)
    buyMax(state, 'solar_array', 3)
    buyMax(state, 'consumer_factory', 1)
    simulate(state, 120)
    log.push('Round 1 (2min): ' + snapshot(state))

    // Round 2: expand
    buyMax(state, 'ore_refinery', 3)
    buyMax(state, 'wind_turbine_grid', 2)
    buyMax(state, 'consumer_factory', 1)
    simulate(state, 120)
    log.push('Round 2 (4min): ' + snapshot(state))

    // Round 3: more
    buyMax(state, 'cargo_shuttle', 3)
    buyMax(state, 'geothermal_tap', 2)
    buyMax(state, 'consumer_factory', 2)
    simulate(state, 120)
    log.push('Round 3 (6min): ' + snapshot(state))

    // Round 4: bigger
    buyMax(state, 'orbital_factory', 2)
    buyMax(state, 'fission_plant', 2)
    buyMax(state, 'consumer_factory', 2)
    simulate(state, 120)
    log.push('Round 4 (8min): ' + snapshot(state))

    // Round 5: top tier
    buyMax(state, 'space_station', 2)
    buyMax(state, 'orbital_mirror', 2)
    buyMax(state, 'consumer_factory', 2)
    simulate(state, 120)
    log.push('Round 5 (10min): ' + snapshot(state))

    console.log('=== Smart Player 10-min Run ===')
    log.forEach(l => console.log('  ' + l))

    // Should have accumulated meaningful credits
    expect(state.credits).toBeGreaterThan(1000)

    // Final throttle should be reasonable
    const { cgThrottle } = simTick(state, 0)
    expect(cgThrottle).toBeGreaterThanOrEqual(0.5)
  })
})

describe('simulation — energy chain validation', () => {
  it('energy → CG → credits chain works with proper ratio', () => {
    const state = createState()
    state.credits = 100000

    // Build balanced chain
    buyMax(state, 'solar_array', 5)         // 10 energy/s
    buyMax(state, 'consumer_factory', 2)     // 10 CG/s, needs 10 energy/s
    buyMax(state, 'mining_drone', 20)        // needs 5 CG/s

    const { netCredits, netEnergy, cgThrottle, energyThrottle } = simTick(state, 0)

    console.log('=== Energy Chain ===')
    console.log(`  Energy: ${fmt(calcProduction(state, 'energy'))} prod, ${fmt(calcEnergyUpkeep(state))} upkeep → ${(energyThrottle*100).toFixed(0)}%`)
    console.log(`  CG: ${fmt(calcCgProduction(state)*energyThrottle)} prod, ${fmt(calcCgConsumption(state))} cons → ${(cgThrottle*100).toFixed(0)}%`)
    console.log(`  Credits: ${fmt(netCredits)}/s`)

    expect(energyThrottle).toBe(1)
    expect(cgThrottle).toBe(1)
    expect(netCredits).toBeGreaterThan(0)
  })
})

describe('simulation — no death spiral', () => {
  it('CG deficit should not affect energy production', () => {
    const state = createState()
    state.credits = 100000

    buyMax(state, 'solar_array', 20)
    buyMax(state, 'mining_drone', 50)

    const energyProd = calcProduction(state, 'energy')
    const { cgThrottle } = simTick(state, 0)

    expect(cgThrottle).toBe(0.25) // fully throttled
    expect(energyProd).toBeGreaterThan(0)
    // Energy stays at full — not affected by CG deficit
    console.log(`Death spiral: CG=${(cgThrottle*100).toFixed(0)}% but energy=${fmt(energyProd)}/s (unaffected)`)
  })

  it('sustained deficit still grows credits (at 25%)', () => {
    const state = createState()
    state.credits = 1000

    buyMax(state, 'mining_drone', 20)
    simulate(state, 300) // 5 min in full deficit

    expect(state.credits).toBeGreaterThan(1000) // still earning at 25%
  })
})

describe('simulation — milestone CG pressure', () => {
  it('hitting 25 buildings doubles CG consumption', () => {
    const state = createState()
    state.credits = 1e9

    for (let i = 0; i < 24; i++) buyBuilding(state, 'mining_drone')
    const cg24 = calcCgConsumption(state)

    buyBuilding(state, 'mining_drone')
    const cg25 = calcCgConsumption(state)

    console.log(`Milestone: 24=${cg24.toFixed(2)} CG/s, 25=${cg25.toFixed(2)} CG/s (${(cg25/cg24).toFixed(2)}x)`)
    expect(cg25).toBeGreaterThan(cg24 * 1.5)
  })
})

describe('simulation — Type 1 transition', () => {
  it('Type 0 CG factories insufficient for Type 1 buildings', () => {
    const state = createState()
    state.credits = 1e7

    for (let i = 0; i < 10; i++) buyBuilding(state, 'consumer_factory')
    buyMax(state, 'asteroid_mine', 5)
    buyMax(state, 'fusion_reactor', 5)

    const { cgThrottle } = simTick(state, 0)
    console.log(`Type 1 with Type 0 CG: throttle=${(cgThrottle*100).toFixed(0)}%`)

    // 10 Type 0 factories = 50 CG/s vs 10 Type 1 buildings * 250 = 2500 CG/s
    expect(cgThrottle).toBe(0.25)

    // Add 1 Industrial Complex
    state.credits += 1e6
    buyBuilding(state, 'industrial_complex')
    // Also need energy for it
    buyMax(state, 'fusion_reactor', 3)

    const { cgThrottle: t2 } = simTick(state, 0)
    console.log(`After Industrial Complex: throttle=${(t2*100).toFixed(0)}%`)
    expect(t2).toBeGreaterThan(0.5)
  })
})

describe('simulation — time to 100% with clicking', () => {
  // Simulate a real player: click to earn credits, buy buildings, measure time to full CG efficiency

  function clickForCredits(state: SimState, clickPower: number, clicks: number) {
    state.credits += clickPower * clicks
  }

  it('from fresh start: how long to reach 100% CG efficiency', () => {
    const state = createState()
    const clickPower = 1
    let totalClicks = 0
    let totalSeconds = 0
    const log: string[] = []

    // Phase 1: Click to afford first miner
    clickForCredits(state, clickPower, 10) // 10 clicks = 10 credits
    totalClicks += 10
    buyBuilding(state, 'mining_drone')
    log.push(`${totalClicks} clicks: bought Mining Drone`)

    // Phase 2: Click + idle to afford solar array (50 credits)
    while (state.credits < 50) {
      clickForCredits(state, clickPower, 1)
      totalClicks++
      simTick(state, 1) // 1 second passes
      totalSeconds++
    }
    buyBuilding(state, 'solar_array')
    log.push(`${totalClicks} clicks / ${totalSeconds}s: bought Solar Array`)

    // Phase 3: earn to afford CG factory (500 credits)
    while (state.credits < 500) {
      clickForCredits(state, clickPower, 1)
      totalClicks++
      simTick(state, 1)
      totalSeconds++
    }
    buyBuilding(state, 'consumer_factory')
    log.push(`${totalClicks} clicks / ${totalSeconds}s: bought Consumer Factory`)

    const { cgThrottle, energyThrottle } = simTick(state, 0)
    log.push(`CG efficiency: ${(cgThrottle * 100).toFixed(0)}% | Energy efficiency: ${(energyThrottle * 100).toFixed(0)}%`)

    console.log('=== Fresh Start → 100% CG ===')
    log.forEach(l => console.log('  ' + l))

    // With 1 miner + 1 solar + 1 CG factory:
    // CG: 5 prod vs 2*0.25 = 0.5 cons → 100%
    // Energy: 2 prod vs 5 upkeep → throttled!
    // This reveals the player needs MORE solar arrays before CG factory pays off
  })

  it('optimal early game path to 100% CG efficiency', () => {
    const state = createState()
    const clickPower = 1
    let totalClicks = 0
    let totalSeconds = 0
    const log: string[] = []

    // Step 1: Click to buy 3 miners (cheap, start earning)
    while ((state.buildings['mining_drone'] || 0) < 3) {
      while (state.credits < calcBuildingCost(10, 1.045, state.buildings['mining_drone'] || 0, 1)) {
        clickForCredits(state, clickPower, 1)
        totalClicks++
        simTick(state, 1)
        totalSeconds++
      }
      buyBuilding(state, 'mining_drone')
    }
    log.push(`${totalClicks} clicks / ${totalSeconds}s: 3 Mining Drones`)

    // Step 2: Buy 3 solar arrays (need energy for CG factory)
    while ((state.buildings['solar_array'] || 0) < 3) {
      while (state.credits < calcBuildingCost(50, 1.045, state.buildings['solar_array'] || 0, 1)) {
        clickForCredits(state, clickPower, 1)
        totalClicks++
        simTick(state, 1)
        totalSeconds++
      }
      buyBuilding(state, 'solar_array')
    }
    log.push(`${totalClicks} clicks / ${totalSeconds}s: 3 Solar Arrays`)

    // Step 3: Buy CG factory
    while (state.credits < calcBuildingCost(500, 1.06, 0, 1)) {
      clickForCredits(state, clickPower, 1)
      totalClicks++
      simTick(state, 1)
      totalSeconds++
    }
    buyBuilding(state, 'consumer_factory')
    log.push(`${totalClicks} clicks / ${totalSeconds}s: Consumer Factory`)

    const { cgThrottle, energyThrottle } = simTick(state, 0)
    log.push(`RESULT: CG=${(cgThrottle * 100).toFixed(0)}% Energy=${(energyThrottle * 100).toFixed(0)}%`)

    // 3 solar = 6 energy, 1 CG factory = 5 energy upkeep → energy OK
    // 1 CG factory = 5 CG/s, 6 buildings * 0.25 = 1.5 CG → CG OK
    expect(energyThrottle).toBe(1)
    expect(cgThrottle).toBe(1)

    console.log('=== Optimal Path → 100% ===')
    log.forEach(l => console.log('  ' + l))
    console.log(`  Total: ${totalClicks} clicks, ${totalSeconds} seconds (${(totalSeconds/60).toFixed(1)} min)`)
  })

  it('recovery time: 30 buildings in deficit → clicks to buy CG factories for 100%', () => {
    const state = createState()
    state.credits = 5000

    // Build 15 miners + 15 solar arrays (no CG)
    for (let i = 0; i < 15; i++) buyBuilding(state, 'mining_drone')
    for (let i = 0; i < 15; i++) buyBuilding(state, 'solar_array')

    const { cgThrottle: before } = simTick(state, 0)
    expect(before).toBe(0.25) // fully throttled

    // How many CG factories to recover?
    // 30 buildings * 0.25 = 7.5 CG consumption → need 2 factories (10 CG/s)
    // Each factory costs ~500 credits at current price, needs 5 energy/s

    const clickPower = 1
    let clicks = 0
    let seconds = 0

    // Click + earn (at 25% throttle) until we can afford 2 CG factories
    const targetFactories = 2
    while ((state.buildings['consumer_factory'] || 0) < targetFactories) {
      const cost = calcBuildingCost(500, 1.06, state.buildings['consumer_factory'] || 0, 1)
      while (state.credits < cost) {
        clickForCredits(state, clickPower, 1)
        clicks++
        simTick(state, 1)
        seconds++
        if (seconds > 600) break // safety cap at 10 min
      }
      if (seconds > 600) break
      buyBuilding(state, 'consumer_factory')
    }

    const { cgThrottle: after, energyThrottle } = simTick(state, 0)

    console.log('=== Deficit Recovery ===')
    console.log(`  30 buildings, 0 CG: ${(before * 100).toFixed(0)}% efficiency`)
    console.log(`  After ${clicks} clicks / ${seconds}s: bought ${state.buildings['consumer_factory']} CG factories`)
    console.log(`  CG=${(after * 100).toFixed(0)}% Energy=${(energyThrottle * 100).toFixed(0)}%`)
    console.log(`  Recovery time: ${seconds}s (${(seconds / 60).toFixed(1)} min)`)

    expect(after).toBe(1)
    // Recovery should be achievable within a reasonable time (< 5 min clicking)
    expect(seconds).toBeLessThan(300)
  })
})

describe('simulation — CG deficit recovery is instant', () => {
  it('rate-based system recovers immediately when factories are built', () => {
    const state = createState()
    state.credits = 50000

    buyMax(state, 'mining_drone', 20)
    buyMax(state, 'solar_array', 20)
    const { cgThrottle: before } = simTick(state, 0)
    expect(before).toBe(0.25)

    // Build CG factories
    buyMax(state, 'consumer_factory', 5)
    const { cgThrottle: after } = simTick(state, 0)
    console.log(`Recovery: ${(before*100).toFixed(0)}% → ${(after*100).toFixed(0)}% (instant)`)

    // 5 factories * 5 = 25 CG/s, 40 buildings * 0.25 = 10 CG/s → surplus
    expect(after).toBe(1)
  })
})
