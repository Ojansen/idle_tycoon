import type { TraitDefinition } from '~/types/game'

const traits: TraitDefinition[] = [
  {
    id: 'ruthless_exploiters',
    name: 'Ruthless Exploiters',
    description: 'Maximize profit at any cost to your population.',
    icon: 'i-lucide-skull',
    bonus: { stat: 'creditsMultiplier', value: 1.25, label: '+25% Credits/s' },
    malus: { stat: 'cgMultiplier', value: 0.85, label: '-15% Consumer Goods/s' }
  },
  {
    id: 'rapid_expansion',
    name: 'Rapid Expansion',
    description: 'Build fast, build cheap, worry about upkeep later.',
    icon: 'i-lucide-rocket',
    bonus: { stat: 'divisionCostMultiplier', value: 0.85, label: '-15% Division costs' },
    malus: { stat: 'maintenanceReduction', value: 1.15, label: '+15% Maintenance' }
  },
  {
    id: 'trade_magnate',
    name: 'Trade Magnate',
    description: 'Your megacorp dominates interstellar commerce, but sprawling trade routes strain your maintenance budget.',
    icon: 'i-lucide-handshake',
    bonus: { stat: 'tradeMultiplier', value: 1.30, label: '+30% Trade capacity' },
    malus: { stat: 'maintenanceReduction', value: 1.15, label: '+15% Maintenance' }
  },
  {
    id: 'mass_producer',
    name: 'Mass Producer',
    description: 'Your megacorp dominates consumer goods manufacturing.',
    icon: 'i-lucide-package',
    bonus: { stat: 'cgMultiplier', value: 1.30, label: '+30% Consumer Goods/s' },
    malus: { stat: 'creditsMultiplier', value: 0.85, label: '-15% Credits/s' }
  },
  {
    id: 'colonial_pioneers',
    name: 'Colonial Pioneers',
    description: 'Your colonists breed fast but spend lavishly.',
    icon: 'i-lucide-users',
    bonus: { stat: 'popGrowthMultiplier', value: 1.30, label: '+30% Pop growth' },
    malus: { stat: 'creditsMultiplier', value: 0.85, label: '-15% Credits/s' }
  },
  {
    id: 'efficient_governors',
    name: 'Efficient Governors',
    description: 'Lean operations, but your bureaucracy slows population growth.',
    icon: 'i-lucide-clipboard-check',
    bonus: { stat: 'divisionCostMultiplier', value: 0.85, label: '-15% Division costs' },
    malus: { stat: 'popGrowthMultiplier', value: 0.85, label: '-15% Pop growth' }
  },
  {
    id: 'expansionist',
    name: 'Expansionist',
    description: 'Your empire runs lean, but consumer goods production suffers.',
    icon: 'i-lucide-globe',
    bonus: { stat: 'maintenanceReduction', value: 0.80, label: '-20% Maintenance' },
    malus: { stat: 'cgMultiplier', value: 0.90, label: '-10% Consumer Goods/s' }
  },
  {
    id: 'research_consortium',
    name: 'Research Consortium',
    description: 'Your megacorp prioritizes R&D over revenue.',
    icon: 'i-lucide-flask-conical',
    bonus: { stat: 'researchMultiplier', value: 1.30, label: '+30% Research' },
    malus: { stat: 'creditsMultiplier', value: 0.85, label: '-15% Credits/s' }
  },
]

export function useTraits() {
  return {
    traits: readonly(traits)
  }
}
