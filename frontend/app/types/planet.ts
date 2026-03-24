// ── Planet Types ──

export type PlanetType = 'volcanic' | 'garden' | 'ocean' | 'desert' | 'ice' | 'barren' | 'gaia'
export type PlanetSize = 'small' | 'medium' | 'large'
export type DivisionType = 'mining' | 'industrial' | 'commerce' | 'administrative'
export type PlanetPolicy = 'balanced' | 'prioritize_production' | 'prioritize_cg' | 'prioritize_trade'

// ── Planet Type Definitions (static bonuses per planet type) ──

export interface PlanetTypeDefinition {
  type: PlanetType
  name: string
  color: string       // tailwind color class stem (e.g. 'amber' → text-amber-400)
  icon: string        // lucide icon class
  bonuses: {
    credits: number   // multiplier on ₢ production (1.0 = no bonus)
    cg: number        // multiplier on CG production
    popGrowth: number // multiplier on pop growth rate
  }
  maintenanceModifier: number // 1.0 = normal, 0.7 = cheap, 1.3 = expensive
}

// ── Planet Size Definitions ──

export interface PlanetSizeDefinition {
  size: PlanetSize
  slots: number       // division slots available
  baseHousing: number // base pop capacity before Admin divisions
  maxLevels: number   // max total division levels across all slots
}

// ── Planet Trait ──

export interface PlanetTraitDefinition {
  id: string
  name: string
  description: string
  effects: { stat: 'credits' | 'cg' | 'popGrowth' | 'maintenance' | 'trade'; value: number }[]
}

// ── Planet Definition (a specific planet that can be colonized) ──

export interface PlanetDefinition {
  id: string
  name: string
  type: PlanetType
  size: PlanetSize
  traits: string[]           // trait IDs
  unlockKardashev: number
  colonyCost: number         // ₢ cost to colonize
  maintenanceCost: number    // base ₢/s upkeep
}

// ── Division Definition (static config for each division type) ──

export interface DivisionDefinition {
  type: DivisionType
  name: string
  icon: string
  color: string
  description: string
  resource: 'credits' | 'consumer_goods' | 'trade' | 'housing'
  baseProd: number           // output per pop per level (or housing per level for Admin)
  baseUpgradeCost: number    // ₢ cost for level 1→2
  costMultiplier: number     // geometric scaling per level
}

// ── Runtime State (stored in GameState) ──

export interface DivisionState {
  type: DivisionType
  level: number
}

export interface PlanetState {
  definitionId: string
  name: string
  type: PlanetType
  size: PlanetSize
  traits: string[]
  pops: number
  divisions: (DivisionState | null)[] // length = slot count from planet size
  policy: PlanetPolicy
}
