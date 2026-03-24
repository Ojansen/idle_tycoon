import { calcEmpireSize, calcEmpirePressure } from '~/utils/gameMath'

export function useUpkeep() {
  const { state, creditsPerSecond, cgPerSecond, getRepeatableMultiplier } = useGameState()
  const { megastructures } = useResearchConfig()
  const { totalPops, totalDivisionLevels, totalMaintenance, baseCgConsumption, grossCreditsPerSecond } = usePlanets()

  // Completed megastructure count
  const completedMegastructureCount = computed(() => {
    let count = 0
    for (const progress of Object.values(state.value.megastructures)) {
      if (progress.completed) count++
    }
    return count
  })

  // Composite empire size metric (divisions + megas + pops)
  const empireSize = computed(() =>
    calcEmpireSize(totalDivisionLevels.value, completedMegastructureCount.value, totalPops.value)
  )

  // Empire pressure — large empires face increasing CG demand
  const empirePressure = computed(() => calcEmpirePressure(empireSize.value))

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
    const repeatable = getRepeatableMultiplier('maintenanceReduction')
    const research = getResearchUpkeepReduction()
    return repeatable * research
  }

  // CG production (gross, from planets + stars)
  const effectiveCgProduction = computed(() => {
    const { tradeConversion } = useTrade()
    const { totalStarCg } = useGalaxy()
    return cgPerSecond.value + totalStarCg.value + tradeConversion.value.consumerGoods
  })

  // CG consumption: baseCgConsumption × empirePressure × maintenanceReduction + megastructure CG upkeep
  const totalCgConsumption = computed(() => {
    let consumption = baseCgConsumption.value * empirePressure.value * getFullUpkeepReduction()

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

  // Net ₢/s = (planet production × cgThrottle) + star income + trade - planet maintenance - system maintenance - mega upkeep
  const netCreditsPerSecond = computed(() => {
    const { tradeConversion } = useTrade()
    const { totalStarCredits, totalSystemMaintenance } = useGalaxy()
    return grossCreditsPerSecond.value * cgThrottle.value
      + totalStarCredits.value
      + tradeConversion.value.credits
      - totalMaintenance.value
      - totalSystemMaintenance.value
      - megaCreditsUpkeep.value
    // Can go negative! Empire running at a loss.
  })

  const hasUpkeep = computed(() => {
    return totalCgConsumption.value > 0 || totalMaintenance.value > 0
  })

  return {
    effectiveCgProduction,
    totalCgConsumption,
    cgThrottle,
    netCreditsPerSecond,
    hasUpkeep,
    getFullUpkeepReduction,
    empirePressure,
    empireSize,
    totalMaintenance,
  }
}
