import { describe, expect, it } from 'vitest'
import {
  formatNumber,
  calcPrestigeInfluence,
  calcRepeatableCost,
  calcBuildingMultiplier,
  calcUpkeepMultiplier,
  calcBuildingCost,
  calcMaxBuyable,
  calcHousingCap,
  calcOvercrowdingEfficiency,
  calcPopGrowth,
  calcDivisionOutput,
  calcDivisionUpgradeCost,
  calcPopDistribution,
  calcTransferCost,
  calcCgPerJob,
  calcJobCount,
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

// ── calcHousingCap ──

describe('calcHousingCap', () => {
  it('returns base housing when admin level is 0', () => {
    expect(calcHousingCap(10, 0, 5)).toBe(10)
  })

  it('adds housing per admin level', () => {
    // base=10, adminLevels=3, housingPerLevel=5 → 10 + 15 = 25
    expect(calcHousingCap(10, 3, 5)).toBe(25)
  })

  it('scales linearly with admin levels', () => {
    expect(calcHousingCap(0, 4, 10)).toBe(40)
    expect(calcHousingCap(0, 8, 10)).toBe(80)
  })

  it('works with zero base housing', () => {
    expect(calcHousingCap(0, 5, 3)).toBe(15)
  })

  it('works with zero housing per level', () => {
    expect(calcHousingCap(20, 10, 0)).toBe(20)
  })
})

// ── calcOvercrowdingEfficiency ──

describe('calcOvercrowdingEfficiency', () => {
  it('returns 1.0 when pops are under housing cap', () => {
    expect(calcOvercrowdingEfficiency(8, 10)).toBe(1.0)
  })

  it('returns 1.0 when pops exactly equal housing cap', () => {
    expect(calcOvercrowdingEfficiency(10, 10)).toBe(1.0)
  })

  it('drops linearly when pops exceed cap', () => {
    // pops=20, cap=10 → 10/20 = 0.5
    expect(calcOvercrowdingEfficiency(20, 10)).toBe(0.5)
    // pops=40, cap=10 → 10/40 = 0.25
    expect(calcOvercrowdingEfficiency(40, 10)).toBe(0.25)
  })

  it('clamps to minimum of 0.25', () => {
    // pops=100, cap=10 → 10/100 = 0.1, but clamped to 0.25
    expect(calcOvercrowdingEfficiency(100, 10)).toBe(0.25)
    expect(calcOvercrowdingEfficiency(10000, 10)).toBe(0.25)
  })

  it('returns 0.25 for any pops when cap is 0', () => {
    expect(calcOvercrowdingEfficiency(5, 0)).toBe(0.25)
  })

  it('returns 1.0 for 0 pops when cap is 0', () => {
    expect(calcOvercrowdingEfficiency(0, 0)).toBe(1.0)
  })
})

// ── calcPopGrowth ──

describe('calcPopGrowth', () => {
  it('returns 0 when pops equal housing cap (logistic stops at cap)', () => {
    expect(calcPopGrowth(1, 10, 10, 1, 1)).toBe(0)
  })

  it('returns 0 when housing cap is 0', () => {
    expect(calcPopGrowth(1, 5, 0, 1, 1)).toBe(0)
  })

  it('returns full base growth when pops are 0 and all modifiers are 1', () => {
    expect(calcPopGrowth(2, 0, 10, 1, 1)).toBe(2)
  })

  it('linear growth — constant rate regardless of current pops (until cap)', () => {
    const cap = 100
    const growthAtEmpty = calcPopGrowth(1, 0, cap, 1, 1)
    const growthAtHalf = calcPopGrowth(1, 50, cap, 1, 1)
    const growthAt90 = calcPopGrowth(1, 90, cap, 1, 1)
    expect(growthAtEmpty).toBe(1)
    expect(growthAtHalf).toBe(1)
    expect(growthAt90).toBe(1)
  })

  it('stops at housing cap', () => {
    expect(calcPopGrowth(1, 100, 100, 1, 1)).toBe(0)
    expect(calcPopGrowth(5, 98, 100, 1, 1)).toBe(2) // clamped to remaining space
  })

  it('applies planetGrowthMod multiplicatively', () => {
    const base = calcPopGrowth(1, 0, 10, 1, 1)
    const withMod = calcPopGrowth(1, 0, 10, 2, 1)
    expect(withMod).toBe(base * 2)
  })

  it('applies cgAvailability multiplicatively', () => {
    const full = calcPopGrowth(1, 0, 10, 1, 1)
    const half = calcPopGrowth(1, 0, 10, 1, 0.5)
    expect(half).toBe(full * 0.5)
  })

  it('returns 0 when cgAvailability is 0', () => {
    expect(calcPopGrowth(1, 5, 10, 1, 0)).toBe(0)
  })

  it('applies extraMultiplier', () => {
    const base = calcPopGrowth(1, 0, 10, 1, 1)
    const boosted = calcPopGrowth(1, 0, 10, 1, 1, 3)
    expect(boosted).toBe(base * 3)
  })

  it('growth is exactly 0 when pops exceed cap (clamped by max(0, ...))', () => {
    // pops > cap: logisticFactor = max(0, 1 - pops/cap) = 0
    expect(calcPopGrowth(10, 15, 10, 1, 1)).toBe(0)
  })
})

// ── calcDivisionOutput ──

describe('calcDivisionOutput', () => {
  it('returns 0 when baseProd, filledJobs, bonus, or efficiency is 0', () => {
    expect(calcDivisionOutput(0, 1, 10, 1.0, 1.0)).toBe(0)
    expect(calcDivisionOutput(5, 1, 0, 1.0, 1.0)).toBe(0)
    expect(calcDivisionOutput(5, 1, 10, 0, 1.0)).toBe(0)
    expect(calcDivisionOutput(5, 1, 10, 1.0, 0)).toBe(0)
  })

  it('output = baseProd * filledJobs * bonus * efficiency (level ignored)', () => {
    // 2 * 10 * 1.5 * 0.8 = 24 (level 3 is ignored)
    expect(calcDivisionOutput(2, 3, 10, 1.5, 0.8)).toBe(24)
  })

  it('scales linearly with filledJobs', () => {
    const j5 = calcDivisionOutput(5, 1, 5, 1.0, 1.0)
    const j10 = calcDivisionOutput(5, 1, 10, 1.0, 1.0)
    expect(j10).toBe(j5 * 2)
  })

  it('level does not affect output (only determines job count)', () => {
    const lv1 = calcDivisionOutput(5, 1, 10, 1.0, 1.0)
    const lv10 = calcDivisionOutput(5, 10, 10, 1.0, 1.0)
    expect(lv1).toBe(lv10) // same output, level irrelevant
  })

  it('applies planet type bonus', () => {
    const base = calcDivisionOutput(5, 1, 10, 1.0, 1.0)
    const boosted = calcDivisionOutput(5, 1, 10, 1.5, 1.0)
    expect(boosted).toBeCloseTo(base * 1.5)
  })

  it('applies efficiency modifier', () => {
    const full = calcDivisionOutput(5, 1, 10, 1.0, 1.0)
    const partial = calcDivisionOutput(5, 1, 10, 1.0, 0.25)
    expect(partial).toBeCloseTo(full * 0.25)
  })
})

// ── calcDivisionUpgradeCost ──

describe('calcDivisionUpgradeCost', () => {
  it('returns baseCost at level 0', () => {
    expect(calcDivisionUpgradeCost(100, 1.5, 0)).toBe(100)
  })

  it('scales geometrically with level', () => {
    // baseCost=100, mult=1.5, level=2 → floor(100 * 1.5^2) = floor(225) = 225
    expect(calcDivisionUpgradeCost(100, 1.5, 2)).toBe(225)
  })

  it('floors the result', () => {
    // 10 * 1.3^1 = 13.0 → 13
    expect(calcDivisionUpgradeCost(10, 1.3, 1)).toBe(13)
    // 10 * 1.3^2 = 16.9 → 16
    expect(calcDivisionUpgradeCost(10, 1.3, 2)).toBe(16)
  })

  it('each subsequent level costs more than the previous', () => {
    const costs = [0, 1, 2, 3, 4, 5].map(l => calcDivisionUpgradeCost(50, 1.4, l))
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThan(costs[i - 1])
    }
  })
})

// ── calcPopDistribution ──

// Helper to create division slot objects for tests
function div(type: string | null, level: number = 5) {
  return { type, level }
}

describe('calcPopDistribution', () => {
  it('returns all zeros when all slots are empty', () => {
    const result = calcPopDistribution(10, [div(null), div(null), div(null)], 'balanced')
    expect(result).toEqual([0, 0, 0])
  })

  it('returns all zeros when only administrative divisions exist', () => {
    const result = calcPopDistribution(10, [div('administrative', 3), div('administrative', 2)], 'balanced')
    expect(result).toEqual([0, 0])
  })

  it('balanced policy round-robins pops across jobs', () => {
    // 3 divisions each with 5 jobs = 15 total jobs, 9 pops → 3 each
    const result = calcPopDistribution(9, [div('mining', 5), div('industrial', 5), div('commerce', 5)], 'balanced')
    expect(result).toEqual([3, 3, 3])
  })

  it('pops capped at job count per division', () => {
    // Mining has 2 jobs, Industrial has 2 jobs, 10 pops → 2+2=4 filled, 6 unemployed
    const result = calcPopDistribution(10, [div('mining', 2), div('industrial', 2)], 'balanced')
    expect(result).toEqual([2, 2])
  })

  it('skips null and administrative slots', () => {
    const result = calcPopDistribution(6, [div('mining', 5), div(null), div('administrative', 3), div('commerce', 5)], 'balanced')
    expect(result[1]).toBe(0)
    expect(result[2]).toBe(0)
    expect(result[0] + result[3]).toBe(6)
  })

  it('prioritize_production fills mining first', () => {
    // Mining has 5 jobs, Industrial has 5 jobs, 7 pops → mining gets 5, industrial gets 2
    const result = calcPopDistribution(7, [div('mining', 5), div('industrial', 5)], 'prioritize_production')
    expect(result[0]).toBe(5) // mining filled first
    expect(result[1]).toBe(2) // remainder
  })

  it('prioritize_cg fills industrial first', () => {
    const result = calcPopDistribution(7, [div('mining', 5), div('industrial', 5)], 'prioritize_cg')
    expect(result[0]).toBe(2)
    expect(result[1]).toBe(5)
  })

  it('prioritize_trade fills commerce first', () => {
    const result = calcPopDistribution(7, [div('mining', 5), div('commerce', 5)], 'prioritize_trade')
    expect(result[0]).toBe(2)
    expect(result[1]).toBe(5)
  })

  it('falls back to balanced when priority type is not present', () => {
    const result = calcPopDistribution(6, [div('mining', 5), div('industrial', 5)], 'prioritize_trade')
    expect(result[0]).toBe(3)
    expect(result[1]).toBe(3)
  })

  it('total filled never exceeds totalPops', () => {
    const result = calcPopDistribution(3, [div('mining', 10), div('industrial', 10), div('commerce', 10)], 'balanced')
    const sum = result.reduce((a, b) => a + b, 0)
    expect(sum).toBe(3)
  })

  it('total filled never exceeds total jobs', () => {
    const result = calcPopDistribution(100, [div('mining', 2), div('industrial', 3)], 'balanced')
    const sum = result.reduce((a, b) => a + b, 0)
    expect(sum).toBe(5) // only 5 jobs available
  })
})

// ── calcJobCount ──

describe('calcJobCount', () => {
  it('returns level as job count', () => {
    expect(calcJobCount(1)).toBe(1)
    expect(calcJobCount(5)).toBe(5)
    expect(calcJobCount(10)).toBe(10)
  })
})

// ── calcCgPerJob ──

describe('calcCgPerJob', () => {
  it('scales with level: cgPerPop * (1 + 0.5 * level)', () => {
    expect(calcCgPerJob(0.25, 1)).toBeCloseTo(0.375)  // 0.25 * 1.5
    expect(calcCgPerJob(0.25, 5)).toBeCloseTo(0.875)  // 0.25 * 3.5
    expect(calcCgPerJob(0.25, 10)).toBeCloseTo(1.5)   // 0.25 * 6.0
  })

  it('higher levels consume more CG', () => {
    expect(calcCgPerJob(0.25, 10)).toBeGreaterThan(calcCgPerJob(0.25, 5))
    expect(calcCgPerJob(0.25, 5)).toBeGreaterThan(calcCgPerJob(0.25, 1))
  })
})

// ── calcTransferCost ──

describe('calcTransferCost', () => {
  it('returns baseCost * popCount for same tier (tierDiff=0)', () => {
    // floor(5 * 10 * 1.5^0) = 50
    expect(calcTransferCost(5, 10, 1.5, 0)).toBe(50)
  })

  it('scales with pop count', () => {
    const cost1 = calcTransferCost(1, 10, 1.5, 1)
    const cost5 = calcTransferCost(5, 10, 1.5, 1)
    expect(cost5).toBe(cost1 * 5)
  })

  it('scales geometrically with tier difference', () => {
    // floor(1 * 100 * 2^1) = 200
    expect(calcTransferCost(1, 100, 2, 1)).toBe(200)
    // floor(1 * 100 * 2^2) = 400
    expect(calcTransferCost(1, 100, 2, 2)).toBe(400)
    // floor(1 * 100 * 2^3) = 800
    expect(calcTransferCost(1, 100, 2, 3)).toBe(800)
  })

  it('floors the result', () => {
    // floor(3 * 7 * 1.3^1) = floor(27.3) = 27
    expect(calcTransferCost(3, 7, 1.3, 1)).toBe(27)
  })

  it('transferring more pops always costs more', () => {
    const small = calcTransferCost(2, 50, 1.5, 1)
    const large = calcTransferCost(10, 50, 1.5, 1)
    expect(large).toBeGreaterThan(small)
  })

  it('higher tier difference always costs more', () => {
    const nearby = calcTransferCost(1, 50, 1.5, 1)
    const distant = calcTransferCost(1, 50, 1.5, 3)
    expect(distant).toBeGreaterThan(nearby)
  })
})
