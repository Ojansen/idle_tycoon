import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier } from '../../app/utils/gameMath'

// Trade coefficients (mirrors useTrade.ts)
const TRADE_COEFFICIENTS: Record<string, number> = {
  autoclick: 0.8,
  credits: 0.1,
  energy: 0.05,
  consumer_goods: 0.05
}

const EMPIRE_TRADE_SCALE = 50

// Building data subset for trade calculations
interface Building {
  id: string
  baseOutput: number
  resource: string
}

const buildings: Building[] = [
  // Type 0
  { id: 'mining_drone', baseOutput: 0.50, resource: 'credits' },
  { id: 'solar_array', baseOutput: 2.00, resource: 'energy' },
  { id: 'corporate_drone', baseOutput: 1, resource: 'autoclick' },
  { id: 'consumer_factory', baseOutput: 5, resource: 'consumer_goods' },
  // Type 1
  { id: 'asteroid_mine', baseOutput: 3000, resource: 'credits' },
  { id: 'fusion_reactor', baseOutput: 3600, resource: 'energy' },
  { id: 'executive_assistant', baseOutput: 15, resource: 'autoclick' },
  { id: 'industrial_complex', baseOutput: 5e3, resource: 'consumer_goods' },
]

// ── Helpers (mirror useTrade.ts logic) ──

function calcRawTradeValue(owned: Record<string, number>): number {
  let total = 0
  for (const b of buildings) {
    const count = owned[b.id] || 0
    if (count === 0) continue
    const coefficient = TRADE_COEFFICIENTS[b.resource] || 0
    if (coefficient === 0) continue
    total += count * b.baseOutput * calcBuildingMultiplier(count) * coefficient
  }
  return total
}

function calcEmpireSizeBonus(totalBuildings: number): number {
  return 1 + Math.log2(1 + totalBuildings / EMPIRE_TRADE_SCALE)
}

function calcTotalBuildings(owned: Record<string, number>): number {
  return Object.values(owned).reduce((sum, n) => sum + (n || 0), 0)
}

function calcConvertedTradeValue(rawTrade: number, multiplierStack: number, totalBuildings: number): number {
  return rawTrade * multiplierStack * calcEmpireSizeBonus(totalBuildings)
}

// ── TESTS ──

describe('Trade value — raw trade from buildings', () => {
  it('pop buildings contribute 80% of their raw output', () => {
    const owned = { corporate_drone: 10 }
    const trade = calcRawTradeValue(owned)
    const expected = 10 * 1 * calcBuildingMultiplier(10) * 0.8
    expect(trade).toBeCloseTo(expected)
  })

  it('credit buildings contribute 10% of their raw output', () => {
    const owned = { mining_drone: 10 }
    const trade = calcRawTradeValue(owned)
    const expected = 10 * 0.50 * calcBuildingMultiplier(10) * 0.1
    expect(trade).toBeCloseTo(expected)
  })

  it('energy buildings contribute 5% of their raw output', () => {
    const owned = { solar_array: 10 }
    const trade = calcRawTradeValue(owned)
    const expected = 10 * 2.0 * calcBuildingMultiplier(10) * 0.05
    expect(trade).toBeCloseTo(expected)
  })

  it('CG buildings contribute 5% of their raw output', () => {
    const owned = { consumer_factory: 10 }
    const trade = calcRawTradeValue(owned)
    const expected = 10 * 5 * calcBuildingMultiplier(10) * 0.05
    expect(trade).toBeCloseTo(expected)
  })

  it('pops are the dominant trade source in a mixed economy', () => {
    const owned = { mining_drone: 10, solar_array: 10, corporate_drone: 10, consumer_factory: 2 }
    const total = calcRawTradeValue(owned)

    const popTrade = 10 * 1 * calcBuildingMultiplier(10) * 0.8
    expect(popTrade / total).toBeGreaterThan(0.5)
  })

  it('no buildings = zero trade', () => {
    expect(calcRawTradeValue({})).toBe(0)
  })

  it('building multiplier milestones boost trade value', () => {
    const at24 = calcRawTradeValue({ corporate_drone: 24 })
    const at25 = calcRawTradeValue({ corporate_drone: 25 })
    // At 25, building multiplier jumps from 1 to 2
    expect(at25).toBeGreaterThan(at24 * 1.5)
  })
})

describe('Trade — empire size bonus', () => {
  it('empire size bonus starts at 1 with no buildings', () => {
    expect(calcEmpireSizeBonus(0)).toBeCloseTo(1)
  })

  it('empire size bonus increases with buildings', () => {
    expect(calcEmpireSizeBonus(50)).toBeGreaterThan(calcEmpireSizeBonus(0))
    expect(calcEmpireSizeBonus(200)).toBeGreaterThan(calcEmpireSizeBonus(50))
  })

  it('empire size bonus uses logarithmic scaling (sublinear growth)', () => {
    const bonus100 = calcEmpireSizeBonus(100)
    const bonus200 = calcEmpireSizeBonus(200)
    expect(bonus200).toBeGreaterThan(bonus100)
    expect(bonus200).toBeLessThan(bonus100 * 2)
  })
})

describe('Trade conversion — direct multiplier', () => {
  it('converted value = raw × multiplier × empire bonus', () => {
    const raw = 100
    const multiplier = 2
    const buildings = 50
    const expected = raw * multiplier * calcEmpireSizeBonus(buildings)
    expect(calcConvertedTradeValue(raw, multiplier, buildings)).toBeCloseTo(expected)
  })

  it('converted value scales linearly with multiplier stack', () => {
    const raw = 500
    const base = calcConvertedTradeValue(raw, 1, 50)
    const doubled = calcConvertedTradeValue(raw, 2, 50)
    expect(doubled).toBeCloseTo(base * 2)
  })

  it('larger empires get more converted value from empire size bonus', () => {
    const raw = 500
    const small = calcConvertedTradeValue(raw, 1, 20)
    const large = calcConvertedTradeValue(raw, 1, 200)
    expect(large).toBeGreaterThan(small)
  })

  it('zero raw trade = zero converted', () => {
    expect(calcConvertedTradeValue(0, 2, 100)).toBe(0)
  })
})

describe('Trade policies — resource conversion', () => {
  const policies = {
    wealth_creation: { credits: 1.0, energy: 0, consumerGoods: 0 },
    consumer_benefits: { credits: 0.5, energy: 0, consumerGoods: 0.5 },
    energy_subsidies: { credits: 0.5, energy: 0.5, consumerGoods: 0 },
    balanced_economy: { credits: 0.34, energy: 0.33, consumerGoods: 0.33 }
  }

  it('wealth creation converts 100% to credits', () => {
    const converted = 1000
    const policy = policies.wealth_creation
    expect(converted * policy.credits).toBe(1000)
    expect(converted * policy.energy).toBe(0)
    expect(converted * policy.consumerGoods).toBe(0)
  })

  it('consumer benefits splits 50/50 credits and CG', () => {
    const converted = 1000
    const policy = policies.consumer_benefits
    expect(converted * policy.credits).toBe(500)
    expect(converted * policy.consumerGoods).toBe(500)
  })

  it('energy subsidies splits 50/50 credits and energy', () => {
    const converted = 1000
    const policy = policies.energy_subsidies
    expect(converted * policy.credits).toBe(500)
    expect(converted * policy.energy).toBe(500)
  })

  it('balanced economy distributes roughly evenly', () => {
    const converted = 1000
    const policy = policies.balanced_economy
    const total = converted * policy.credits + converted * policy.energy + converted * policy.consumerGoods
    expect(total).toBeCloseTo(1000)
    // Each resource gets roughly 1/3
    expect(converted * policy.credits).toBeGreaterThan(300)
    expect(converted * policy.energy).toBeGreaterThan(300)
    expect(converted * policy.consumerGoods).toBeGreaterThan(300)
  })
})

describe('Trade integration — CG relief from empire pressure', () => {
  it('consumer benefits policy trade provides CG that helps offset empire pressure', () => {
    const owned = {
      mining_drone: 25, solar_array: 25, corporate_drone: 15,
      consumer_factory: 5, asteroid_mine: 10, fusion_reactor: 10
    }
    const rawTrade = calcRawTradeValue(owned)
    const totalBldgs = calcTotalBuildings(owned)
    const converted = calcConvertedTradeValue(rawTrade, 1, totalBldgs)

    // Consumer benefits: 50% goes to CG
    const tradeCg = converted * 0.5
    expect(tradeCg).toBeGreaterThan(0)
    expect(tradeCg).toBeGreaterThan(0.1)
  })

  it('larger empires generate more converted trade value', () => {
    const small = { corporate_drone: 10, mining_drone: 10 }
    const large = { corporate_drone: 50, mining_drone: 50, solar_array: 50, consumer_factory: 10 }

    const smallConverted = calcConvertedTradeValue(calcRawTradeValue(small), 1, calcTotalBuildings(small))
    const largeConverted = calcConvertedTradeValue(calcRawTradeValue(large), 1, calcTotalBuildings(large))
    expect(largeConverted).toBeGreaterThan(smallConverted)
  })
})
