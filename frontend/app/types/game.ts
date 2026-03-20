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
}

export interface PrestigeUpgradeDefinition {
  id: string
  name: string
  description: string
  cost: number
  effect: PrestigeEffect
}

export type PrestigeEffect =
  | { type: 'creditsMultiplier'; value: number }
  | { type: 'energyMultiplier'; value: number }
  | { type: 'clickMultiplier'; value: number }
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

export interface ClickUpgradeDefinition {
  id: string
  name: string
  description: string
  cost: number
  clickPowerAdd: number
}

export interface KardashevLevel {
  level: number
  name: string
  description: string
  energyPerSecond: number
}

export type TraitStat = 'creditsMultiplier' | 'energyMultiplier' | 'clickMultiplier' | 'popMultiplier' | 'buildingCostMultiplier' | 'casinoMultiplier' | 'casinoDisabled'

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

export interface ResearchDefinition {
  id: string
  name: string
  description: string
  icon: string
  branch: ResearchBranch
  tier: number
  energyCost: number
  researchTime: number
  prerequisites: string[]
  effects: ResearchEffect[]
  unlockKardashev: number
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
  requiredResearch: string[]
  unlockKardashev: number
  effects: ResearchEffect[]
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
  clickUpgradesBought: string[]
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
  lastSaveTimestamp: number
  createdAt: number
}
