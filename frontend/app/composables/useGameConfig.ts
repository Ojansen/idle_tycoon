import type { KardashevLevel, PrestigeUpgradeDefinition, RepeatablePrestigeUpgrade } from '~/types/game'

// Real Kardashev scale: ~10^10 ratio between each level
// Credits/s production rate thresholds per level
// Thresholds tuned for planet+division economy:
// Early game: 1 planet, ~5-20 pops, divisions level 1-10 → tens to thousands ₢/s
// Mid game: 3-6 planets, divisions level 10-20 → millions ₢/s
// Late game: 10+ planets, high levels, prestige multipliers → billions+ ₢/s
const kardashevLevels: KardashevLevel[] = [
  { level: 0, name: 'Type 0', description: 'Sub-planetary civilization', creditsPerSecond: 0 },
  { level: 1, name: 'Type I', description: 'Planetary civilization', creditsPerSecond: 500 },
  { level: 2, name: 'Type II', description: 'Stellar civilization', creditsPerSecond: 1e6 },
  { level: 3, name: 'Type III', description: 'Galactic civilization', creditsPerSecond: 1e10 },
  { level: 4, name: 'Type IV', description: 'Universal civilization', creditsPerSecond: 1e15 },
  { level: 5, name: 'Type V', description: 'Multiversal civilization', creditsPerSecond: 1e21 },
  { level: 6, name: 'Type VI', description: 'Omniversal civilization', creditsPerSecond: 1e28 }
]

const prestigeUpgrades: PrestigeUpgradeDefinition[] = [
  // ── Tier 0: Available immediately ──
  {
    id: 'quantum_computing',
    name: 'Quantum Computing',
    description: '1.5x Credits/s — quantum algorithms optimize every transaction',
    cost: 500,
    effect: { type: 'creditsMultiplier', value: 1.5 },
    requiredKardashev: 0
  },
  {
    id: 'quick_start',
    name: 'Quick Start',
    description: 'Homeworld divisions start at level 3 after prestige',
    cost: 1500,
    effect: { type: 'quickStart', divisionLevels: 3 },
    requiredKardashev: 0
  },
  {
    id: 'efficient_operations',
    name: 'Efficient Operations',
    description: '-15% maintenance costs — streamlined ops across all divisions',
    cost: 800,
    effect: { type: 'maintenanceReduction', value: 0.85 },
    requiredKardashev: 0
  },
  { id: 'efficient_logistics', name: 'Efficient Logistics', description: '1.5x Consumer Goods/s — optimized supply chains', cost: 500, effect: { type: 'cgMultiplier', value: 1.5 }, requiredKardashev: 0 },
  { id: 'trade_networks', name: 'Trade Networks', description: '1.5x Trade capacity — establish interstellar trade routes', cost: 500, effect: { type: 'tradeMultiplier', value: 1.5 }, requiredKardashev: 0 },
  // ── Tier 1: Requires Type I ──
  {
    id: 'corporate_synergy',
    name: 'Corporate Synergy',
    description: '2x Credits/s — vertical integration creates unstoppable revenue',
    cost: 5000,
    effect: { type: 'creditsMultiplier', value: 2 },
    requiredKardashev: 1
  },
  {
    id: 'colonial_expertise',
    name: 'Colonial Expertise',
    description: '+50% pop growth — proven colonization protocols accelerate settlement',
    cost: 5000,
    effect: { type: 'popGrowthMultiplier', value: 1.5 },
    requiredKardashev: 1
  },
  {
    id: 'drone_swarm_ai',
    name: 'Drone Swarm AI',
    description: '2x Worker output — autonomous drone networks multiply workforce',
    cost: 8000,
    effect: { type: 'workerOutputMultiplier', value: 2 },
    requiredKardashev: 1
  },
  { id: 'interstellar_supply', name: 'Interstellar Supply Lines', description: '2x Consumer Goods/s — interplanetary logistics network', cost: 5000, effect: { type: 'cgMultiplier', value: 2 }, requiredKardashev: 1 },
  { id: 'trade_empires', name: 'Trade Empires', description: '2x Trade capacity — galactic trade empire infrastructure', cost: 5000, effect: { type: 'tradeMultiplier', value: 2 }, requiredKardashev: 1 },
  // ── Tier 2: Requires Type II ──
  {
    id: 'bulk_contracts',
    name: 'Bulk Contracts',
    description: 'Divisions cost 50% less — galaxy-wide procurement slashes prices',
    cost: 15000,
    effect: { type: 'divisionCostMultiplier', value: 0.5 },
    requiredKardashev: 2
  },
  {
    id: 'galactic_trade',
    name: 'Galactic Trade Networks',
    description: '3x Credits/s — interstellar trade routes flood your coffers',
    cost: 25000,
    effect: { type: 'creditsMultiplier', value: 3 },
    requiredKardashev: 2
  },
  { id: 'galactic_distribution', name: 'Galactic Distribution', description: '3x Consumer Goods/s — galaxy-spanning supply infrastructure', cost: 25000, effect: { type: 'cgMultiplier', value: 3 }, requiredKardashev: 2 },
  { id: 'trade_dominion', name: 'Trade Dominion', description: '3x Trade capacity — absolute dominion over all commerce', cost: 25000, effect: { type: 'tradeMultiplier', value: 3 }, requiredKardashev: 2 },
  // ── Tier 3: Requires Type III ──
  {
    id: 'galactic_monopoly',
    name: 'Galactic Monopoly',
    description: '5x Credits/s — total economic dominance across the galaxy',
    cost: 150000,
    effect: { type: 'creditsMultiplier', value: 5 },
    requiredKardashev: 3
  },
  {
    id: 'transcendent_workforce',
    name: 'Transcendent Workforce',
    description: '3x Worker output — post-biological workers transcend physical limits',
    cost: 100000,
    effect: { type: 'workerOutputMultiplier', value: 3 },
    requiredKardashev: 3
  },
  { id: 'universal_fabrication', name: 'Universal Fabrication', description: '5x Consumer Goods/s — cross-dimensional manufacturing', cost: 150000, effect: { type: 'cgMultiplier', value: 5 }, requiredKardashev: 3 },
  // ── Tier 4: Requires Type IV ──
  {
    id: 'universal_dominion',
    name: 'Universal Dominion',
    description: '10x Credits/s — universal-scale economic supremacy',
    cost: 1000000,
    effect: { type: 'creditsMultiplier', value: 10 },
    requiredKardashev: 4
  },
  {
    id: 'reality_rewrite',
    name: 'Reality Rewrite',
    description: 'Divisions cost 75% less — rewrite the laws of economics itself',
    cost: 500000,
    effect: { type: 'divisionCostMultiplier', value: 0.25 },
    requiredKardashev: 4
  },
  { id: 'omnipresent_supply', name: 'Omnipresent Supply', description: '10x Consumer Goods/s — goods materialize from pure will', cost: 1000000, effect: { type: 'cgMultiplier', value: 10 }, requiredKardashev: 4 },
]

const repeatablePrestigeUpgrades: RepeatablePrestigeUpgrade[] = [
  {
    id: 'profit_margins',
    name: 'Profit Margins',
    description: '+10% Credits/s per level',
    icon: 'i-lucide-banknote',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'creditsMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'workforce_training',
    name: 'Workforce Training',
    description: '+10% Worker output per level',
    icon: 'i-lucide-users',
    baseCost: 150,
    costScale: 1.8,
    maxLevel: 25,
    effect: { type: 'workerOutputMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'bulk_purchasing',
    name: 'Bulk Purchasing',
    description: '-3% Division costs per level',
    icon: 'i-lucide-tags',
    baseCost: 200,
    costScale: 2.0,
    maxLevel: 20,
    effect: { type: 'divisionCostMultiplier', valuePerLevel: 0.97 }
  },
  {
    id: 'operational_efficiency',
    name: 'Operational Efficiency',
    description: '-3% maintenance costs per level',
    icon: 'i-lucide-wrench',
    baseCost: 200,
    costScale: 2.0,
    maxLevel: 20,
    effect: { type: 'maintenanceReduction', valuePerLevel: 0.97 }
  },
  {
    id: 'supply_optimization',
    name: 'Supply Optimization',
    description: '+10% Consumer Goods/s per level',
    icon: 'i-lucide-package',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'cgMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'trade_efficiency',
    name: 'Trade Efficiency',
    description: '+10% Trade capacity per level',
    icon: 'i-lucide-handshake',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'tradeMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'pop_growth_boost',
    name: 'Pop Growth Boost',
    description: '+5% pop growth per level',
    icon: 'i-lucide-trending-up',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'popGrowthMultiplier', valuePerLevel: 1.05 }
  },
  {
    id: 'maintenance_efficiency',
    name: 'Maintenance Efficiency',
    description: '-3% maintenance per level',
    icon: 'i-lucide-settings-2',
    baseCost: 200,
    costScale: 2.0,
    maxLevel: 20,
    effect: { type: 'maintenanceReduction', valuePerLevel: 0.97 }
  },
]

export function useGameConfig() {
  return {
    kardashevLevels: readonly(kardashevLevels),
    prestigeUpgrades: readonly(prestigeUpgrades),
    repeatablePrestigeUpgrades: readonly(repeatablePrestigeUpgrades)
  }
}
