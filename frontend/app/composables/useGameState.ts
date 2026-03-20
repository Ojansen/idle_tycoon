import type { GameState, TraitStat } from '~/types/game'

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
    clickUpgradesBought: [],
    influence: 0,
    prestigeCount: 0,
    prestigeUpgradesBought: [],
    prestigeRepeatables: {},
    kardashevHighWaterMark: 0,
    stocks: {},
    casinoStats: { totalWagered: 0, totalWon: 0, gamesPlayed: 0 },
    ascensionPerks: [],
    achievements: [],
    completedResearch: [],
    activeResearch: null,
    megastructures: {},
    lastSaveTimestamp: now,
    createdAt: now
  }
}

export function useGameState() {
  const state = useState<GameState>('gameState', createDefaultState)
  const { buildings, kardashevLevels, prestigeUpgrades, repeatablePrestigeUpgrades } = useGameConfig()

  function getPrestigeMultiplier(type: 'creditsMultiplier' | 'energyMultiplier' | 'clickMultiplier'): number {
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
    return Math.pow(2, Math.floor(owned / 25))
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
    return rawPopClicks.value * getTraitMultiplier('popMultiplier') * getAscensionMultiplier('popMultiplier') * getRepeatableMultiplier('popMultiplier') * getResearchMult('popMultiplier')
  })

  const effectiveClickPower = computed(() => {
    if (!state.value) return 1
    const prestige = getPrestigeMultiplier('clickMultiplier')
    const trait = getTraitMultiplier('clickMultiplier')
    const ascension = getAscensionMultiplier('clickMultiplier')
    const repeatable = getRepeatableMultiplier('clickMultiplier')
    const research = getResearchMult('clickMultiplier')
    const baseClick = (state.value.clickPower ?? 1) * prestige * trait * ascension * repeatable * research
    // Pops boost clicks with diminishing returns (sqrt scale)
    const popBoost = 1 + Math.sqrt(autoclickPerSecond.value)
    return Math.floor(baseClick * popBoost)
  })

  // Dividends only from fully owned subsidiaries (100% shares)
  const dividendIncome = computed(() => {
    const { companies } = useStockMarket()
    let income = 0
    for (const company of companies) {
      const shares = state.value.stocks[company.id] || 0
      if (shares < company.totalShares) continue
      income += company.dividendRate * company.totalShares
    }
    return income
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
    // Add stock dividend income
    base += dividendIncome.value
    const prestige = getPrestigeMultiplier('creditsMultiplier')
    const trait = getTraitMultiplier('creditsMultiplier')
    const ascension = getAscensionMultiplier('creditsMultiplier')
    const repeatable = getRepeatableMultiplier('creditsMultiplier')
    const research = getResearchMult('creditsMultiplier')
    return base * prestige * trait * ascension * repeatable * research
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
    return base * prestige * trait * ascension * repeatable * research
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
    const traitMult = getTraitMultiplier('buildingCostMultiplier')
    const ascensionMult = getAscensionMultiplier('buildingCostMultiplier')
    const repeatableMult = getRepeatableMultiplier('buildingCostMultiplier')
    const researchMult = getResearchMult('buildingCostMultiplier')
    let total = 0
    for (let i = 0; i < quantity; i++) {
      total += Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned + i) * traitMult * ascensionMult * repeatableMult * researchMult)
    }
    return total
  }

  function tick() {
    const dt = 0.1
    const creditGain = creditsPerSecond.value * dt
    const energyGain = energyPerSecond.value * dt

    state.value.credits += creditGain
    state.value.totalCreditsEarned += creditGain
    state.value.energy += energyGain
    state.value.totalEnergyEarned += energyGain

    // Research & megastructure progress
    const { tickResearch, tickMegastructures } = useResearchActions()
    tickResearch(dt)
    tickMegastructures(dt)

    if (kardashevLevel.value > state.value.kardashevHighWaterMark) {
      state.value.kardashevHighWaterMark = kardashevLevel.value
    }
  }

  function loadState(saved: GameState) {
    saved.clickUpgradesBought ??= []
    saved.clickPower ??= 1
    saved.prestigeUpgradesBought ??= []
    saved.prestigeRepeatables ??= {}
    saved.stocks ??= {}
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
    state.value = saved
  }

  return {
    state,
    creditsPerSecond,
    energyPerSecond,
    autoclickPerSecond,
    dividendIncome,
    kardashevLevel,
    nextKardashevLevel,
    effectiveClickPower,
    getPrestigeMultiplier,
    getTraitMultiplier,
    getRepeatableMultiplier,
    getBuildingMultiplier,
    getBuildingCost,
    tick,
    loadState
  }
}
