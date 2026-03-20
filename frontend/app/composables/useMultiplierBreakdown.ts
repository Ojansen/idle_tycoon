import type { TraitStat } from '~/types/game'

interface MultiplierSource {
  label: string
  value: number
}

interface MultiplierBreakdown {
  stat: TraitStat
  label: string
  icon: string
  total: number
  sources: MultiplierSource[]
}

const statMeta: { stat: TraitStat; label: string; icon: string; hasPrestige: boolean }[] = [
  { stat: 'creditsMultiplier', label: 'Credits/s', icon: 'i-lucide-banknote', hasPrestige: true },
  { stat: 'energyMultiplier', label: 'Energy/s', icon: 'i-lucide-zap', hasPrestige: true },
  { stat: 'clickMultiplier', label: 'Click Power', icon: 'i-lucide-mouse-pointer-click', hasPrestige: true },
  { stat: 'popMultiplier', label: 'Pop Output', icon: 'i-lucide-users', hasPrestige: false },
  { stat: 'buildingCostMultiplier', label: 'Building Costs', icon: 'i-lucide-tags', hasPrestige: false },
  { stat: 'casinoMultiplier', label: 'Casino Winnings', icon: 'i-lucide-dices', hasPrestige: false }
]

export function useMultiplierBreakdown() {
  const { getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
  const { getAscensionMultiplier } = useAscensionPerks()
  const { getResearchMultiplier } = useResearchActions()

  const breakdowns = computed<MultiplierBreakdown[]>(() => {
    const results: MultiplierBreakdown[] = []

    for (const meta of statMeta) {
      const sources: MultiplierSource[] = []

      const trait = getTraitMultiplier(meta.stat)
      if (trait !== 1) sources.push({ label: 'Traits', value: trait })

      if (meta.hasPrestige) {
        const prestige = getPrestigeMultiplier(meta.stat as 'creditsMultiplier' | 'energyMultiplier' | 'clickMultiplier')
        if (prestige !== 1) sources.push({ label: 'Prestige', value: prestige })
      }

      const ascension = getAscensionMultiplier(meta.stat)
      if (ascension !== 1) sources.push({ label: 'Ascension', value: ascension })

      const repeatable = getRepeatableMultiplier(meta.stat)
      if (repeatable !== 1) sources.push({ label: 'Repeatable', value: repeatable })

      const research = getResearchMultiplier(meta.stat)
      if (research !== 1) sources.push({ label: 'Research', value: research })

      if (sources.length === 0) continue

      const total = sources.reduce((acc, s) => acc * s.value, 1)
      results.push({
        stat: meta.stat,
        label: meta.label,
        icon: meta.icon,
        total,
        sources
      })
    }

    return results
  })

  return { breakdowns }
}
