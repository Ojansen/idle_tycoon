import type { PlanetType } from '~/types/planet'
import type { StarSystemState } from '~/types/galaxy'

export type TraitStat = 'creditsMultiplier' | 'cgMultiplier' | 'workerOutputMultiplier' | 'divisionCostMultiplier' | 'maintenanceReduction' | 'popGrowthMultiplier' | 'tradeMultiplier' | 'researchMultiplier' | 'allProductionMultiplier'

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
  researchCost: number
  prerequisites: readonly string[]
  effects: readonly ResearchEffect[]
}

export interface RepeatableResearchDefinition {
  id: string
  name: string
  description: string
  icon: string
  branch: ResearchBranch
  baseResearchCost: number
  costScale: number
  effect: { stat: TraitStat; valuePerLevel: number }
}

export interface MegastructureDefinition {
  id: string
  name: string
  description: string
  icon: string
  stages: number
  creditsCostPerStage: number
  requiredResearch: readonly string[]
  effects: readonly ResearchEffect[]
  creditsUpkeepPerSecond?: number
  cgUpkeepPerSecond?: number
}

export interface ResearchProgress {
  techId: string
  rpInvested: number  // RP spent so far
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
  researchPoints: number
  totalCreditsEarned: number
  systems: StarSystemState[]
  lastDiscoveryTime: number
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
