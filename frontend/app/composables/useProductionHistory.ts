const MAX_POINTS = 60

interface HistoryPoint {
  t: number // seconds ago (0 = now, 59 = oldest)
  creditsProduction: number
  creditsUpkeep: number
  energyProduction: number
  energyUpkeep: number
}

// Use a shared singleton so all components see the same history
const creditsProductionHistory = ref<number[]>([])
const creditsUpkeepHistory = ref<number[]>([])
const energyProductionHistory = ref<number[]>([])
const energyUpkeepHistory = ref<number[]>([])

export function useProductionHistory() {
  const { creditsPerSecond, energyPerSecond } = useGameState()
  const { totalEnergyUpkeep, totalCreditsUpkeep } = useUpkeep()

  function sample() {
    creditsProductionHistory.value.push(creditsPerSecond.value)
    creditsUpkeepHistory.value.push(totalCreditsUpkeep.value)
    energyProductionHistory.value.push(energyPerSecond.value)
    energyUpkeepHistory.value.push(totalEnergyUpkeep.value)

    // Trim to max points
    if (creditsProductionHistory.value.length > MAX_POINTS) {
      creditsProductionHistory.value.shift()
      creditsUpkeepHistory.value.shift()
      energyProductionHistory.value.shift()
      energyUpkeepHistory.value.shift()
    }
  }

  // Build data arrays for nuxt-charts AreaChart component
  const energyChartData = computed(() => {
    return energyProductionHistory.value.map((prod, i) => ({
      t: i,
      production: prod,
      upkeep: energyUpkeepHistory.value[i] ?? 0
    }))
  })

  const creditsChartData = computed(() => {
    return creditsProductionHistory.value.map((prod, i) => ({
      t: i,
      production: prod,
      upkeep: creditsUpkeepHistory.value[i] ?? 0
    }))
  })

  return {
    creditsProductionHistory: readonly(creditsProductionHistory),
    creditsUpkeepHistory: readonly(creditsUpkeepHistory),
    energyProductionHistory: readonly(energyProductionHistory),
    energyUpkeepHistory: readonly(energyUpkeepHistory),
    energyChartData,
    creditsChartData,
    sample
  }
}
