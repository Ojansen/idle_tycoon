export interface BuildingDefinition {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  costMultiplier: number
  baseOutput: number
  resource: 'credits' | 'energy' | 'autoclick'
  unlockKardashev: number
  energyUpkeep?: number    // energy/s consumed per building (credit & pop buildings)
  creditsUpkeep?: number   // credits/s consumed per building (energy & pop buildings)
}

export interface PrestigeUpgradeDefinition {
  id: string
  name: string
  description: string
  cost: number
  effect: PrestigeEffect
  requiredKardashev?: number
}

export type PrestigeEffect =
  | { type: 'creditsMultiplier'; value: number }
  | { type: 'energyMultiplier'; value: number }
  | { type: 'clickMultiplier'; value: number }
  | { type: 'popMultiplier'; value: number }
  | { type: 'buildingCostMultiplier'; value: number }
  | { type: 'quickStart'; buildings: Record<string, number> }
  | { type: 'unlockKardashev'; level: number }

export interface RepeatablePrestigeUpgrade {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  costScale: number
  maxLevel: number
  effect: { type: TraitStat; valuePerLevel: number }
}

export interface ClickUpgradeConfig {
  baseCost: number
  costMultiplier: number
  clickPowerAdd: number
}

export interface KardashevLevel {
  level: number
  name: string
  description: string
  energyPerSecond: number
}

export type TraitStat = 'creditsMultiplier' | 'energyMultiplier' | 'clickMultiplier' | 'popMultiplier' | 'buildingCostMultiplier' | 'casinoMultiplier' | 'casinoDisabled' | 'upkeepReduction'

export interface TraitEffect {
  stat: TraitStat
  value: number
  label: string
}

export interface TraitDefinition {
  id: string
  name: string
  description: string
  icon: string
  bonus: TraitEffect
  malus: TraitEffect
}

export interface StockCompany {
  id: string
  name: string
  sector: string
  icon: string
  basePrice: number
  volatility: number
  dividendRate: number
  totalShares: number
}

export interface CasinoStats {
  totalWagered: number
  totalWon: number
  gamesPlayed: number
}

export type ResearchBranch = 'industry' | 'energy' | 'society' | 'exotic'

export type ResearchEffect =
  | { type: 'multiplier'; stat: TraitStat; value: number }
  | { type: 'unlockMegastructure'; megastructureId: string }
  | { type: 'researchSpeed'; value: number }
  | { type: 'upkeepReduction'; value: number }

export interface ResearchDefinition {
  id: string
  name: string
  description: string
  icon: string
  branch: ResearchBranch
  tier: number
  energyCost: number
  researchTime: number
  prerequisites: readonly string[]
  effects: readonly ResearchEffect[]
  unlockKardashev: number
}

export interface RepeatableResearchDefinition {
  id: string
  name: string
  description: string
  icon: string
  branch: ResearchBranch
  baseEnergyCost: number
  costScale: number
  baseResearchTime: number
  timeScale: number
  effect: { stat: TraitStat; valuePerLevel: number }
}

export interface MegastructureDefinition {
  id: string
  name: string
  description: string
  icon: string
  stages: number
  creditsCostPerStage: number
  energyCostPerStage: number
  buildTimePerStage: number
  requiredResearch: readonly string[]
  unlockKardashev: number
  effects: readonly ResearchEffect[]
  energyUpkeepPerSecond?: number
  creditsUpkeepPerSecond?: number
}

export interface ResearchProgress {
  techId: string
  elapsed: number
  energySpent: number
}

export interface MegastructureProgress {
  currentStage: number
  stageElapsed: number
  completed: boolean
}

export interface GameState {
  setupComplete: boolean
  companyName: string
  companyDescription: string
  companyTraits: string[]
  credits: number
  energy: number
  totalCreditsEarned: number
  totalEnergyEarned: number
  totalClicks: number
  clickPower: number
  buildings: Record<string, number>
  clickUpgradeLevel: number
  influence: number
  prestigeCount: number
  prestigeUpgradesBought: string[]
  prestigeRepeatables: Record<string, number>
  kardashevHighWaterMark: number
  stocks: Record<string, number>
  casinoStats: CasinoStats
  ascensionPerks: string[]
  achievements: string[]
  completedResearch: string[]
  activeResearch: ResearchProgress | null
  megastructures: Record<string, MegastructureProgress>
  totalPlayTime: number
  runPlayTime: number
  allTimeClicks: number
  lastSaveTimestamp: number
  createdAt: number
  victoryAchieved: boolean
  repeatableResearch: Record<string, number>
  productionHistory: { credits: number; energy: number }[]
}
