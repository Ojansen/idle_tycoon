import type { GameState, TraitStat, TradePolicy } from '~/types/game'
import { createGalaxy } from '~/composables/useGalaxyGenSystem'

function createDefaultState(): GameState {
  const now = Date.now()
  return {
    setupComplete: false,
    companyName: '',
    companyDescription: '',
    companyTraits: [],
    homeworldType: 'garden',
    credits: 0,
    totalCreditsEarned: 0,
    researchPoints: 0,
    systems: createGalaxy(now % 2147483647), // seed from timestamp, capped to 32-bit
    lastDiscoveryTime: now,
    achievements: [],
    completedResearch: [],
    activeResearch: null,
    megastructures: {},
    totalPlayTime: 0,
    runPlayTime: 0,
    lastSaveTimestamp: now,
    createdAt: now,
    victoryAchieved: false,
    repeatableResearch: {},
    productionHistory: [],
    tradePolicy: 'wealth_creation' as TradePolicy
  }
}

export function useGameState() {
  const state = useState<GameState>('gameState', createDefaultState)

  function getTraitMultiplier(stat: TraitStat): number {
    const { traits } = useTraits()
    let multiplier = 1
    for (const traitId of state.value.companyTraits || []) {
      const trait = traits.find(t => t.id === traitId)
      if (!trait) continue
      if (trait.bonus.stat === stat) multiplier *= trait.bonus.value
      if (trait.malus.stat === stat) multiplier *= trait.malus.value
    }
    return multiplier
  }

  function getResearchMult(stat: TraitStat): number {
    const { getResearchMultiplier } = useResearchActions()
    return getResearchMultiplier(stat)
  }

  // Production from planets (via usePlanets composable)
  const creditsPerSecond: ComputedRef<number> = computed(() => {
    const { grossCreditsPerSecond } = usePlanets()
    return grossCreditsPerSecond.value
  })

  const cgPerSecond: ComputedRef<number> = computed(() => {
    const { grossCgPerSecond } = usePlanets()
    return grossCgPerSecond.value
  })

  function tick() {
    const dt = 0.1
    const { netCreditsPerSecond, cgThrottle } = useUpkeep()
    const { tickPopGrowth, grossRpPerSecond } = usePlanets()
    const creditGain = netCreditsPerSecond.value * dt

    state.value.credits = Math.max(0, state.value.credits + creditGain)
    if (creditGain > 0) state.value.totalCreditsEarned += creditGain
    state.value.totalPlayTime += dt
    state.value.runPlayTime += dt

    // Pop growth (throttled by CG availability)
    const cgAvailability = Math.min(1, cgThrottle.value)
    tickPopGrowth(dt, cgAvailability)

    // Galaxy discovery + survey progress
    const { tickSurveys, totalStarRp } = useGalaxy()
    tickSurveys(dt)

    // Research points accumulation (planets + neutron stars)
    state.value.researchPoints += (grossRpPerSecond.value + totalStarRp.value) * dt

    // Research & megastructure progress (sprawl increases research costs)
    const { sprawlPenalty } = useUpkeep()
    const { tickResearch, tickMegastructures } = useResearchActions()
    tickResearch(dt, grossRpPerSecond.value + totalStarRp.value, sprawlPenalty.value)
    tickMegastructures(dt)
  }

  function loadState(saved: GameState) {
    // Migration: detect old save format (has buildings or planets[] but no systems)
    if (((saved as any).buildings || (saved as any).planets) && !saved.systems) {
      // Old save — reset to new system
      const fresh = createDefaultState()
      fresh.setupComplete = saved.setupComplete ?? false
      fresh.companyName = saved.companyName ?? ''
      fresh.companyDescription = saved.companyDescription ?? ''
      fresh.companyTraits = saved.companyTraits ?? []
      fresh.achievements = saved.achievements ?? []
      fresh.totalPlayTime = saved.totalPlayTime ?? 0
      fresh.createdAt = saved.createdAt ?? Date.now()
      fresh.victoryAchieved = saved.victoryAchieved ?? false
      state.value = fresh
      return
    }

    // New format — apply defaults for any missing fields
    saved.systems ??= createGalaxy(Date.now())
    saved.lastDiscoveryTime ??= Date.now()
    saved.researchPoints ??= 0
    saved.setupComplete ??= false
    saved.companyName ??= ''
    saved.companyDescription ??= ''
    saved.companyTraits ??= []
    saved.homeworldType ??= 'garden'
    saved.achievements ??= []
    saved.completedResearch ??= []
    saved.activeResearch ??= null
    saved.megastructures ??= {}
    saved.totalPlayTime ??= 0
    saved.runPlayTime ??= 0
    saved.victoryAchieved ??= false
    saved.repeatableResearch ??= {}
    saved.productionHistory ??= []
    saved.tradePolicy ??= 'wealth_creation'
    state.value = saved
  }

  return {
    state,
    creditsPerSecond,
    cgPerSecond,
    getTraitMultiplier,
    getResearchMult,
    tick,
    loadState
  }
}
