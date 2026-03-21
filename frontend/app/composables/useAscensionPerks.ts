import type { TraitStat } from '~/types/game'

export interface AscensionPerk {
  id: string
  name: string
  description: string
  icon: string
  kardashevLevel: number
  effect: { stat: TraitStat; value: number }
}

const ascensionPerkPools: Record<number, AscensionPerk[]> = {
  // Type 0 → I (Planetary)
  1: [
    {
      id: 'efficient_bureaucracy',
      name: 'Efficient Bureaucracy',
      description: '+25% all Credits/s permanently',
      icon: 'i-lucide-file-text',
      kardashevLevel: 1,
      effect: { stat: 'creditsMultiplier', value: 1.25 }
    },
    {
      id: 'energy_surplus_protocol',
      name: 'Energy Surplus Protocol',
      description: '+25% all Energy/s permanently',
      icon: 'i-lucide-battery-charging',
      kardashevLevel: 1,
      effect: { stat: 'energyMultiplier', value: 1.25 }
    },
    {
      id: 'population_boom',
      name: 'Population Boom',
      description: '+50% Pop output permanently',
      icon: 'i-lucide-users',
      kardashevLevel: 1,
      effect: { stat: 'popMultiplier', value: 1.5 }
    }
  ],

  // Type I → II (Stellar)
  2: [
    {
      id: 'megastructure_expertise',
      name: 'Megastructure Expertise',
      description: '-30% building costs permanently',
      icon: 'i-lucide-hard-hat',
      kardashevLevel: 2,
      effect: { stat: 'buildingCostMultiplier', value: 0.7 }
    },
    {
      id: 'stellar_harvesting',
      name: 'Stellar Harvesting',
      description: '+50% Energy/s permanently',
      icon: 'i-lucide-sun',
      kardashevLevel: 2,
      effect: { stat: 'energyMultiplier', value: 1.5 }
    },
    {
      id: 'corporate_dominance',
      name: 'Corporate Dominance',
      description: '+100% Casino winnings permanently',
      icon: 'i-lucide-trophy',
      kardashevLevel: 2,
      effect: { stat: 'casinoMultiplier', value: 2.0 }
    }
  ],

  // Type II → III (Galactic)
  3: [
    {
      id: 'galactic_logistics',
      name: 'Galactic Logistics',
      description: '-50% building costs permanently',
      icon: 'i-lucide-truck',
      kardashevLevel: 3,
      effect: { stat: 'buildingCostMultiplier', value: 0.5 }
    },
    {
      id: 'dark_energy_mastery',
      name: 'Dark Energy Mastery',
      description: '+100% Energy/s permanently',
      icon: 'i-lucide-moon',
      kardashevLevel: 3,
      effect: { stat: 'energyMultiplier', value: 2.0 }
    },
    {
      id: 'temporal_arbitrage',
      name: 'Temporal Arbitrage',
      description: '+200% Credits/s permanently',
      icon: 'i-lucide-timer',
      kardashevLevel: 3,
      effect: { stat: 'creditsMultiplier', value: 3.0 }
    }
  ],

  // Type III → IV (Universal)
  4: [
    {
      id: 'universal_omniscience',
      name: 'Universal Omniscience',
      description: '+200% all production permanently',
      icon: 'i-lucide-eye',
      kardashevLevel: 4,
      effect: { stat: 'creditsMultiplier', value: 3.0 }
    },
    {
      id: 'vacuum_manipulation',
      name: 'Vacuum Manipulation',
      description: '+500% Energy/s permanently',
      icon: 'i-lucide-waves',
      kardashevLevel: 4,
      effect: { stat: 'energyMultiplier', value: 6.0 }
    },
    {
      id: 'infinite_workforce',
      name: 'Infinite Workforce',
      description: '+500% Pop output permanently',
      icon: 'i-lucide-users',
      kardashevLevel: 4,
      effect: { stat: 'popMultiplier', value: 6.0 }
    }
  ],

  // Type IV → V (Multiversal)
  5: [
    {
      id: 'reality_engineering',
      name: 'Reality Engineering',
      description: '+1000% all production permanently',
      icon: 'i-lucide-code',
      kardashevLevel: 5,
      effect: { stat: 'creditsMultiplier', value: 11.0 }
    },
    {
      id: 'entropy_reversal',
      name: 'Entropy Reversal',
      description: '+1000% Energy/s permanently',
      icon: 'i-lucide-refresh-cw',
      kardashevLevel: 5,
      effect: { stat: 'energyMultiplier', value: 11.0 }
    },
    {
      id: 'omega_point',
      name: 'Omega Point',
      description: '+1000% Click power permanently',
      icon: 'i-lucide-star',
      kardashevLevel: 5,
      effect: { stat: 'clickMultiplier', value: 11.0 }
    }
  ]
}

// Flatten all perks for lookup
const allPerks: AscensionPerk[] = Object.values(ascensionPerkPools).flat()

export function useAscensionPerks() {
  const { state, kardashevLevel } = useGameState()

  function getPerksForLevel(level: number): AscensionPerk[] {
    return ascensionPerkPools[level] || []
  }

  function getPerkById(id: string): AscensionPerk | undefined {
    return allPerks.find(p => p.id === id)
  }

  function hasChosenPerkForLevel(level: number): boolean {
    const pool = ascensionPerkPools[level]
    if (!pool) return false
    return pool.some(p => state.value.ascensionPerks.includes(p.id))
  }

  function getAscensionMultiplier(stat: TraitStat): number {
    let multiplier = 1
    for (const perkId of state.value.ascensionPerks) {
      const perk = allPerks.find(p => p.id === perkId)
      if (perk && perk.effect.stat === stat) {
        multiplier *= perk.effect.value
      }
    }
    return multiplier
  }

  function choosePerk(perkId: string): boolean {
    const perk = allPerks.find(p => p.id === perkId)
    if (!perk) return false
    if (state.value.ascensionPerks.includes(perkId)) return false
    if (hasChosenPerkForLevel(perk.kardashevLevel)) return false
    state.value.ascensionPerks.push(perkId)
    return true
  }

  // Levels that have pending (unclaimed) perks
  const pendingAscensionLevels = computed(() => {
    const pending: number[] = []
    for (let level = 1; level <= 5; level++) {
      if (kardashevLevel.value >= level && !hasChosenPerkForLevel(level)) {
        pending.push(level)
      }
    }
    return pending
  })

  const chosenPerks = computed(() => {
    return state.value.ascensionPerks
      .map(id => allPerks.find(p => p.id === id))
      .filter(Boolean) as AscensionPerk[]
  })

  return {
    getPerksForLevel,
    getPerkById,
    hasChosenPerkForLevel,
    getAscensionMultiplier,
    choosePerk,
    pendingAscensionLevels,
    chosenPerks
  }
}
