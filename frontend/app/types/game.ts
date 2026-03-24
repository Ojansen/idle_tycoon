import type { PlanetType } from '~/types/planet'
import type { StarSystemState } from '~/types/galaxy'

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
  | { type: 'cgMultiplier'; value: number }
  | { type: 'workerOutputMultiplier'; value: number }
  | { type: 'divisionCostMultiplier'; value: number }
  | { type: 'maintenanceReduction'; value: number }
  | { type: 'popGrowthMultiplier'; value: number }
  | { type: 'tradeMultiplier'; value: number }
  | { type: 'allProductionMultiplier'; value: number }
  | { type: 'quickStart'; divisionLevels: number }
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

export interface KardashevLevel {
  level: number
  name: string
  description: string
  creditsPerSecond: number
}

export type TraitStat = 'creditsMultiplier' | 'cgMultiplier' | 'workerOutputMultiplier' | 'divisionCostMultiplier' | 'maintenanceReduction' | 'popGrowthMultiplier' | 'tradeMultiplier' | 'allProductionMultiplier'

export type TradePolicy = 'wealth_creation' | 'consumer_benefits'

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

export type ResearchBranch = 'industry' | 'energy' | 'society' | 'exotic'

export type ResearchEffect =
  | { type: 'multiplier'; stat: TraitStat; value: number }
  | { type: 'unlockMegastructure'; megastructureId: string }
  | { type: 'researchSpeed'; value: number }
  | { type: 'maintenanceReduction'; value: number }

export interface ResearchDefinition {
  id: string
  name: string
  description: string
  icon: string
  branch: ResearchBranch
  tier: number
  creditsCost: number
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
  baseCreditsCost: number
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
  buildTimePerStage: number
  requiredResearch: readonly string[]
  unlockKardashev: number
  effects: readonly ResearchEffect[]
  creditsUpkeepPerSecond?: number
  cgUpkeepPerSecond?: number
}

export interface ResearchProgress {
  techId: string
  elapsed: number
  creditsSpent: number
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
  homeworldType: PlanetType
  credits: number
  totalCreditsEarned: number
  influence: number
  systems: StarSystemState[]
  lastDiscoveryTime: number
  prestigeCount: number
  prestigeUpgradesBought: string[]
  prestigeRepeatables: Record<string, number>
  kardashevHighWaterMark: number
  ascensionPerks: { stat: TraitStat; value: number }[]
  achievements: string[]
  completedResearch: string[]
  activeResearch: ResearchProgress | null
  megastructures: Record<string, MegastructureProgress>
  totalPlayTime: number
  runPlayTime: number
  lastSaveTimestamp: number
  createdAt: number
  victoryAchieved: boolean
  repeatableResearch: Record<string, number>
  productionHistory: { credits: number }[]
  tradePolicy: TradePolicy
}
