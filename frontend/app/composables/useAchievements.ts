import type { GameState } from '~/types/game'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: string
  check: (state: GameState, extra: AchievementContext) => boolean
}

interface AchievementContext {
  energyPerSecond: number
}

const achievements: AchievementDefinition[] = [
  // Clicks
  { id: 'first_click', name: 'First Click', description: 'Make your first click', icon: 'i-lucide-mouse-pointer-click', category: 'Clicks', check: s => s.totalClicks >= 1 },
  { id: 'click_100', name: 'Dedicated Clicker', description: 'Reach 100 clicks', icon: 'i-lucide-mouse-pointer-click', category: 'Clicks', check: s => s.totalClicks >= 100 },
  { id: 'click_10000', name: 'Carpal Tunnel', description: 'Reach 10,000 clicks', icon: 'i-lucide-mouse-pointer-click', category: 'Clicks', check: s => s.totalClicks >= 10000 },

  // Credits
  { id: 'credits_10k', name: 'Getting Started', description: 'Earn 10K total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 10000 },
  { id: 'credits_1m', name: 'Millionaire', description: 'Earn 1M total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e6 },
  { id: 'credits_1b', name: 'Billionaire', description: 'Earn 1B total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e9 },
  { id: 'credits_1t', name: 'Trillionaire', description: 'Earn 1T total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e12 },
  { id: 'credits_1q', name: 'Quadrillionaire', description: 'Earn 1Qa total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e15 },

  // Energy
  { id: 'energy_10k', name: 'Power On', description: 'Reach 10K TW/s', icon: 'i-lucide-zap', category: 'Energy', check: (_s, ctx) => ctx.energyPerSecond >= 10000 },
  { id: 'energy_1m', name: 'Stellar Power', description: 'Reach 1M TW/s', icon: 'i-lucide-zap', category: 'Energy', check: (_s, ctx) => ctx.energyPerSecond >= 1e6 },
  { id: 'energy_1b', name: 'Power Hungry', description: 'Accumulate 1B total energy', icon: 'i-lucide-zap', category: 'Energy', check: s => s.totalEnergyEarned >= 1e9 },
  { id: 'energy_1t', name: 'Stellar Power', description: 'Accumulate 1T total energy', icon: 'i-lucide-zap', category: 'Energy', check: s => s.totalEnergyEarned >= 1e12 },

  // Kardashev
  { id: 'type_1', name: 'Planetary Civilization', description: 'Reach Type I', icon: 'i-lucide-globe', category: 'Kardashev', check: s => s.kardashevHighWaterMark >= 1 },
  { id: 'type_2', name: 'Stellar Civilization', description: 'Reach Type II', icon: 'i-lucide-sun', category: 'Kardashev', check: s => s.kardashevHighWaterMark >= 2 },
  { id: 'type_3', name: 'Galactic Civilization', description: 'Reach Type III', icon: 'i-lucide-orbit', category: 'Kardashev', check: s => s.kardashevHighWaterMark >= 3 },
  { id: 'type_4', name: 'Universal Civilization', description: 'Reach Type IV', icon: 'i-lucide-atom', category: 'Kardashev', check: s => s.kardashevHighWaterMark >= 4 },
  { id: 'type_5', name: 'Multiversal Civilization', description: 'Reach Type V', icon: 'i-lucide-infinity', category: 'Kardashev', check: s => s.kardashevHighWaterMark >= 5 },

  // Prestige
  { id: 'first_prestige', name: 'Fresh Start', description: 'Prestige for the first time', icon: 'i-lucide-refresh-cw', category: 'Prestige', check: s => s.prestigeCount >= 1 },
  { id: 'prestige_5', name: 'Serial Restructurer', description: 'Prestige 5 times', icon: 'i-lucide-refresh-cw', category: 'Prestige', check: s => s.prestigeCount >= 5 },
  { id: 'prestige_10', name: 'Serial Resetter', description: 'Prestige 10 times', icon: 'i-lucide-refresh-cw', category: 'Prestige', check: s => s.prestigeCount >= 10 },
  { id: 'prestige_25', name: 'Prestige Addict', description: 'Prestige 25 times', icon: 'i-lucide-refresh-cw', category: 'Prestige', check: s => s.prestigeCount >= 25 },
  { id: 'prestige_50', name: 'Eternal Return', description: 'Prestige 50 times', icon: 'i-lucide-refresh-cw', category: 'Prestige', check: s => s.prestigeCount >= 50 },

  // Casino
  { id: 'casino_win_big', name: 'High Roller', description: 'Win 100K+ in a single casino game', icon: 'i-lucide-dice-5', category: 'Casino', check: s => s.casinoStats.totalWon >= 100000 },
  { id: 'casino_100_games', name: 'Gambling Addiction', description: 'Play 100 casino games', icon: 'i-lucide-dice-5', category: 'Casino', check: s => s.casinoStats.gamesPlayed >= 100 },

  // Buildings
  {
    id: 'building_100',
    name: 'Empire Builder',
    description: 'Own 100+ of any single building',
    icon: 'i-lucide-building-2',
    category: 'Buildings',
    check: (s) => {
      for (const count of Object.values(s.buildings)) {
        if (count >= 100) return true
      }
      return false
    }
  },
  {
    id: 'all_type0',
    name: 'Full Spectrum',
    description: 'Own at least 1 of every Type 0 building',
    icon: 'i-lucide-check-circle',
    category: 'Buildings',
    check: (s) => {
      const type0Ids = [
        'mining_drone', 'ore_refinery', 'orbital_factory', 'space_station',
        'solar_array', 'wind_turbine_grid', 'fission_plant', 'orbital_mirror',
        'corporate_drone'
      ]
      return type0Ids.every(id => (s.buildings[id] || 0) >= 1)
    }
  },

  // More building totals
  {
    id: 'building_500',
    name: 'Urban Sprawl',
    description: 'Own 500 total buildings',
    icon: 'i-lucide-building-2',
    category: 'Buildings',
    check: (s) => {
      let total = 0
      for (const count of Object.values(s.buildings)) total += count
      return total >= 500
    }
  },
  {
    id: 'building_1000',
    name: 'Galactic Developer',
    description: 'Own 1000 total buildings',
    icon: 'i-lucide-building-2',
    category: 'Buildings',
    check: (s) => {
      let total = 0
      for (const count of Object.values(s.buildings)) total += count
      return total >= 1000
    }
  },

  // Research
  { id: 'research_all', name: 'Omniscient', description: 'Complete all research', icon: 'i-lucide-flask-conical', category: 'Research', check: s => s.completedResearch.length >= 28 },

  // Megastructures
  {
    id: 'mega_first',
    name: 'Megastructure Pioneer',
    description: 'Complete your first megastructure',
    icon: 'i-lucide-hammer',
    category: 'Megastructure',
    check: (s) => Object.values(s.megastructures).some(m => m.completed)
  },
  {
    id: 'mega_all',
    name: 'Cosmic Architect',
    description: 'Complete all megastructures',
    icon: 'i-lucide-crown',
    category: 'Megastructure',
    check: (s) => {
      const megaIds = ['stellar_forge', 'dyson_brain', 'nidavellir_forge', 'matrioshka_brain', 'genesis_engine', 'cosmic_engine', 'reality_engine']
      return megaIds.every(id => s.megastructures[id]?.completed)
    }
  },

  // Prestige completion
  {
    id: 'all_prestige_bought',
    name: 'Prestige Complete',
    description: 'Buy all one-time prestige upgrades',
    icon: 'i-lucide-star',
    category: 'Prestige',
    check: (s) => s.prestigeUpgradesBought.length >= 16
  },

  // Influence milestone
  { id: 'influence_10k', name: 'Influential', description: 'Accumulate 10K total influence', icon: 'i-lucide-star', category: 'Prestige', check: s => s.influence >= 10000 }
]

export function useAchievements() {
  const { state, energyPerSecond } = useGameState()
  const toast = useToast()

  // Track which achievements we've already toasted this session to avoid re-toasting on load
  const toastedThisSession = new Set<string>()

  function checkAchievements() {
    const ctx: AchievementContext = {
      energyPerSecond: energyPerSecond.value
    }

    for (const achievement of achievements) {
      if (state.value.achievements.includes(achievement.id)) continue
      if (achievement.check(state.value, ctx)) {
        state.value.achievements.push(achievement.id)
        if (!toastedThisSession.has(achievement.id)) {
          toastedThisSession.add(achievement.id)
          toast.success({ title: 'Achievement Unlocked!', message: achievement.name })
        }
      }
    }
  }

  // Mark all currently unlocked achievements as already toasted (for load)
  function suppressExistingToasts() {
    for (const id of state.value.achievements) {
      toastedThisSession.add(id)
    }
  }

  const allAchievements = readonly(achievements)

  return {
    allAchievements,
    checkAchievements,
    suppressExistingToasts
  }
}
