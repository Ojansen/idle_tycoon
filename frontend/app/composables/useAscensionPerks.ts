import type { TraitStat } from '~/types/game'

interface PerkTemplate {
  stat: TraitStat
  name: string
  desc: string
  baseValue: number
  scaleFactor: number
}

const PERK_TEMPLATES: PerkTemplate[] = [
  { stat: 'creditsMultiplier',      name: 'Profit Optimization',    desc: '+{pct}% ₢ production',       baseValue: 1.25, scaleFactor: 1.5 },
  { stat: 'cgMultiplier',           name: 'Supply Chain Mastery',   desc: '+{pct}% CG production',      baseValue: 1.25, scaleFactor: 1.5 },
  { stat: 'workerOutputMultiplier', name: 'Workforce Excellence',   desc: '+{pct}% worker output',      baseValue: 1.25, scaleFactor: 1.5 },
  { stat: 'tradeMultiplier',        name: 'Trade Dominion',         desc: '+{pct}% trade value',        baseValue: 1.25, scaleFactor: 1.5 },
  { stat: 'popGrowthMultiplier',    name: 'Colonial Expansion',     desc: '+{pct}% pop growth',         baseValue: 1.30, scaleFactor: 1.5 },
  { stat: 'divisionCostMultiplier', name: 'Efficient Bureaucracy',  desc: '-{pct}% division costs',     baseValue: 0.85, scaleFactor: 1.3 },
  { stat: 'maintenanceReduction',   name: 'Lean Operations',        desc: '-{pct}% maintenance',        baseValue: 0.85, scaleFactor: 1.3 },
  { stat: 'allProductionMultiplier',name: 'Universal Optimization', desc: '+{pct}% all production',     baseValue: 1.10, scaleFactor: 1.5 },
  { stat: 'researchMultiplier',     name: 'Scientific Mastery',    desc: '+{pct}% research output',    baseValue: 1.25, scaleFactor: 1.5 },
]

function computePerkValue(template: PerkTemplate, tier: number): number {
  if (template.baseValue >= 1) {
    return 1 + (template.baseValue - 1) * Math.pow(template.scaleFactor, tier - 1)
  }
  else {
    return 1 - (1 - template.baseValue) * Math.pow(template.scaleFactor, tier - 1)
  }
}

function formatDescription(desc: string, value: number): string {
  const pct = value >= 1
    ? Math.round((value - 1) * 100)
    : Math.round((1 - value) * 100)
  return desc.replace('{pct}', String(pct))
}

// Seeded shuffle so the same tier always yields the same offer set within a session.
// Uses a simple mulberry32 PRNG seeded by tier alone (prestige resets the run anyway).
function seededShuffle<T>(arr: T[], seed: number): T[] {
  let s = seed >>> 0
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    const j = (s >>> 0) % (i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function useAscensionPerks() {
  const { state, kardashevLevel } = useGameState()

  function getAscensionMultiplier(stat: TraitStat): number {
    let multiplier = 1
    for (const perk of state.value.ascensionPerks) {
      if (perk.stat === stat) {
        multiplier *= perk.value
      }
    }
    return multiplier
  }

  // Kardashev levels 1–5 each grant exactly one perk.
  // A level is "pending" when it has been reached (kardashevHighWaterMark >= level)
  // but no perk has been chosen for it yet (tracked by ascensionPerks.length < level).
  const pendingAscensionLevels = computed<number[]>(() => {
    const chosen = state.value.ascensionPerks.length
    const reached = Math.min(state.value.kardashevHighWaterMark, 5)
    const pending: number[] = []
    for (let level = chosen + 1; level <= reached; level++) {
      pending.push(level)
    }
    return pending
  })

  function generatePerkOptions(tier: number): { stat: TraitStat; name: string; description: string; value: number }[] {
    const shuffled = seededShuffle(PERK_TEMPLATES, tier * 1000 + 7)
    return shuffled.slice(0, 3).map(template => {
      const value = computePerkValue(template, tier)
      return {
        stat: template.stat,
        name: template.name,
        description: formatDescription(template.desc, value),
        value,
      }
    })
  }

  function choosePerk(stat: TraitStat, value: number): void {
    state.value.ascensionPerks.push({ stat, value })
  }

  return {
    getAscensionMultiplier,
    pendingAscensionLevels,
    generatePerkOptions,
    choosePerk,
  }
}
