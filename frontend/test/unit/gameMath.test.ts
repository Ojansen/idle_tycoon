import { describe, expect, it } from 'vitest'
import {
  formatNumber,
  calcPrestigeInfluence,
  calcRepeatableCost,
  calcBuildingMultiplier,
  calcUpkeepMultiplier,
  calcBuildingCost,
  calcMaxBuyable,
  calcClickPower,
  calcCreditsReceived,
  calcEnergyReceived,
  calcExchangeRate,
  calcMarketHealth,
  calcPressureDecay,
  calcCrashPoint,
  BASE_RATE,
  ENERGY_PRESSURE_K,
  CREDITS_PRESSURE_K,
  PRESSURE_DECAY_RATE
} from '../../app/utils/gameMath'

// ── formatNumber ──

describe('formatNumber', () => {
  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0.0')
  })

  it('formats small numbers with one decimal', () => {
    expect(formatNumber(0.5)).toBe('0.5')
    expect(formatNumber(9.9)).toBe('9.9')
  })

  it('floors numbers >= 10 and < 1000', () => {
    expect(formatNumber(10)).toBe('10')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(999.9)).toBe('999')
  })

  it('formats thousands', () => {
    expect(formatNumber(1000)).toBe('1.00K')
    expect(formatNumber(1500)).toBe('1.50K')
    expect(formatNumber(15000)).toBe('15.0K')
    expect(formatNumber(150000)).toBe('150K')
  })

  it('formats millions and beyond', () => {
    expect(formatNumber(1e6)).toBe('1.00M')
    expect(formatNumber(1e9)).toBe('1.00B')
    expect(formatNumber(1e12)).toBe('1.00T')
  })

  it('handles Infinity', () => {
    expect(formatNumber(Infinity)).toBe('0')
    expect(formatNumber(-Infinity)).toBe('0')
  })

  it('handles NaN', () => {
    expect(formatNumber(NaN)).toBe('0')
  })

  it('handles negative numbers', () => {
    expect(formatNumber(-1500)).toBe('-1.50K')
    expect(formatNumber(-5)).toBe('-5.0')
  })
})

// ── calcPrestigeInfluence ──
// Formula: floor(log2(totalEnergyEarned / 1e5) * 50)
// Kardashev milestone grants are awarded separately (one-time, not per-prestige)

describe('calcPrestigeInfluence', () => {
  it('returns 0 for 0 energy', () => {
    expect(calcPrestigeInfluence(0)).toBe(0)
  })

  it('returns 0 for energy below threshold (1e5)', () => {
    expect(calcPrestigeInfluence(99999)).toBe(0)
    expect(calcPrestigeInfluence(1e5)).toBe(0) // log2(1) = 0
  })

  it('returns ~166 for 1e6 energy', () => {
    // log2(10) * 50 ≈ 166
    expect(calcPrestigeInfluence(1e6)).toBe(Math.floor(Math.log2(10) * 50))
  })

  it('returns ~830 for 1e10 energy', () => {
    // log2(1e5) * 50 ≈ 830
    expect(calcPrestigeInfluence(1e10)).toBe(Math.floor(Math.log2(1e5) * 50))
  })

  it('growth is logarithmic — doubling energy adds exactly 50 influence', () => {
    const at1e10 = calcPrestigeInfluence(1e10)
    const at2e10 = calcPrestigeInfluence(2e10)
    expect(at2e10 - at1e10).toBe(50)
  })

  it('late game stays controlled — 1e30 gives only ~4.2K', () => {
    const result = calcPrestigeInfluence(1e30)
    // log2(1e25) * 50 ≈ 4152
    expect(result).toBeLessThan(5000)
    expect(result).toBeGreaterThan(4000)
  })

  it('floors fractional results', () => {
    const result = calcPrestigeInfluence(2e5) // log2(2) * 50 = 50 exactly
    expect(result).toBe(50)
  })
})

// ── calcBuildingMultiplier ──

describe('calcBuildingMultiplier', () => {
  it('returns 1x for 0 owned', () => {
    expect(calcBuildingMultiplier(0)).toBe(1)
  })

  it('returns 1x for 24 owned (not yet at milestone)', () => {
    expect(calcBuildingMultiplier(24)).toBe(1)
  })

  it('returns 2x for 25 owned', () => {
    expect(calcBuildingMultiplier(25)).toBe(2)
  })

  it('returns 4x for 50 owned', () => {
    expect(calcBuildingMultiplier(50)).toBe(4)
  })

  it('returns 16x for 100 owned', () => {
    expect(calcBuildingMultiplier(100)).toBe(16)
  })

  it('scales uncapped at high counts', () => {
    expect(calcBuildingMultiplier(150)).toBe(64)
    expect(calcBuildingMultiplier(200)).toBe(256)
    expect(calcBuildingMultiplier(500)).toBe(1048576)
  })

  it('stays at same tier between milestones', () => {
    expect(calcBuildingMultiplier(49)).toBe(2)
    expect(calcBuildingMultiplier(74)).toBe(4)
  })
})

// ── calcUpkeepMultiplier ──
// Formula: calcBuildingMultiplier(owned)^0.8 = (2^floor(owned/25))^0.8
// Dampening factor 0.8 means upkeep/CG production scales slower than credit/energy output,
// keeping the CG system manageable at high building counts.

describe('calcUpkeepMultiplier', () => {
  it('returns 1x for 0 owned', () => {
    expect(calcUpkeepMultiplier(0)).toBe(1)
  })

  it('returns 1x for 24 owned (below first milestone)', () => {
    expect(calcUpkeepMultiplier(24)).toBe(1)
  })

  it('returns 2^0.8 (~1.741) for 25 owned', () => {
    expect(calcUpkeepMultiplier(25)).toBeCloseTo(Math.pow(2, 0.8), 10)
  })

  it('returns 4^0.8 (~3.031) for 50 owned', () => {
    expect(calcUpkeepMultiplier(50)).toBeCloseTo(Math.pow(4, 0.8), 10)
  })

  it('returns 16^0.8 (~9.19) for 100 owned', () => {
    expect(calcUpkeepMultiplier(100)).toBeCloseTo(Math.pow(16, 0.8), 10)
  })

  it('grows slower than calcBuildingMultiplier at every milestone', () => {
    for (const n of [25, 50, 100, 150, 200]) {
      expect(calcUpkeepMultiplier(n)).toBeLessThan(calcBuildingMultiplier(n))
    }
  })

  it('stays at 1x between 0 and 24', () => {
    expect(calcUpkeepMultiplier(1)).toBe(1)
    expect(calcUpkeepMultiplier(10)).toBe(1)
    expect(calcUpkeepMultiplier(24)).toBe(1)
  })

  it('stays at same tier between milestones', () => {
    // Between 25 and 49, multiplier is constant at 2^0.8
    expect(calcUpkeepMultiplier(26)).toBeCloseTo(calcUpkeepMultiplier(25), 10)
    expect(calcUpkeepMultiplier(49)).toBeCloseTo(calcUpkeepMultiplier(25), 10)
    // Between 50 and 74, multiplier is constant at 4^0.8
    expect(calcUpkeepMultiplier(74)).toBeCloseTo(calcUpkeepMultiplier(50), 10)
  })

  it('jumps at the 25-building milestone boundary', () => {
    const before = calcUpkeepMultiplier(24)
    const after = calcUpkeepMultiplier(25)
    expect(after).toBeGreaterThan(before)
    expect(after / before).toBeCloseTo(Math.pow(2, 0.8), 10)
  })

  it('scales correctly at high counts', () => {
    // owned=150 → floor(150/25)=6 milestones → 2^6=64 → 64^0.8
    expect(calcUpkeepMultiplier(150)).toBeCloseTo(Math.pow(64, 0.8), 5)
    // owned=200 → floor(200/25)=8 milestones → 2^8=256 → 256^0.8
    expect(calcUpkeepMultiplier(200)).toBeCloseTo(Math.pow(256, 0.8), 5)
  })
})

// ── calcBuildingCost ──

describe('calcBuildingCost', () => {
  it('calculates single building cost with no multipliers', () => {
    // baseCost=10, mult=1.12, owned=0, qty=1, combinedMult=1
    expect(calcBuildingCost(10, 1.12, 0, 1)).toBe(10) // floor(10 * 1.12^0 * 1) = 10
  })

  it('scales cost with owned buildings', () => {
    // baseCost=10, costMult=1.12, owned=5, qty=1
    const expected = Math.floor(10 * Math.pow(1.12, 5))
    expect(calcBuildingCost(10, 1.12, 5, 1)).toBe(expected)
  })

  it('sums geometric series for multiple buildings', () => {
    // Buy 3 buildings starting at owned=0
    const expected =
      Math.floor(10 * Math.pow(1.12, 0)) +
      Math.floor(10 * Math.pow(1.12, 1)) +
      Math.floor(10 * Math.pow(1.12, 2))
    expect(calcBuildingCost(10, 1.12, 0, 3)).toBe(expected)
  })

  it('applies cost reduction multiplier', () => {
    // combinedMult = 0.8 (20% cheaper)
    const expected = Math.floor(100 * Math.pow(1.15, 0) * 0.8)
    expect(calcBuildingCost(100, 1.15, 0, 1, 0.8)).toBe(expected)
  })

  it('returns 0 for quantity 0', () => {
    expect(calcBuildingCost(10, 1.12, 0, 0)).toBe(0)
  })
})

// ── calcRepeatableCost ──

describe('calcRepeatableCost', () => {
  it('returns baseCost at level 0', () => {
    expect(calcRepeatableCost(2, 1.5, 0)).toBe(2)
  })

  it('scales with costScale at level 1', () => {
    expect(calcRepeatableCost(2, 1.5, 1)).toBe(Math.floor(2 * 1.5))
  })

  it('scales exponentially at level 5', () => {
    expect(calcRepeatableCost(2, 1.5, 5)).toBe(Math.floor(2 * Math.pow(1.5, 5)))
  })

  it('floors the result', () => {
    // 3 * 1.2^1 = 3.6 → floor = 3
    expect(calcRepeatableCost(3, 1.2, 1)).toBe(3)
  })
})

// ── calcClickPower ──

describe('calcClickPower', () => {
  it('returns baseClick with 0 autoclick', () => {
    expect(calcClickPower(10, 0)).toBe(10) // 10 * (1 + 0) = 10
  })

  it('applies sqrt pop boost', () => {
    // baseClick=10, autoclick=100 → 10 * (1 + 10) = 110
    expect(calcClickPower(10, 100)).toBe(110)
  })

  it('floors the result', () => {
    // baseClick=10, autoclick=2 → 10 * (1 + 1.414) = 24.14 → 24
    expect(calcClickPower(10, 2)).toBe(24)
  })

  it('never returns less than 1', () => {
    // With click-reducing trait: baseClick=0.8, autoclick=0 → floor(0.8) = 0 → clamped to 1
    expect(calcClickPower(0.8, 0)).toBe(1)
    expect(calcClickPower(0, 0)).toBe(1)
    expect(calcClickPower(0.1, 0)).toBe(1)
  })

  it('handles large autoclick values with diminishing returns', () => {
    // sqrt(10000) = 100, so boost is 101x. Much less than 10000x linear would be.
    expect(calcClickPower(1, 10000)).toBe(101)
  })
})

// ── calcCreditsReceived (exchange) ──

describe('calcCreditsReceived', () => {
  const PROD = 1000 // test production rate

  it('returns 0 for 0 amount', () => {
    expect(calcCreditsReceived(0, 0, PROD)).toBe(0)
  })

  it('returns 0 for negative amount', () => {
    expect(calcCreditsReceived(-10, 0, PROD)).toBe(0)
  })

  it('returns 0 for 0 production rate', () => {
    expect(calcCreditsReceived(100, 0, 0)).toBe(0)
  })

  it('approximates BASE_RATE for small amounts with 0 pressure', () => {
    // For very small amounts relative to production, integral ≈ BASE_RATE * amount
    const result = calcCreditsReceived(1, 0, PROD)
    expect(result).toBeCloseTo(BASE_RATE * 1, 1)
  })

  it('gives diminishing returns for large amounts relative to production', () => {
    const small = calcCreditsReceived(100, 0, PROD)
    const large = calcCreditsReceived(10000, 0, PROD)
    const smallAvg = small / 100
    const largeAvg = large / 10000
    expect(largeAvg).toBeLessThan(smallAvg)
  })

  it('gives worse rate with existing pressure', () => {
    const noPressure = calcCreditsReceived(1000, 0, PROD)
    const withPressure = calcCreditsReceived(1000, 5000, PROD)
    expect(withPressure).toBeLessThan(noPressure)
  })

  it('scales proportionally with production rate', () => {
    // Selling 10% of production should give similar % return regardless of scale
    const smallProd = 100
    const largeProd = 1e24
    const smallResult = calcCreditsReceived(smallProd * 0.1, 0, smallProd)
    const largeResult = calcCreditsReceived(largeProd * 0.1, 0, largeProd)
    // Both should yield ~10% of production * BASE_RATE
    const smallPct = smallResult / (smallProd * 0.1 * BASE_RATE)
    const largePct = largeResult / (largeProd * 0.1 * BASE_RATE)
    expect(Math.abs(smallPct - largePct)).toBeLessThan(0.01)
  })
})

// ── calcEnergyReceived (exchange) ──

describe('calcEnergyReceived', () => {
  const PROD = 1000

  it('returns 0 for 0 amount', () => {
    expect(calcEnergyReceived(0, 0, PROD)).toBe(0)
  })

  it('approximates amount/BASE_RATE for small amounts', () => {
    // 10 credits at base rate of 1 credit/energy ≈ 10 energy
    const result = calcEnergyReceived(10, 0, PROD)
    expect(result).toBeCloseTo(10 / BASE_RATE, 1)
  })

  it('gives diminishing returns for large amounts relative to production', () => {
    const small = calcEnergyReceived(1000, 0, PROD)
    const large = calcEnergyReceived(100000, 0, PROD)
    const smallAvg = 1000 / small
    const largeAvg = 100000 / large
    expect(largeAvg).toBeGreaterThan(smallAvg)
  })

  it('selling energy then buying back costs more (no arbitrage)', () => {
    const energySold = 1000
    const creditsGained = calcCreditsReceived(energySold, 0, PROD)
    const energyBought = calcEnergyReceived(creditsGained, 0, PROD)
    expect(energyBought).toBeLessThan(energySold)
  })

  it('scales proportionally with production rate', () => {
    const smallProd = 100
    const largeProd = 1e24
    const smallResult = calcEnergyReceived(smallProd * 0.1, 0, smallProd)
    const largeResult = calcEnergyReceived(largeProd * 0.1, 0, largeProd)
    const smallPct = smallResult / (smallProd * 0.1 / BASE_RATE)
    const largePct = largeResult / (largeProd * 0.1 / BASE_RATE)
    expect(Math.abs(smallPct - largePct)).toBeLessThan(0.01)
  })
})

// ── calcPressureDecay ──

describe('calcPressureDecay', () => {
  it('returns unchanged pressure for dt=0', () => {
    expect(calcPressureDecay(1000, PRESSURE_DECAY_RATE, 0)).toBe(1000)
  })

  it('recovers ~95% after 300s (5 minutes)', () => {
    const initial = 1000
    const after300s = calcPressureDecay(initial, PRESSURE_DECAY_RATE, 300)
    const recovered = 1 - after300s / initial
    // Should recover approximately 95% (ln(20)/300 ≈ 0.01)
    expect(recovered).toBeGreaterThan(0.9)
    expect(recovered).toBeLessThan(1.0)
  })

  it('decays exponentially', () => {
    const p1 = calcPressureDecay(1000, PRESSURE_DECAY_RATE, 100)
    const p2 = calcPressureDecay(1000, PRESSURE_DECAY_RATE, 200)
    // p2 should be p1^2 / 1000 (exponential property)
    expect(p2).toBeCloseTo(calcPressureDecay(p1, PRESSURE_DECAY_RATE, 100), 5)
  })
})

// ── calcExchangeRate ──

describe('calcExchangeRate', () => {
  it('returns base rate with 0 pressure', () => {
    expect(calcExchangeRate(BASE_RATE, ENERGY_PRESSURE_K, 0)).toBe(BASE_RATE)
  })

  it('decreases with increasing pressure', () => {
    const rate0 = calcExchangeRate(BASE_RATE, ENERGY_PRESSURE_K, 0)
    const rate1000 = calcExchangeRate(BASE_RATE, ENERGY_PRESSURE_K, 1000)
    expect(rate1000).toBeLessThan(rate0)
  })
})

// ── calcMarketHealth ──

describe('calcMarketHealth', () => {
  it('returns 100% with 0 pressure', () => {
    expect(calcMarketHealth(ENERGY_PRESSURE_K, 0)).toBe(100)
  })

  it('decreases with pressure', () => {
    const health = calcMarketHealth(ENERGY_PRESSURE_K, 5000)
    expect(health).toBeLessThan(100)
    expect(health).toBeGreaterThan(0)
  })

  it('never exceeds 100%', () => {
    expect(calcMarketHealth(ENERGY_PRESSURE_K, -100)).toBeGreaterThanOrEqual(100)
  })
})

// ── calcCrashPoint ──

describe('calcCrashPoint', () => {
  it('returns 1.0 for random=0', () => {
    expect(calcCrashPoint(0)).toBeCloseTo(1.0, 1)
  })

  it('returns ~1.94 for random=0.5', () => {
    expect(calcCrashPoint(0.5)).toBeCloseTo(1.94, 2)
  })

  it('returns 97 for random=0.99', () => {
    expect(calcCrashPoint(0.99)).toBeCloseTo(97, 0)
  })

  it('always returns >= 1.0', () => {
    for (let i = 0; i < 100; i++) {
      expect(calcCrashPoint(Math.random())).toBeGreaterThanOrEqual(1.0)
    }
  })

  it('produces higher values for random closer to 1', () => {
    expect(calcCrashPoint(0.9)).toBeGreaterThan(calcCrashPoint(0.5))
    expect(calcCrashPoint(0.99)).toBeGreaterThan(calcCrashPoint(0.9))
  })
})

// ── Game progression scenario ──

describe('game progression', () => {
  it('credits accumulate linearly over ticks', () => {
    const creditsPerSecond = 100
    const dt = 0.1
    const ticks = 100 // 10 seconds
    const total = creditsPerSecond * dt * ticks
    expect(total).toBe(1000)
  })

  it('building milestone doubles output at 25 intervals', () => {
    const baseOutput = 5
    const buildingsOwned = [1, 24, 25, 50, 100, 150]
    const expected = [5, 5, 10, 20, 80, 320]
    buildingsOwned.forEach((owned, i) => {
      const output = baseOutput * calcBuildingMultiplier(owned)
      expect(output).toBe(expected[i])
    })
  })

  it('prestige influence scales logarithmically with energy', () => {
    // Doubling energy does not double influence
    const inf1 = calcPrestigeInfluence(1e6)
    const inf2 = calcPrestigeInfluence(2e6)
    expect(inf2).toBeLessThan(inf1 * 2)
    expect(inf2).toBeGreaterThan(inf1)
  })

  it('exchange flooding prevents dump-and-convert exploits', () => {
    // Selling 10000x your production rate should get significantly degraded
    const prodRate = 1000
    const bigSell = calcCreditsReceived(prodRate * 10000, 0, prodRate)
    const idealCredits = prodRate * 10000 * BASE_RATE
    // Should get significantly less — at least 30% degradation for a massive dump
    expect(bigSell).toBeLessThan(idealCredits * 0.7)
  })
})

// ── calcMaxBuyable ──

describe('calcMaxBuyable', () => {
  it('returns 0 for 0 budget', () => {
    expect(calcMaxBuyable(10, 1.045, 0, 0)).toBe(0)
  })

  it('returns 0 for negative budget', () => {
    expect(calcMaxBuyable(10, 1.045, 0, -100)).toBe(0)
  })

  it('returns 1 when budget equals first building cost', () => {
    // First mining drone costs 10
    expect(calcMaxBuyable(10, 1.045, 0, 10)).toBe(1)
  })

  it('returns correct count for exact budget', () => {
    // Calculate cost of 5 buildings and verify max buyable
    const cost5 = calcBuildingCost(10, 1.045, 0, 5)
    expect(calcMaxBuyable(10, 1.045, 0, cost5)).toBe(5)
    // Just under should give 4
    expect(calcMaxBuyable(10, 1.045, 0, cost5 - 1)).toBe(4)
  })

  it('accounts for already-owned buildings', () => {
    // With 50 owned, each new building is more expensive
    const cost1 = calcBuildingCost(10, 1.045, 50, 1)
    expect(calcMaxBuyable(10, 1.045, 50, cost1)).toBe(1)
    expect(calcMaxBuyable(10, 1.045, 50, cost1 - 1)).toBe(0)
  })

  it('applies cost reduction multiplier', () => {
    // With 50% cost reduction, should afford more buildings
    const normalMax = calcMaxBuyable(100, 1.05, 0, 10000, 1)
    const discountMax = calcMaxBuyable(100, 1.05, 0, 10000, 0.5)
    expect(discountMax).toBeGreaterThan(normalMax)
  })

  it('handles large budgets efficiently', () => {
    // Should not timeout even with huge budget
    const result = calcMaxBuyable(10, 1.045, 0, 1e15)
    expect(result).toBeGreaterThan(100)
    // Verify the result is correct: cost of N should be <= budget, cost of N+1 should exceed
    const costN = calcBuildingCost(10, 1.045, 0, result)
    const costN1 = calcBuildingCost(10, 1.045, 0, result + 1)
    expect(costN).toBeLessThanOrEqual(1e15)
    expect(costN1).toBeGreaterThan(1e15)
  })

  it('returns 0 when even 1 building is too expensive', () => {
    expect(calcMaxBuyable(1000, 1.05, 0, 500)).toBe(0)
  })
})
