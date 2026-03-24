import type { StarTypeDefinition, SystemTraitDefinition } from '~/types/galaxy'

// ── Star Type Definitions ──

const starTypes: StarTypeDefinition[] = [
  {
    type: 'yellow_dwarf', name: 'Yellow Dwarf', color: 'yellow', icon: 'i-lucide-sun',
    baseOutput: { credits: 5, cg: 0, trade: 0, researchSpeed: 0 },
    maintenanceCost: 1, rarity: 0.35,
  },
  {
    type: 'red_giant', name: 'Red Giant', color: 'red', icon: 'i-lucide-flame',
    baseOutput: { credits: 12, cg: 0, trade: 0, researchSpeed: 0 },
    maintenanceCost: 4, rarity: 0.20,
  },
  {
    type: 'blue_supergiant', name: 'Blue Supergiant', color: 'blue', icon: 'i-lucide-sparkles',
    baseOutput: { credits: 3, cg: 0, trade: 8, researchSpeed: 0 },
    maintenanceCost: 3, rarity: 0.10,
  },
  {
    type: 'white_dwarf', name: 'White Dwarf', color: 'zinc', icon: 'i-lucide-circle',
    baseOutput: { credits: 0, cg: 4, trade: 0, researchSpeed: 0 },
    maintenanceCost: 1, rarity: 0.15,
  },
  {
    type: 'neutron_star', name: 'Neutron Star', color: 'violet', icon: 'i-lucide-zap',
    baseOutput: { credits: 2, cg: 0, trade: 0, researchSpeed: 0.05 },
    maintenanceCost: 5, rarity: 0.05,
  },
  {
    type: 'binary_system', name: 'Binary System', color: 'amber', icon: 'i-lucide-orbit',
    baseOutput: { credits: 6, cg: 3, trade: 0, researchSpeed: 0 },
    maintenanceCost: 3, rarity: 0.15,
  },
]

// ── System Traits ──

const systemTraits: SystemTraitDefinition[] = [
  { id: 'mineral_rich', name: 'Mineral Rich', description: '+25% star output', effects: [{ stat: 'starOutput', value: 1.25 }] },
  { id: 'nebula', name: 'Nebula', description: '-20% survey cost, +10% star output', effects: [{ stat: 'surveyCost', value: 0.8 }, { stat: 'starOutput', value: 1.1 }] },
  { id: 'pirate_activity', name: 'Pirate Activity', description: '+50% claim cost', effects: [{ stat: 'claimCost', value: 1.5 }] },
  { id: 'ancient_gateway', name: 'Ancient Gateway', description: '-30% claim cost', effects: [{ stat: 'claimCost', value: 0.7 }] },
  { id: 'resource_poor', name: 'Resource Poor', description: '-25% star output, -30% maintenance', effects: [{ stat: 'starOutput', value: 0.75 }, { stat: 'maintenance', value: 0.7 }] },
  { id: 'pristine', name: 'Pristine', description: '+50% star output, +25% maintenance', effects: [{ stat: 'starOutput', value: 1.5 }, { stat: 'maintenance', value: 1.25 }] },
]

// ── Generation Constants ──

export const BASE_DISCOVERY_INTERVAL = 60  // seconds between new system discoveries
export const MAX_UNDISCOVERED = 5          // max unsurveyed systems visible at once
export const BASE_SURVEY_TIME = 15         // seconds to survey a tier 0 system
export const SURVEY_TIME_PER_TIER = 10     // additional seconds per tier
export const BASE_SURVEY_COST = 50         // ₢ to start survey at tier 0
export const BASE_CLAIM_COST = 200         // ₢ to claim at tier 0
export const COST_SCALE_PER_TIER = 3       // costs multiply by this per tier
export const STAR_OUTPUT_SCALE_PER_TIER = 2.5 // star outputs multiply by this per tier
export const SYSTEM_MAINTENANCE_PER_STAR = 2  // ₢/s per star (on top of star-specific maintenance)

// ── Seeded RNG ──

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// ── Composable ──

export function useGalaxyConfig() {
  return {
    starTypes: readonly(starTypes),
    systemTraits: readonly(systemTraits),
    getStarType: (type: string) => starTypes.find(t => t.type === type),
    getSystemTrait: (id: string) => systemTraits.find(t => t.id === id),
  }
}
