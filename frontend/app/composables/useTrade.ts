import type { TradePolicy } from '~/types/game'

// Empire size bonus tuning
const EMPIRE_TRADE_SCALE = 50

// Policy definitions — simplified: trade converts to ₢ or ₢+CG
export interface TradePolicyDefinition {
  id: TradePolicy
  name: string
  description: string
  icon: string
  conversion: { credits: number; consumerGoods: number }
  requiredResearch?: string
}

export const TRADE_POLICIES: TradePolicyDefinition[] = [
  {
    id: 'wealth_creation',
    name: 'Wealth Creation',
    description: 'Convert all trade value into energy credits.',
    icon: 'i-lucide-banknote',
    conversion: { credits: 1.0, consumerGoods: 0 }
  },
  {
    id: 'consumer_benefits',
    name: 'Consumer Benefits',
    description: 'Split trade between energy credits and consumer goods.',
    icon: 'i-lucide-package',
    conversion: { credits: 0.5, consumerGoods: 0.5 },
    requiredResearch: 'trade_consumer_policy'
  },
]

export function useTrade() {
  const { state, getPrestigeMultiplier, getTraitMultiplier, getRepeatableMultiplier } = useGameState()
  const { getAscensionMultiplier } = useAscensionPerks()
  const { getResearchMultiplier } = useResearchActions()
  const { rawTradeValue: planetRawTradeValue, totalDivisionLevels } = usePlanets()

  // Raw trade value comes from Commerce divisions + passive pop trade
  const rawTradeValue = computed(() => {
    return planetRawTradeValue.value
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
    return 1 + Math.log2(1 + totalDivisionLevels.value / EMPIRE_TRADE_SCALE)
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
    if (!policy) return { credits: 0, consumerGoods: 0 }
    return {
      credits: converted * policy.conversion.credits,
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
    setTradePolicy,
    TRADE_POLICIES
  }
}
