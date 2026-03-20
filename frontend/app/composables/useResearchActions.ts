import type { TraitStat } from '~/types/game'

export type MegastructureState = 'locked' | 'available' | 'building' | 'awaiting_stage' | 'complete'

export function useResearchActions() {
  const { state } = useGameState()
  const { researchTree, megastructures } = useResearchConfig()
  const toast = useToast()

  // ---------------------------------------------------------------------------
  // Research helpers
  // ---------------------------------------------------------------------------

  function isResearchComplete(techId: string): boolean {
    return state.value.completedResearch.includes(techId)
  }

  function isResearchAvailable(techId: string): boolean {
    const def = researchTree.find(r => r.id === techId)
    if (!def) return false
    if (isResearchComplete(techId)) return false
    if (state.value.activeResearch?.techId === techId) return false
    if (def.unlockKardashev > state.value.kardashevHighWaterMark) return false
    return def.prerequisites.every(prereqId => isResearchComplete(prereqId))
  }

  /**
   * Product of all researchSpeed effect values from completed research and
   * completed megastructures. Returns 1 when no speed effects are active.
   */
  function getResearchSpeedMultiplier(): number {
    let multiplier = 1

    for (const techId of state.value.completedResearch) {
      const def = researchTree.find(r => r.id === techId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.type === 'researchSpeed') {
          multiplier *= effect.value
        }
      }
    }

    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.type === 'researchSpeed') {
          multiplier *= effect.value
        }
      }
    }

    return multiplier
  }

  /**
   * Product of all multiplier effects matching stat from completed research and
   * completed megastructures. Used by useGameState for production computeds.
   */
  function getResearchMultiplier(stat: TraitStat): number {
    let multiplier = 1

    for (const techId of state.value.completedResearch) {
      const def = researchTree.find(r => r.id === techId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.type === 'multiplier' && effect.stat === stat) {
          multiplier *= effect.value
        }
      }
    }

    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (!progress.completed) continue
      const def = megastructures.find(m => m.id === megaId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.type === 'multiplier' && effect.stat === stat) {
          multiplier *= effect.value
        }
      }
    }

    return multiplier
  }

  function startResearch(techId: string): boolean {
    if (!isResearchAvailable(techId)) return false
    if (state.value.activeResearch !== null) return false
    if (state.value.energy <= 0) return false

    state.value.activeResearch = { techId, elapsed: 0, energySpent: 0 }
    return true
  }

  function cancelResearch(): void {
    state.value.activeResearch = null
  }

  function tickResearch(dt: number): void {
    const active = state.value.activeResearch
    if (!active) return

    const def = researchTree.find(r => r.id === active.techId)
    if (!def) return

    const drainRate = def.energyCost / def.researchTime
    const drain = drainRate * dt

    if (state.value.energy < drain) return

    state.value.energy -= drain

    const speedMult = getResearchSpeedMultiplier()
    const newElapsed = active.elapsed + dt * speedMult
    const newEnergySpent = active.energySpent + drain

    if (newElapsed >= def.researchTime) {
      state.value.completedResearch.push(active.techId)
      state.value.activeResearch = null
      toast.success({ title: 'Research Complete!', message: def.name })
    } else {
      // Replace object to trigger Vue reactivity
      state.value.activeResearch = {
        techId: active.techId,
        elapsed: newElapsed,
        energySpent: newEnergySpent
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Megastructure helpers
  // ---------------------------------------------------------------------------

  function isMegastructureAvailable(megaId: string): boolean {
    const def = megastructures.find(m => m.id === megaId)
    if (!def) return false
    if (megaId in state.value.megastructures) return false
    if (def.unlockKardashev > state.value.kardashevHighWaterMark) return false
    return def.requiredResearch.every(techId => isResearchComplete(techId))
  }

  function getMegastructureState(megaId: string): MegastructureState {
    const progress = state.value.megastructures[megaId]

    if (!progress) {
      return isMegastructureAvailable(megaId) ? 'available' : 'locked'
    }

    if (progress.completed) return 'complete'
    if (progress.stageElapsed < 0) return 'awaiting_stage'
    return 'building'
  }

  function startMegastructure(megaId: string): boolean {
    if (!isMegastructureAvailable(megaId)) return false

    const def = megastructures.find(m => m.id === megaId)
    if (!def) return false

    if (state.value.credits < def.creditsCostPerStage) return false
    if (state.value.energy < def.energyCostPerStage) return false

    state.value.credits -= def.creditsCostPerStage
    state.value.energy -= def.energyCostPerStage

    state.value.megastructures[megaId] = {
      currentStage: 0,
      stageElapsed: 0,
      completed: false
    }

    return true
  }

  function startNextMegastructureStage(megaId: string): boolean {
    if (getMegastructureState(megaId) !== 'awaiting_stage') return false

    const def = megastructures.find(m => m.id === megaId)
    if (!def) return false

    if (state.value.credits < def.creditsCostPerStage) return false
    if (state.value.energy < def.energyCostPerStage) return false

    state.value.credits -= def.creditsCostPerStage
    state.value.energy -= def.energyCostPerStage

    state.value.megastructures[megaId]!.stageElapsed = 0

    return true
  }

  function tickMegastructures(dt: number): void {
    for (const [megaId, progress] of Object.entries(state.value.megastructures)) {
      if (progress.completed) continue
      if (progress.stageElapsed < 0) continue

      const def = megastructures.find(m => m.id === megaId)
      if (!def) continue

      const newElapsed = progress.stageElapsed + dt

      if (newElapsed >= def.buildTimePerStage) {
        const newStage = progress.currentStage + 1
        if (newStage >= def.stages) {
          state.value.megastructures[megaId] = { currentStage: newStage, stageElapsed: 0, completed: true }
          toast.success({ title: 'Megastructure Complete!', message: def.name })
        } else {
          state.value.megastructures[megaId] = { currentStage: newStage, stageElapsed: -1, completed: false }
        }
      } else {
        state.value.megastructures[megaId] = { ...progress, stageElapsed: newElapsed }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Computeds
  // ---------------------------------------------------------------------------

  const isResearching = computed(() => state.value.activeResearch !== null)

  const activeResearchDef = computed(() => {
    const active = state.value.activeResearch
    if (!active) return null
    return researchTree.find(r => r.id === active.techId) ?? null
  })

  const researchProgress = computed(() => {
    const active = state.value.activeResearch
    if (!active || !activeResearchDef.value) return 0
    return Math.min(active.elapsed / activeResearchDef.value.researchTime, 1)
  })

  const energyDrainPerSecond = computed(() => {
    const active = state.value.activeResearch
    if (!active || !activeResearchDef.value) return 0
    const def = activeResearchDef.value
    return def.energyCost / def.researchTime
  })

  // ---------------------------------------------------------------------------

  return {
    // Research queries
    isResearchComplete,
    isResearchAvailable,
    getResearchSpeedMultiplier,
    getResearchMultiplier,
    // Research mutations
    startResearch,
    cancelResearch,
    tickResearch,
    // Megastructure queries
    isMegastructureAvailable,
    getMegastructureState,
    // Megastructure mutations
    startMegastructure,
    startNextMegastructureStage,
    tickMegastructures,
    // Computeds
    isResearching,
    activeResearchDef,
    researchProgress,
    energyDrainPerSecond
  }
}
