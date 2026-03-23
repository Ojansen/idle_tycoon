import type { GameState, TraitStat, TradePolicy } from '~/types/game'
import { calcBuildingMultiplier, calcUpkeepMultiplier, calcClickPower, calcBuildingCost as calcBuildingCostPure, calcMaxBuyable, KARDASHEV_MILESTONE_GRANTS } from '~/utils/gameMath'

function createDefaultState(): GameState {
  const now = Date.now()
  return {
    setupComplete: false,
    companyName: '',
    companyDescription: '',
    companyTraits: [],
    credits: 0,
    energy: 0,
    totalCreditsEarned: 0,
    totalEnergyEarned: 0,
    totalClicks: 0,
    clickPower: 1,
    buildings: {},
    clickUpgradeLevel: 0,
    influence: 0,
    prestigeCount: 0,
    prestigeUpgradesBought: [],
    prestigeRepeatables: {},
    kardashevHighWaterMark: 0,
    casinoStats: { totalWagered: 0, totalWon: 0, gamesPlayed: 0 },
    ascensionPerks: [],
    achievements: [],
    completedResearch: [],
    activeResearch: null,
    megastructures: {},
    totalPlayTime: 0,
    runPlayTime: 0,
    allTimeClicks: 0,
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
  const { buildings, kardashevLevels, prestigeUpgrades, repeatablePrestigeUpgrades } = useGameConfig()

  function getPrestigeMultiplier(type: 'creditsMultiplier' | 'energyMultiplier' | 'clickMultiplier' | 'popMultiplier' | 'buildingCostMultiplier' | 'cgMultiplier' | 'tradeMultiplier'): number {
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

  function getBuildingMultiplier(buildingId: string): number {
    const owned = state.value.buildings[buildingId] || 0
    return calcBuildingMultiplier(owned)
  }

  function getUpkeepMultiplier(buildingId: string): number {
    const owned = state.value.buildings[buildingId] || 0
    return calcUpkeepMultiplier(owned)
  }

  // Raw pop clicks/sec (before trait multiplier, used for click boost)
  const rawPopClicks = computed(() => {
    let clicks = 0
    for (const b of buildings) {
      if (b.resource !== 'autoclick') continue
      const owned = state.value.buildings[b.id] || 0
      clicks += owned * b.baseOutput * getBuildingMultiplier(b.id)
    }
    return clicks
  })

  const autoclickPerSecond = computed(() => {
    return rawPopClicks.value * getPrestigeMultiplier('popMultiplier') * getTraitMultiplier('popMultiplier') * getAscensionMultiplier('popMultiplier') * getRepeatableMultiplier('popMultiplier') * getResearchMult('popMultiplier')
  })

  const effectiveClickPower = computed(() => {
    if (!state.value) return 1
    const prestige = getPrestigeMultiplier('clickMultiplier')
    const trait = getTraitMultiplier('clickMultiplier')
    const ascension = getAscensionMultiplier('clickMultiplier')
    const repeatable = getRepeatableMultiplier('clickMultiplier')
    const research = getResearchMult('clickMultiplier')
    const milestone = calcBuildingMultiplier(state.value.clickUpgradeLevel)
    const baseClick = (state.value.clickPower ?? 1) * milestone * prestige * trait * ascension * repeatable * research
    return calcClickPower(baseClick, autoclickPerSecond.value)
  })

  // Consumer goods production (before energy throttle)
  // Uses dampened multiplier so CG production scales at the same rate as CG consumption
  const cgPerSecond = computed(() => {
    let base = 0
    for (const b of buildings) {
      if (b.resource !== 'consumer_goods') continue
      const owned = state.value.buildings[b.id] || 0
      base += owned * b.baseOutput * getUpkeepMultiplier(b.id)
    }
    const prestige = getPrestigeMultiplier('cgMultiplier')
    const trait = getTraitMultiplier('cgMultiplier')
    const ascension = getAscensionMultiplier('cgMultiplier')
    const repeatable = getRepeatableMultiplier('cgMultiplier')
    const research = getResearchMult('cgMultiplier')
    const allProd = getTraitMultiplier('allProductionMultiplier')
    return base * prestige * trait * ascension * repeatable * research * allProd
  })

  const creditsPerSecond = computed(() => {
    let base = 0
    for (const b of buildings) {
      if (b.resource !== 'credits') continue
      const owned = state.value.buildings[b.id] || 0
      base += owned * b.baseOutput * getBuildingMultiplier(b.id)
    }
    // Pops generate passive credits at their flat rate
    base += autoclickPerSecond.value
    const prestige = getPrestigeMultiplier('creditsMultiplier')
    const trait = getTraitMultiplier('creditsMultiplier')
    const ascension = getAscensionMultiplier('creditsMultiplier')
    const repeatable = getRepeatableMultiplier('creditsMultiplier')
    const research = getResearchMult('creditsMultiplier')
    const allProd = getTraitMultiplier('allProductionMultiplier')
    return base * prestige * trait * ascension * repeatable * research * allProd
  })

  const energyPerSecond = computed(() => {
    let base = 0
    for (const b of buildings) {
      if (b.resource !== 'energy') continue
      const owned = state.value.buildings[b.id] || 0
      base += owned * b.baseOutput * getBuildingMultiplier(b.id)
    }
    const prestige = getPrestigeMultiplier('energyMultiplier')
    const trait = getTraitMultiplier('energyMultiplier')
    const ascension = getAscensionMultiplier('energyMultiplier')
    const repeatable = getRepeatableMultiplier('energyMultiplier')
    const research = getResearchMult('energyMultiplier')
    const allProd = getTraitMultiplier('allProductionMultiplier')
    return base * prestige * trait * ascension * repeatable * research * allProd
  })

  const kardashevLevel = computed(() => {
    const eps = energyPerSecond.value
    let level = 0
    for (const k of kardashevLevels) {
      if (eps >= k.energyPerSecond) level = k.level
    }
    return level
  })

  const nextKardashevLevel = computed(() => {
    const current = kardashevLevel.value
    return kardashevLevels.find(k => k.level === current + 1) ?? null
  })

  function getBuildingCost(buildingId: string, quantity = 1): number {
    const def = buildings.find(b => b.id === buildingId)
    if (!def) return Infinity
    const owned = state.value.buildings[buildingId] || 0
    const combinedMult = getPrestigeMultiplier('buildingCostMultiplier')
      * getTraitMultiplier('buildingCostMultiplier')
      * getAscensionMultiplier('buildingCostMultiplier')
      * getRepeatableMultiplier('buildingCostMultiplier')
      * getResearchMult('buildingCostMultiplier')
    return calcBuildingCostPure(def.baseCost, def.costMultiplier, owned, quantity, combinedMult)
  }

  function getMaxBuyableCount(buildingId: string): number {
    const def = buildings.find(b => b.id === buildingId)
    if (!def) return 0
    const owned = state.value.buildings[buildingId] || 0
    const combinedMult = getPrestigeMultiplier('buildingCostMultiplier')
      * getTraitMultiplier('buildingCostMultiplier')
      * getAscensionMultiplier('buildingCostMultiplier')
      * getRepeatableMultiplier('buildingCostMultiplier')
      * getResearchMult('buildingCostMultiplier')
    return calcMaxBuyable(def.baseCost, def.costMultiplier, owned, state.value.credits, combinedMult)
  }

  function tick() {
    const dt = 0.1
    const { netCreditsPerSecond, netEnergyPerSecond } = useUpkeep()
    const creditGain = netCreditsPerSecond.value * dt
    const energyGain = netEnergyPerSecond.value * dt

    state.value.credits = Math.max(0, state.value.credits + creditGain)
    state.value.energy = Math.max(0, state.value.energy + energyGain)
    if (creditGain > 0) state.value.totalCreditsEarned += creditGain
    if (energyGain > 0) state.value.totalEnergyEarned += energyGain
    state.value.totalPlayTime += dt
    state.value.runPlayTime += dt

    // Research & megastructure progress
    const { tickResearch, tickMegastructures } = useResearchActions()
    tickResearch(dt)
    tickMegastructures(dt)

    if (kardashevLevel.value > state.value.kardashevHighWaterMark) {
      // Grant one-time milestone influence for each new Kardashev level reached
      for (let lvl = state.value.kardashevHighWaterMark + 1; lvl <= kardashevLevel.value; lvl++) {
        const grant = KARDASHEV_MILESTONE_GRANTS[lvl]
        if (grant) state.value.influence += grant
      }
      state.value.kardashevHighWaterMark = kardashevLevel.value
    }
  }

  function loadState(saved: GameState) {
    saved.clickUpgradeLevel ??= 0
    saved.clickPower ??= 1
    saved.prestigeUpgradesBought ??= []
    saved.prestigeRepeatables ??= {}
    saved.casinoStats ??= { totalWagered: 0, totalWon: 0, gamesPlayed: 0 }
    saved.setupComplete ??= false
    saved.companyName ??= ''
    saved.companyDescription ??= ''
    saved.companyTraits ??= []
    saved.ascensionPerks ??= []
    saved.achievements ??= []
    saved.completedResearch ??= []
    saved.activeResearch ??= null
    saved.megastructures ??= {}
    saved.totalPlayTime ??= 0
    saved.runPlayTime ??= 0
    saved.allTimeClicks ??= 0
    saved.victoryAchieved ??= false
    saved.repeatableResearch ??= {}
    saved.productionHistory ??= []
    saved.tradePolicy ??= 'wealth_creation'
    state.value = saved
  }

  return {
    state,
    creditsPerSecond,
    energyPerSecond,
    autoclickPerSecond,
    cgPerSecond,
    kardashevLevel,
    nextKardashevLevel,
    effectiveClickPower,
    getPrestigeMultiplier,
    getTraitMultiplier,
    getRepeatableMultiplier,
    getBuildingMultiplier,
    getUpkeepMultiplier,
    getBuildingCost,
    getMaxBuyableCount,
    tick,
    loadState
  }
}
