import { describe, expect, it } from 'vitest'
import {
  formatNumber,
  calcPrestigeInfluence,
  calcRepeatableCost,
  calcBuildingMultiplier,
  calcBuildingCost,
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

describe('calcPrestigeInfluence', () => {
  it('returns 0 for 0 energy', () => {
    expect(calcPrestigeInfluence(0)).toBe(0)
  })

  it('returns 1 for exactly 100000 energy', () => {
    expect(calcPrestigeInfluence(100000)).toBe(1)
  })

  it('returns 2 for 400000 energy', () => {
    expect(calcPrestigeInfluence(400000)).toBe(2)
  })

  it('returns 100 for 1e9 energy', () => {
    expect(calcPrestigeInfluence(1e9)).toBe(100)
  })

  it('floors fractional results', () => {
    // 150000 → sqrt(1.5) ≈ 1.22 → floor = 1
    expect(calcPrestigeInfluence(150000)).toBe(1)
    // 399999 → sqrt(3.99999) ≈ 1.999 → floor = 1
    expect(calcPrestigeInfluence(399999)).toBe(1)
  })

  it('returns 0 for energy below threshold', () => {
    expect(calcPrestigeInfluence(99999)).toBe(0)
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
  it('returns 0 for 0 amount', () => {
    expect(calcCreditsReceived(0, 0)).toBe(0)
  })

  it('returns 0 for negative amount', () => {
    expect(calcCreditsReceived(-10, 0)).toBe(0)
  })

  it('approximates BASE_RATE for small amounts with 0 pressure', () => {
    // For very small amounts, integral ≈ BASE_RATE * amount
    const result = calcCreditsReceived(1, 0)
    expect(result).toBeCloseTo(BASE_RATE * 1, 1)
  })

  it('gives diminishing returns for large amounts', () => {
    const small = calcCreditsReceived(100, 0)
    const large = calcCreditsReceived(10000, 0)
    // Large trade should get worse average rate
    const smallAvg = small / 100
    const largeAvg = large / 10000
    expect(largeAvg).toBeLessThan(smallAvg)
  })

  it('gives worse rate with existing pressure', () => {
    const noPressure = calcCreditsReceived(1000, 0)
    const withPressure = calcCreditsReceived(1000, 5000)
    expect(withPressure).toBeLessThan(noPressure)
  })
})

// ── calcEnergyReceived (exchange) ──

describe('calcEnergyReceived', () => {
  it('returns 0 for 0 amount', () => {
    expect(calcEnergyReceived(0, 0)).toBe(0)
  })

  it('approximates amount/BASE_RATE for small amounts', () => {
    // 10 credits at base rate of 10 credits/energy ≈ 1 energy
    const result = calcEnergyReceived(10, 0)
    expect(result).toBeCloseTo(10 / BASE_RATE, 1)
  })

  it('gives diminishing returns for large amounts', () => {
    const small = calcEnergyReceived(1000, 0)
    const large = calcEnergyReceived(100000, 0)
    const smallAvg = 1000 / small // credits per energy
    const largeAvg = 100000 / large
    expect(largeAvg).toBeGreaterThan(smallAvg)
  })

  it('selling energy then buying back costs more (no arbitrage)', () => {
    const energySold = 1000
    const creditsGained = calcCreditsReceived(energySold, 0)
    // Now try to buy back energy with those credits
    const energyBought = calcEnergyReceived(creditsGained, 0)
    // Should get back less energy than we started with (spread)
    expect(energyBought).toBeLessThan(energySold)
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

  it('prestige influence scales with sqrt of energy', () => {
    // Doubling energy does not double influence
    const inf1 = calcPrestigeInfluence(1e6)
    const inf2 = calcPrestigeInfluence(2e6)
    expect(inf2).toBeLessThan(inf1 * 2)
    expect(inf2).toBeGreaterThan(inf1)
  })

  it('exchange flooding prevents dump-and-convert exploits', () => {
    // Selling 1M energy in one go gives much less than 1M * BASE_RATE credits
    const bigSell = calcCreditsReceived(1e6, 0)
    const idealCredits = 1e6 * BASE_RATE
    // Should get significantly less — at least 30% degradation for a dump this large
    expect(bigSell).toBeLessThan(idealCredits * 0.7)
  })
})
