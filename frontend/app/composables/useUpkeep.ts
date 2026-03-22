export function useUpkeep() {
  const { state, creditsPerSecond, energyPerSecond, getBuildingMultiplier, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
  const { buildings } = useGameConfig()
  const { megastructures } = useResearchConfig()
  const { getAscensionMultiplier } = useAscensionPerks()
  const { getResearchMultiplier } = useResearchActions()

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
  // This makes upkeep scale with production so the ratio stays constant
  function getProductionMultiplierStack(stat: 'energyMultiplier' | 'creditsMultiplier'): number {
    return getPrestigeMultiplier(stat)
      * getTraitMultiplier(stat)
      * getAscensionMultiplier(stat)
      * getRepeatableMultiplier(stat)
      * getResearchMultiplier(stat)
  }

  const totalEnergyUpkeep = computed(() => {
    let upkeep = 0

    for (const b of buildings) {
      if (!b.energyUpkeep) continue
      const owned = state.value.buildings[b.id] || 0
      if (owned === 0) continue
      upkeep += owned * b.energyUpkeep * getBuildingMultiplier(b.id)
    }

    // Megastructure upkeep (completed only)
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

  const totalCreditsUpkeep = computed(() => {
    let upkeep = 0

    for (const b of buildings) {
      if (!b.creditsUpkeep) continue
      const owned = state.value.buildings[b.id] || 0
      if (owned === 0) continue
      upkeep += owned * b.creditsUpkeep * getBuildingMultiplier(b.id)
    }

    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (def?.creditsUpkeepPerSecond) {
        upkeep += def.creditsUpkeepPerSecond
      }
    }

    // Scale with credits production multipliers so upkeep stays proportional
    upkeep *= getProductionMultiplierStack('creditsMultiplier')
    // Then apply upkeep reduction (research + repeatable)
    upkeep *= getFullUpkeepReduction()
    return upkeep
  })

  // Energy deficit throttles credit production, credit deficit throttles energy production
  const creditThrottle = computed(() => {
    const gross = energyPerSecond.value
    if (gross <= 0) return 1
    const balance = gross - totalEnergyUpkeep.value
    if (balance >= 0) return 1
    return Math.max(0.5, (gross + balance) / gross)
  })

  const energyThrottle = computed(() => {
    const gross = creditsPerSecond.value
    if (gross <= 0) return 1
    const balance = gross - totalCreditsUpkeep.value
    if (balance >= 0) return 1
    return Math.max(0.5, (gross + balance) / gross)
  })

  const netCreditsPerSecond = computed(() => {
    return Math.max(0, creditsPerSecond.value * creditThrottle.value - totalCreditsUpkeep.value)
  })

  const netEnergyPerSecond = computed(() => {
    return Math.max(0, energyPerSecond.value * energyThrottle.value - totalEnergyUpkeep.value)
  })

  const hasUpkeep = computed(() => {
    return totalEnergyUpkeep.value > 0 || totalCreditsUpkeep.value > 0
  })

  return {
    totalEnergyUpkeep,
    totalCreditsUpkeep,
    creditThrottle,
    energyThrottle,
    netCreditsPerSecond,
    netEnergyPerSecond,
    hasUpkeep,
    getFullUpkeepReduction
  }
}
