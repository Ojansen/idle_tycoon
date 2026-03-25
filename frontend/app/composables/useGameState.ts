import type { GameState, TraitStat, TradePolicy } from '~/types/game'
import { KARDASHEV_MILESTONE_GRANTS } from '~/utils/gameMath'
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
    influence: 0,
    systems: createGalaxy(now), // seed from timestamp — unique galaxy per game
    lastDiscoveryTime: now,
    prestigeCount: 0,
    prestigeUpgradesBought: [],
    prestigeRepeatables: {},
    kardashevHighWaterMark: 0,
    ascensionPerks: [],
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
  const { kardashevLevels, prestigeUpgrades, repeatablePrestigeUpgrades } = useGameConfig()

  function getPrestigeMultiplier(type: 'creditsMultiplier' | 'workerOutputMultiplier' | 'cgMultiplier' | 'tradeMultiplier' | 'popGrowthMultiplier' | 'divisionCostMultiplier' | 'maintenanceReduction' | 'researchMultiplier'): number {
    let multiplier = 1
    for (const upgradeId of state.value.prestigeUpgradesBought) {
      const upgrade = prestigeUpgrades.find(u => u.id === upgradeId)
      if (upgrade && upgrade.effect.type === type) {
        multiplier *= upgrade.effect.value
      }
    }
    return multiplier
  }

  function getRepeatableMultiplier(stat: TraitStat): number {
    let multiplier = 1
    for (const upgrade of repeatablePrestigeUpgrades) {
      if (upgrade.effect.type !== stat) continue
      const level = state.value.prestigeRepeatables[upgrade.id] || 0
      if (level > 0) {
        multiplier *= Math.pow(upgrade.effect.valuePerLevel, level)
      }
    }
    return multiplier
  }

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

  function getAscensionMultiplier(stat: TraitStat): number {
    const { getAscensionMultiplier: getAscMult } = useAscensionPerks()
    return getAscMult(stat)
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

  // Kardashev now tracks gross ₢/s production rate
  const kardashevLevel = computed(() => {
    const cps = creditsPerSecond.value
    let level = 0
    for (const k of kardashevLevels) {
      if (cps >= k.creditsPerSecond) level = k.level
    }
    return level
  })

  const nextKardashevLevel = computed(() => {
    const current = kardashevLevel.value
    return kardashevLevels.find(k => k.level === current + 1) ?? null
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

    if (kardashevLevel.value > state.value.kardashevHighWaterMark) {
      for (let lvl = state.value.kardashevHighWaterMark + 1; lvl <= kardashevLevel.value; lvl++) {
        const grant = KARDASHEV_MILESTONE_GRANTS[lvl]
        if (grant) state.value.influence += grant
      }
      state.value.kardashevHighWaterMark = kardashevLevel.value
    }
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
      fresh.influence = saved.influence ?? 0
      fresh.prestigeCount = saved.prestigeCount ?? 0
      fresh.prestigeUpgradesBought = saved.prestigeUpgradesBought ?? []
      fresh.prestigeRepeatables = saved.prestigeRepeatables ?? {}
      fresh.kardashevHighWaterMark = saved.kardashevHighWaterMark ?? 0
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
    saved.prestigeUpgradesBought ??= []
    saved.prestigeRepeatables ??= {}
    saved.setupComplete ??= false
    saved.companyName ??= ''
    saved.companyDescription ??= ''
    saved.companyTraits ??= []
    saved.homeworldType ??= 'garden'
    saved.ascensionPerks ??= []
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
    kardashevLevel,
    nextKardashevLevel,
    getPrestigeMultiplier,
    getTraitMultiplier,
    getRepeatableMultiplier,
    getResearchMult,
    tick,
    loadState
  }
}
