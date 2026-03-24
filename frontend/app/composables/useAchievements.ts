import type { GameState } from '~/types/game'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: string
  check: (state: GameState) => boolean
}

const achievements: AchievementDefinition[] = [
  // Credits
  { id: 'credits_10k', name: 'Getting Started', description: 'Earn 10K total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 10000 },
  { id: 'credits_1m', name: 'Millionaire', description: 'Earn 1M total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e6 },
  { id: 'credits_1b', name: 'Billionaire', description: 'Earn 1B total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e9 },
  { id: 'credits_1t', name: 'Trillionaire', description: 'Earn 1T total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e12 },
  { id: 'credits_1q', name: 'Quadrillionaire', description: 'Earn 1Qa total credits', icon: 'i-lucide-banknote', category: 'Credits', check: s => s.totalCreditsEarned >= 1e15 },

  // Planets
  {
    id: 'first_colony',
    name: 'First Colony',
    description: 'Colonize your first planet beyond the homeworld',
    icon: 'i-lucide-globe',
    category: 'Planets',
    check: (s) => s.systems.filter(sys => sys.status === 'claimed').reduce((n, sys) => n + sys.planets.length, 0) >= 2
  },
  {
    id: 'five_planets',
    name: 'Interstellar Empire',
    description: 'Have 5 planets under your control',
    icon: 'i-lucide-orbit',
    category: 'Planets',
    check: (s) => s.systems.filter(sys => sys.status === 'claimed').reduce((n, sys) => n + sys.planets.length, 0) >= 5
  },
  {
    id: 'division_10',
    name: 'Master Division',
    description: 'Upgrade any division to level 10',
    icon: 'i-lucide-building-2',
    category: 'Planets',
    check: (s) => s.systems.some(sys => sys.planets.some(p => p.divisions.some(d => d !== null && d.level >= 10)))
  },
  {
    id: 'full_planet',
    name: 'Full House',
    description: 'Fill all division slots on a planet',
    icon: 'i-lucide-check-circle',
    category: 'Planets',
    check: (s) => s.systems.some(sys => sys.planets.some(p => p.divisions.length > 0 && p.divisions.every(d => d !== null)))
  },

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
  const { state } = useGameState()
  const toast = useToast()

  // Track which achievements we've already toasted this session to avoid re-toasting on load
  const toastedThisSession = new Set<string>()

  function checkAchievements() {
    for (const achievement of achievements) {
      if (state.value.achievements.includes(achievement.id)) continue
      if (achievement.check(state.value)) {
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
