import type {
  PlanetTypeDefinition,
  PlanetSizeDefinition,
  PlanetTraitDefinition,
  PlanetDefinition,
  DivisionDefinition,
} from '~/types/planet'

// ── Planet Type Bonuses ──

const planetTypes: PlanetTypeDefinition[] = [
  {
    type: 'garden', name: 'Garden World', color: 'emerald', icon: 'i-lucide-trees',
    bonuses: { credits: 1.0, cg: 1.25, popGrowth: 1.5 },
    maintenanceModifier: 1.0,
  },
  {
    type: 'volcanic', name: 'Volcanic World', color: 'red', icon: 'i-lucide-flame',
    bonuses: { credits: 1.5, cg: 1.0, popGrowth: 0.75 },
    maintenanceModifier: 1.0,
  },
  {
    type: 'ocean', name: 'Ocean World', color: 'blue', icon: 'i-lucide-waves',
    bonuses: { credits: 1.25, cg: 1.25, popGrowth: 1.25 },
    maintenanceModifier: 1.0,
  },
  {
    type: 'desert', name: 'Desert World', color: 'amber', icon: 'i-lucide-sun',
    bonuses: { credits: 1.5, cg: 0.75, popGrowth: 0.75 },
    maintenanceModifier: 1.0,
  },
  {
    type: 'ice', name: 'Ice World', color: 'cyan', icon: 'i-lucide-snowflake',
    bonuses: { credits: 1.25, cg: 1.0, popGrowth: 1.0 },
    maintenanceModifier: 0.7,
  },
  {
    type: 'barren', name: 'Barren World', color: 'zinc', icon: 'i-lucide-mountain',
    bonuses: { credits: 0.75, cg: 1.0, popGrowth: 0.5 },
    maintenanceModifier: 0.5,
  },
  {
    type: 'gaia', name: 'Gaia World', color: 'yellow', icon: 'i-lucide-sparkles',
    bonuses: { credits: 1.25, cg: 1.25, popGrowth: 2.0 },
    maintenanceModifier: 1.3,
  },
]

// ── Planet Sizes ──

const planetSizes: PlanetSizeDefinition[] = [
  { size: 'small', slots: 3, baseHousing: 2, maxLevels: 15 },
  { size: 'medium', slots: 4, baseHousing: 3, maxLevels: 25 },
  { size: 'large', slots: 6, baseHousing: 4, maxLevels: 40 },
]

// ── Planet Traits ──

const planetTraits: PlanetTraitDefinition[] = [
  { id: 'mineral_rich', name: 'Mineral Rich', description: '+25% ₢ production', effects: [{ stat: 'credits', value: 1.25 }] },
  { id: 'lush_biosphere', name: 'Lush Biosphere', description: '+25% pop growth', effects: [{ stat: 'popGrowth', value: 1.25 }] },
  { id: 'hostile_atmosphere', name: 'Hostile Atmosphere', description: '+50% maintenance', effects: [{ stat: 'maintenance', value: 1.5 }] },
  { id: 'trade_hub', name: 'Natural Trade Hub', description: '+25% trade value', effects: [{ stat: 'trade', value: 1.25 }] },
  { id: 'industrial_deposits', name: 'Industrial Deposits', description: '+25% CG production', effects: [{ stat: 'cg', value: 1.25 }] },
  { id: 'low_gravity', name: 'Low Gravity', description: '-20% maintenance', effects: [{ stat: 'maintenance', value: 0.8 }] },
  { id: 'extreme_weather', name: 'Extreme Weather', description: '-25% pop growth', effects: [{ stat: 'popGrowth', value: 0.75 }] },
  { id: 'ancient_ruins', name: 'Ancient Ruins', description: '+15% ₢ and trade', effects: [{ stat: 'credits', value: 1.15 }, { stat: 'trade', value: 1.15 }] },
]

// ── Division Definitions ──

const divisions: DivisionDefinition[] = [
  {
    type: 'mining', name: 'Mining Division', icon: 'i-lucide-pickaxe', color: 'amber',
    description: 'Extracts energy credits from planetary resources',
    resource: 'credits',
    baseProd: 10.0,          // ₢/s per filled job (level = more jobs, not more power)
    baseUpgradeCost: 50,
    costMultiplier: 1.5,
  },
  {
    type: 'industrial', name: 'Industrial Division', icon: 'i-lucide-factory', color: 'emerald',
    description: 'Manufactures consumer goods to sustain your population',
    resource: 'consumer_goods',
    baseProd: 4.0,           // CG/s per filled job — must outpace CG consumption per job
    baseUpgradeCost: 60,
    costMultiplier: 1.5,
  },
  {
    type: 'commerce', name: 'Commerce Division', icon: 'i-lucide-handshake', color: 'violet',
    description: 'Generates trade value from population economic activity',
    resource: 'trade',
    baseProd: 6.0,           // trade value/s per filled job
    baseUpgradeCost: 75,
    costMultiplier: 1.5,
  },
  {
    type: 'administrative', name: 'Administrative Division', icon: 'i-lucide-building-2', color: 'sky',
    description: 'Provides housing infrastructure for your population',
    resource: 'housing',
    baseProd: 3,             // housing capacity per level
    baseUpgradeCost: 40,
    costMultiplier: 1.4,
  },
  {
    type: 'research', name: 'Research Division', icon: 'i-lucide-flask-conical', color: 'purple',
    description: 'Produces research points to advance technology',
    resource: 'research',
    baseProd: 2.0,
    baseUpgradeCost: 80,
    costMultiplier: 1.5,
  },
]

// ── Planet Definitions (per Kardashev tier) ──

const planets: PlanetDefinition[] = [
  // Type 0: Homeworld (free, given at start)
  { id: 'homeworld', name: 'Terra Nova', type: 'garden', size: 'medium', traits: [], unlockKardashev: 0, colonyCost: 0, maintenanceCost: 0 },

  // Type I: +2 planets (3 total)
  { id: 'vulcan_prime', name: 'Vulcan Prime', type: 'volcanic', size: 'medium', traits: ['mineral_rich'], unlockKardashev: 1, colonyCost: 1e5, maintenanceCost: 50 },
  { id: 'oceanus', name: 'Oceanus', type: 'ocean', size: 'small', traits: ['trade_hub'], unlockKardashev: 1, colonyCost: 1.5e5, maintenanceCost: 60 },

  // Type II: +3 planets (6 total)
  { id: 'thermia', name: 'Thermia', type: 'desert', size: 'large', traits: ['mineral_rich'], unlockKardashev: 2, colonyCost: 1e9, maintenanceCost: 5e4 },
  { id: 'cryos', name: 'Cryos Station', type: 'ice', size: 'medium', traits: ['low_gravity'], unlockKardashev: 2, colonyCost: 8e8, maintenanceCost: 3e4 },
  { id: 'kronos', name: 'Kronos', type: 'volcanic', size: 'large', traits: ['industrial_deposits'], unlockKardashev: 2, colonyCost: 1.5e9, maintenanceCost: 7e4 },

  // Type III: +4 planets (10 total)
  { id: 'eden', name: 'New Eden', type: 'garden', size: 'large', traits: ['lush_biosphere'], unlockKardashev: 3, colonyCost: 1e15, maintenanceCost: 5e10 },
  { id: 'tartarus', name: 'Tartarus', type: 'barren', size: 'large', traits: ['mineral_rich', 'hostile_atmosphere'], unlockKardashev: 3, colonyCost: 5e14, maintenanceCost: 2e10 },
  { id: 'nexus', name: 'Nexus Prime', type: 'ocean', size: 'medium', traits: ['trade_hub', 'ancient_ruins'], unlockKardashev: 3, colonyCost: 1.5e15, maintenanceCost: 8e10 },
  { id: 'inferno', name: 'Inferno', type: 'volcanic', size: 'medium', traits: ['extreme_weather', 'mineral_rich'], unlockKardashev: 3, colonyCost: 8e14, maintenanceCost: 4e10 },

  // Type IV: +3 planets (13 total)
  { id: 'elysium', name: 'Elysium', type: 'gaia', size: 'large', traits: ['lush_biosphere'], unlockKardashev: 4, colonyCost: 1e24, maintenanceCost: 5e19 },
  { id: 'void_terminus', name: 'Void Terminus', type: 'barren', size: 'large', traits: ['ancient_ruins', 'low_gravity'], unlockKardashev: 4, colonyCost: 5e23, maintenanceCost: 2e19 },
  { id: 'aurora', name: 'Aurora', type: 'ice', size: 'large', traits: ['industrial_deposits', 'trade_hub'], unlockKardashev: 4, colonyCost: 8e23, maintenanceCost: 3e19 },

  // Type V: +2 planets (15 total)
  { id: 'genesis', name: 'Genesis', type: 'gaia', size: 'large', traits: ['lush_biosphere', 'trade_hub'], unlockKardashev: 5, colonyCost: 1e33, maintenanceCost: 5e28 },
  { id: 'convergence', name: 'The Convergence', type: 'ocean', size: 'large', traits: ['ancient_ruins', 'mineral_rich'], unlockKardashev: 5, colonyCost: 5e33, maintenanceCost: 2e29 },
]

// ── Reassignment cost (₢ to change a division's type) ──

export const DIVISION_REASSIGN_COST_MULT = 0.5 // fraction of upgrade cost at current level
export const MAINTENANCE_PER_DIVISION_LEVEL = 2 // ₢/s per division level (empty or filled)
export const MAX_DIVISION_LEVEL = 10             // max level per division

// ── Pop growth constants ──

export const BASE_POP_GROWTH = 0.05       // pops/s base growth rate
export const HOUSING_PER_ADMIN_LEVEL = 3   // each Admin division level adds this much housing

// ── Pop transfer cost ──

export const POP_TRANSFER_BASE_COST = 500  // ₢ per pop transferred
export const POP_TRANSFER_TIER_SCALE = 2.0 // multiplied by tier difference

// ── CG consumption per pop ──

export const CG_PER_POP = 0.25            // CG/s consumed per pop

// ── Composable ──

export function usePlanetConfig() {
  function getPlanetDef(id: string) {
    return planets.find(p => p.id === id)
  }

  return {
    planetTypes: readonly(planetTypes),
    planetSizes: readonly(planetSizes),
    planetTraits: readonly(planetTraits),
    divisions: readonly(divisions),
    planets: readonly(planets),

    getPlanetType: (type: string) => planetTypes.find(t => t.type === type),
    getPlanetSize: (size: string) => planetSizes.find(s => s.size === size),
    getPlanetTrait: (id: string) => planetTraits.find(t => t.id === id),
    getDivision: (type: string) => divisions.find(d => d.type === type),
    getPlanetDef,
  }
}
