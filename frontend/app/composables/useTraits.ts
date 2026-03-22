import type { TraitDefinition } from '~/types/game'

const traits: TraitDefinition[] = [
  {
    id: 'ruthless_exploiters',
    name: 'Ruthless Exploiters',
    description: 'Maximize profit at any environmental cost.',
    icon: 'i-lucide-skull',
    bonus: { stat: 'creditsMultiplier', value: 1.25, label: '+25% Credits/s' },
    malus: { stat: 'energyMultiplier', value: 0.85, label: '-15% Energy/s' }
  },
  {
    id: 'green_energy',
    name: 'Green Energy Initiative',
    description: 'Sustainable power generation across all operations.',
    icon: 'i-lucide-leaf',
    bonus: { stat: 'energyMultiplier', value: 1.25, label: '+25% Energy/s' },
    malus: { stat: 'creditsMultiplier', value: 0.85, label: '-15% Credits/s' }
  },
  {
    id: 'worker_drones',
    name: 'Worker Drones',
    description: 'Automated workforce handles everything. Management optional.',
    icon: 'i-lucide-bot',
    bonus: { stat: 'popMultiplier', value: 1.30, label: '+30% Pop output' },
    malus: { stat: 'clickMultiplier', value: 0.80, label: '-20% Click power' }
  },
  {
    id: 'hands_on_ceo',
    name: 'Hands-On CEO',
    description: 'The boss clicks personally. Every. Single. Time.',
    icon: 'i-lucide-hand',
    bonus: { stat: 'clickMultiplier', value: 1.50, label: '+50% Click power' },
    malus: { stat: 'popMultiplier', value: 0.80, label: '-20% Pop output' }
  },
  {
    id: 'high_rollers',
    name: 'High Rollers',
    description: 'Fortune favors the bold. The casino is your second office.',
    icon: 'i-lucide-dice-5',
    bonus: { stat: 'casinoMultiplier', value: 1.20, label: '+20% Casino winnings' },
    malus: { stat: 'creditsMultiplier', value: 0.90, label: '-10% Credits/s' }
  },
  {
    id: 'risk_averse',
    name: 'Risk Averse',
    description: 'Steady growth. No gambling. Ever.',
    icon: 'i-lucide-shield',
    bonus: { stat: 'creditsMultiplier', value: 1.15, label: '+15% All production' },
    malus: { stat: 'casinoDisabled', value: 1, label: 'Casino disabled' }
  },
  {
    id: 'rapid_expansion',
    name: 'Rapid Expansion',
    description: 'Build fast, build cheap, worry about quality later.',
    icon: 'i-lucide-rocket',
    bonus: { stat: 'buildingCostMultiplier', value: 0.85, label: '-15% Building costs' },
    malus: { stat: 'energyMultiplier', value: 0.90, label: '-10% Energy/s' }
  },
  {
    id: 'research_focus',
    name: 'Research Focus',
    description: 'Knowledge is power. Literally — in terawatts.',
    icon: 'i-lucide-microscope',
    bonus: { stat: 'energyMultiplier', value: 1.30, label: '+30% Energy/s' },
    malus: { stat: 'popMultiplier', value: 0.80, label: '-20% Pop output' }
  },
  {
    id: 'isolationist',
    name: 'Isolationist',
    description: 'Your corporation operates in total isolation. No outside investments.',
    icon: 'i-lucide-lock',
    bonus: { stat: 'allProductionMultiplier', value: 1.15, label: '+15% All production' },
    malus: { stat: 'marketDisabled', value: 1, label: 'Market disabled' }
  },
  {
    id: 'mass_producer',
    name: 'Mass Producer',
    description: 'Your megacorp dominates consumer goods manufacturing.',
    icon: 'i-lucide-package',
    bonus: { stat: 'cgMultiplier', value: 1.30, label: '+30% Consumer Goods/s' },
    malus: { stat: 'creditsMultiplier', value: 0.85, label: '-15% Credits/s' }
  },
]

export function useTraits() {
  return {
    traits: readonly(traits)
  }
}
