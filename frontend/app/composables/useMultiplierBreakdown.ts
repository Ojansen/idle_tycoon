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

const statMeta: { stat: TraitStat; label: string; icon: string }[] = [
  { stat: 'creditsMultiplier', label: 'Credits/s', icon: 'i-lucide-banknote' },
  { stat: 'workerOutputMultiplier', label: 'Worker Output', icon: 'i-lucide-users' },
  { stat: 'cgMultiplier', label: 'Consumer Goods/s', icon: 'i-lucide-package' },
  { stat: 'divisionCostMultiplier', label: 'Division Costs', icon: 'i-lucide-tags' },
  { stat: 'tradeMultiplier', label: 'Trade Capacity', icon: 'i-lucide-handshake' },
  { stat: 'researchMultiplier', label: 'Research Output', icon: 'i-lucide-flask-conical' },
  { stat: 'maintenanceReduction', label: 'Maintenance Costs', icon: 'i-lucide-trending-down' }
]

export function useMultiplierBreakdown() {
  const { getTraitMultiplier } = useGameState()
  const { getResearchMultiplier } = useResearchActions()
  const { getFullUpkeepReduction } = useUpkeep()

  const breakdowns = computed<MultiplierBreakdown[]>(() => {
    const results: MultiplierBreakdown[] = []

    for (const meta of statMeta) {
      const sources: MultiplierSource[] = []

      const trait = getTraitMultiplier(meta.stat)
      if (trait !== 1) sources.push({ label: 'Traits', value: trait })

      if (meta.stat === 'maintenanceReduction') {
        // maintenanceReduction uses a custom research effect type, not the standard multiplier
        const reduction = getFullUpkeepReduction()
        if (reduction !== 1) sources.push({ label: 'Combined', value: reduction })
      } else {
        const research = getResearchMultiplier(meta.stat)
        if (research !== 1) sources.push({ label: 'Research', value: research })
      }

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
