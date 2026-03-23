export function useUpkeep() {
  const { state, creditsPerSecond, energyPerSecond, cgPerSecond, autoclickPerSecond, getUpkeepMultiplier, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
  const { buildings } = useGameConfig()
  const { megastructures } = useResearchConfig()
  const { getAscensionMultiplier } = useAscensionPerks()
  const { getResearchMultiplier } = useResearchActions()

  // Total buildings owned
  const totalBuildings = computed(() => {
    let total = 0
    for (const count of Object.values(state.value.buildings)) {
      total += count || 0
    }
    return total
  })

  // Completed megastructure count
  const completedMegastructureCount = computed(() => {
    let count = 0
    for (const progress of Object.values(state.value.megastructures)) {
      if (progress.completed) count++
    }
    return count
  })

  // Composite empire size metric
  const empireSize = computed(() =>
    calcEmpireSize(totalBuildings.value, completedMegastructureCount.value, autoclickPerSecond.value)
  )

  function getResearchUpkeepReduction(): number {
    const { researchTree } = useResearchConfig()
    let multiplier = 1

    for (const techId of state.value.completedResearch) {
      const def = researchTree.find(r => r.id === techId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.type === 'upkeepReduction') {
          multiplier *= effect.value
        }
      }
    }

    return multiplier
  }

  function getFullUpkeepReduction(): number {
    const repeatable = getRepeatableMultiplier('upkeepReduction')
    const research = getResearchUpkeepReduction()
    return repeatable * research
  }

  // Get the full production multiplier stack for a given stat
  function getProductionMultiplierStack(stat: 'energyMultiplier' | 'creditsMultiplier'): number {
    return getPrestigeMultiplier(stat)
      * getTraitMultiplier(stat)
      * getAscensionMultiplier(stat)
      * getRepeatableMultiplier(stat)
      * getResearchMultiplier(stat)
  }

  // Step 1: Energy upkeep — only CG buildings consume energy
  const totalEnergyUpkeep = computed(() => {
    let upkeep = 0

    for (const b of buildings) {
      if (b.resource !== 'consumer_goods') continue
      if (!b.energyUpkeep) continue
      const owned = state.value.buildings[b.id] || 0
      if (owned === 0) continue
      upkeep += owned * b.energyUpkeep * getUpkeepMultiplier(b.id)
    }

    // Megastructure energy upkeep (completed only)
    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (def?.energyUpkeepPerSecond) {
        upkeep += def.energyUpkeepPerSecond
      }
    }

    // Scale with energy production multipliers so upkeep stays proportional
    upkeep *= getProductionMultiplierStack('energyMultiplier')
    // Then apply upkeep reduction (research + repeatable)
    upkeep *= getFullUpkeepReduction()
    return upkeep
  })

  // Step 2: Energy throttle — if energy production < energy upkeep, CG production is throttled
  const energyThrottle = computed(() => {
    const gross = energyPerSecond.value
    if (gross <= 0) return 1
    const balance = gross - totalEnergyUpkeep.value
    if (balance >= 0) return 1
    return Math.max(0.25, (gross + balance) / gross)
  })

  // Step 3: CG production (after energy throttle) + trade-converted CG
  const effectiveCgProduction = computed(() => {
    const { tradeConversion } = useTrade()
    return cgPerSecond.value * energyThrottle.value + tradeConversion.value.consumerGoods
  })

  // Empire pressure — large empires face increasing CG demand
  const empirePressure = computed(() => calcEmpirePressure(empireSize.value))

  // Step 4: CG consumption — all non-CG buildings + megastructures consume consumer goods
  const totalCgConsumption = computed(() => {
    let consumption = 0
    for (const b of buildings) {
      if (b.resource === 'consumer_goods') continue
      if (!b.cgUpkeep) continue
      const owned = state.value.buildings[b.id] || 0
      if (owned === 0) continue
      consumption += owned * b.cgUpkeep * getUpkeepMultiplier(b.id)
    }

    // Megastructure CG upkeep (completed only)
    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (def?.cgUpkeepPerSecond) {
        consumption += def.cgUpkeepPerSecond
      }
    }

    // Apply upkeep reduction, then empire scale pressure
    consumption *= getFullUpkeepReduction()
    consumption *= empirePressure.value
    return consumption
  })

  // Step 5: CG throttle — if CG production < CG consumption, credits/pops get throttled
  // Energy is EXEMPT from CG throttle to prevent death spiral
  const cgThrottle = computed(() => {
    const production = effectiveCgProduction.value
    const consumption = totalCgConsumption.value
    if (consumption <= 0) return 1
    if (production >= consumption) return 1
    return Math.max(0.25, production / consumption)
  })

  // Megastructure credits upkeep (separate from CG system)
  const megaCreditsUpkeep = computed(() => {
    let upkeep = 0
    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (def?.creditsUpkeepPerSecond) {
        upkeep += def.creditsUpkeepPerSecond
      }
    }
    upkeep *= getProductionMultiplierStack('creditsMultiplier')
    upkeep *= getFullUpkeepReduction()
    return upkeep
  })

  // Net production values (includes trade conversion)
  const netCreditsPerSecond = computed(() => {
    const { tradeConversion } = useTrade()
    return Math.max(0, creditsPerSecond.value * cgThrottle.value - megaCreditsUpkeep.value + tradeConversion.value.credits)
  })

  const netEnergyPerSecond = computed(() => {
    const { tradeConversion } = useTrade()
    return Math.max(0, energyPerSecond.value - totalEnergyUpkeep.value + tradeConversion.value.energy)
  })

  const hasUpkeep = computed(() => {
    return totalEnergyUpkeep.value > 0 || totalCgConsumption.value > 0
  })

  return {
    totalEnergyUpkeep,
    effectiveCgProduction,
    totalCgConsumption,
    energyThrottle,
    cgThrottle,
    netCreditsPerSecond,
    netEnergyPerSecond,
    hasUpkeep,
    getFullUpkeepReduction,
    empirePressure,
    totalBuildings,
    empireSize
  }
}
