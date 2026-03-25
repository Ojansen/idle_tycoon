import { calcEmpireSize, calcSprawlPenalty, EMPIRE_SIZE_THRESHOLD } from '~/utils/gameMath'

export function useUpkeep() {
  const { state, creditsPerSecond, cgPerSecond } = useGameState()
  const { megastructures } = useResearchConfig()
  const { totalPops, totalDivisionLevels, totalMaintenance, baseCgConsumption, grossCreditsPerSecond } = usePlanets()

  // ── Empire Size (Stellaris-style: weighted sources) ──

  const colonizedPlanetCount = computed(() =>
    (state.value.systems ?? []).reduce((n, s) => n + (s.status === 'claimed' ? s.planets.length : 0), 0)
  )

  const completedMegastructureCount = computed(() => {
    let count = 0
    for (const progress of Object.values(state.value.megastructures)) {
      if (progress.completed) count++
    }
    return count
  })

  const empireSize = computed(() =>
    calcEmpireSize(colonizedPlanetCount.value, completedMegastructureCount.value, totalDivisionLevels.value, totalPops.value)
  )

  const adminCap = computed(() => EMPIRE_SIZE_THRESHOLD)

  const sprawlPenalty = computed(() => calcSprawlPenalty(empireSize.value))

  // ── Upkeep reduction from research/repeatables ──

  function getResearchUpkeepReduction(): number {
    const { researchTree } = useResearchConfig()
    let multiplier = 1
    for (const techId of state.value.completedResearch) {
      const def = researchTree.find(r => r.id === techId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.type === 'maintenanceReduction') {
          multiplier *= effect.value
        }
      }
    }
    return multiplier
  }

  function getFullUpkeepReduction(): number {
    return getResearchUpkeepReduction()
  }

  // ── CG production (gross, from planets + stars) ──

  const effectiveCgProduction = computed(() => {
    const { tradeConversion } = useTrade()
    const { totalStarCg } = useGalaxy()
    return cgPerSecond.value + totalStarCg.value + tradeConversion.value.consumerGoods
  })

  // CG consumption: flat per-job CG + unemployed + mega CG (no empire pressure on CG)
  const totalCgConsumption = computed(() => {
    let consumption = baseCgConsumption.value * getFullUpkeepReduction()

    // Megastructure CG upkeep (completed only)
    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (def?.cgUpkeepPerSecond) {
        consumption += def.cgUpkeepPerSecond
      }
    }

    return consumption
  })

  // CG throttle — if CG production < CG consumption, ₢ production + pop growth throttled
  const cgThrottle = computed(() => {
    const production = effectiveCgProduction.value
    const consumption = totalCgConsumption.value
    if (consumption <= 0) return 1
    if (production >= consumption) return 1
    return Math.max(0.25, production / consumption)
  })

  // Megastructure credits upkeep
  const megaCreditsUpkeep = computed(() => {
    let upkeep = 0
    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (def?.creditsUpkeepPerSecond) {
        upkeep += def.creditsUpkeepPerSecond
      }
    }
    upkeep *= getFullUpkeepReduction()
    return upkeep
  })

  // Total maintenance with sprawl penalty applied
  const totalMaintenanceWithSprawl = computed(() => {
    const { totalSystemMaintenance } = useGalaxy()
    return (totalMaintenance.value + totalSystemMaintenance.value + megaCreditsUpkeep.value) * sprawlPenalty.value
  })

  // Net ₢/s
  const netCreditsPerSecond = computed(() => {
    const { tradeConversion } = useTrade()
    const { totalStarCredits } = useGalaxy()
    return grossCreditsPerSecond.value * cgThrottle.value
      + totalStarCredits.value
      + tradeConversion.value.credits
      - totalMaintenanceWithSprawl.value
  })

  const hasUpkeep = computed(() => {
    return totalCgConsumption.value > 0 || totalMaintenanceWithSprawl.value > 0
  })

  return {
    effectiveCgProduction,
    totalCgConsumption,
    cgThrottle,
    netCreditsPerSecond,
    hasUpkeep,
    getFullUpkeepReduction,
    empireSize,
    adminCap,
    sprawlPenalty,
    totalMaintenanceWithSprawl,
  }
}
