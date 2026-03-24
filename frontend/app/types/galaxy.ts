import type { PlanetState, PlanetType, PlanetSize } from '~/types/planet'

// ── Star Types ──

export type StarType = 'yellow_dwarf' | 'red_giant' | 'blue_supergiant' | 'white_dwarf' | 'neutron_star' | 'binary_system'

export interface StarTypeDefinition {
  type: StarType
  name: string
  color: string       // tailwind color stem
  icon: string        // lucide icon
  baseOutput: { credits: number; cg: number; trade: number; researchSpeed: number }
  maintenanceCost: number // ₢/s per star
  rarity: number      // 0-1, lower = rarer
}

// ── Generated System Contents ──

export interface GeneratedStar {
  type: StarType
  output: { credits: number; cg: number; trade: number; researchSpeed: number }
  maintenanceCost: number
}

export interface GeneratedPlanet {
  type: PlanetType
  size: PlanetSize
  traits: string[]
  colonized: boolean
  colonyCost: number
  name: string
}

// ── System Traits ──

export interface SystemTraitDefinition {
  id: string
  name: string
  description: string
  effects: { stat: 'starOutput' | 'surveyCost' | 'claimCost' | 'maintenance'; value: number }[]
}

// ── Star System State ──

export type SystemStatus = 'undiscovered' | 'surveyed' | 'claimed'

export interface StarSystemState {
  id: string
  seed: number
  tier: number                  // 0-5
  status: SystemStatus
  stars: GeneratedStar[]        // 1-5 stars
  planets: PlanetState[]        // colonized planets
  planetSlots: GeneratedPlanet[] // all planets (colonized or not)
  traits: string[]
  surveyProgress: number        // seconds elapsed
  surveyTime: number            // total seconds needed
  surveyCost: number            // ₢ to start survey
  claimCost: number             // ₢ to claim
  name: string
  discoveredAt: number          // timestamp
}
