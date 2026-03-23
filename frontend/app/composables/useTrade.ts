import type { TradePolicy } from '~/types/game'
import { calcBuildingMultiplier } from '~/utils/gameMath'

// Trade value coefficients by building resource type
const TRADE_COEFFICIENTS: Record<string, number> = {
  autoclick: 0.8,
  credits: 0.1,
  energy: 0.05,
  consumer_goods: 0.05
}

// Empire size bonus tuning
const EMPIRE_TRADE_SCALE = 50

// Policy definitions
export interface TradePolicyDefinition {
  id: TradePolicy
  name: string
  description: string
  icon: string
  conversion: { credits: number; energy: number; consumerGoods: number }
  requiredResearch?: string
}

export const TRADE_POLICIES: TradePolicyDefinition[] = [
  {
    id: 'wealth_creation',
    name: 'Wealth Creation',
    description: 'Convert all trade value into credits.',
    icon: 'i-lucide-banknote',
    conversion: { credits: 1.0, energy: 0, consumerGoods: 0 }
  },
  {
    id: 'consumer_benefits',
    name: 'Consumer Benefits',
    description: 'Split trade between credits and consumer goods.',
    icon: 'i-lucide-package',
    conversion: { credits: 0.5, energy: 0, consumerGoods: 0.5 },
    requiredResearch: 'trade_consumer_policy'
  },
  {
    id: 'energy_subsidies',
    name: 'Energy Subsidies',
    description: 'Split trade between credits and energy.',
    icon: 'i-lucide-zap',
    conversion: { credits: 0.5, energy: 0.5, consumerGoods: 0 },
    requiredResearch: 'trade_energy_policy'
  },
  {
    id: 'balanced_economy',
    name: 'Balanced Economy',
    description: 'Distribute trade evenly across all resources.',
    icon: 'i-lucide-scale',
    conversion: { credits: 0.34, energy: 0.33, consumerGoods: 0.33 },
    requiredResearch: 'trade_balanced_policy'
  }
]

export function useTrade() {
  const { state, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
  const { buildings } = useGameConfig()
  const { getAscensionMultiplier } = useAscensionPerks()
  const { getResearchMultiplier } = useResearchActions()

  // Compute totalBuildings directly to avoid circular dependency with useUpkeep
  const totalBuildings = computed(() => {
    let total = 0
    for (const count of Object.values(state.value.buildings)) {
      total += count || 0
    }
    return total
  })

  // Check if trade is disabled (Isolationist trait)
  const isTradeDisabled = computed(() => {
    return getTraitMultiplier('tradeDisabled') !== 1
  })

  // Raw trade value: sum of building outputs × trade coefficients
  const rawTradeValue = computed(() => {
    if (isTradeDisabled.value) return 0

    let total = 0
    for (const b of buildings) {
      const owned = state.value.buildings[b.id] || 0
      if (owned === 0) continue
      const coefficient = TRADE_COEFFICIENTS[b.resource] || 0
      if (coefficient === 0) continue
      total += owned * b.baseOutput * calcBuildingMultiplier(owned) * coefficient
    }
    return total
  })

  // Trade multiplier stack (standard pattern)
  const tradeMultiplierStack = computed(() => {
    return getPrestigeMultiplier('tradeMultiplier')
      * getTraitMultiplier('tradeMultiplier')
      * getAscensionMultiplier('tradeMultiplier')
      * getRepeatableMultiplier('tradeMultiplier')
      * getResearchMultiplier('tradeMultiplier')
  })

  // Empire size bonus: bigger empire = more trade routes
  const empireSizeBonus = computed(() => {
    return 1 + Math.log2(1 + totalBuildings.value / EMPIRE_TRADE_SCALE)
  })

  // Converted trade value: raw × multipliers × empire size bonus
  const convertedTradeValue = computed(() => {
    return rawTradeValue.value * tradeMultiplierStack.value * empireSizeBonus.value
  })

  // Active policy definition
  const activePolicy = computed(() => {
    return TRADE_POLICIES.find(p => p.id === state.value.tradePolicy) || TRADE_POLICIES[0]
  })

  // Available policies (filtered by completed research)
  const availablePolicies = computed(() => {
    return TRADE_POLICIES.filter(p => {
      if (!p.requiredResearch) return true
      return state.value.completedResearch.includes(p.requiredResearch)
    })
  })

  // Final trade conversion: what you get per second in each resource
  const tradeConversion = computed(() => {
    const converted = convertedTradeValue.value
    const policy = activePolicy.value
    return {
      credits: converted * policy.conversion.credits,
      energy: converted * policy.conversion.energy,
      consumerGoods: converted * policy.conversion.consumerGoods
    }
  })

  function setTradePolicy(policyId: TradePolicy): boolean {
    const policy = TRADE_POLICIES.find(p => p.id === policyId)
    if (!policy) return false
    if (policy.requiredResearch && !state.value.completedResearch.includes(policy.requiredResearch)) return false
    state.value.tradePolicy = policyId
    return true
  }

  return {
    rawTradeValue,
    convertedTradeValue,
    tradeConversion,
    activePolicy,
    availablePolicies,
    tradeMultiplierStack,
    empireSizeBonus,
    isTradeDisabled,
    setTradePolicy,
    TRADE_POLICIES
  }
}
