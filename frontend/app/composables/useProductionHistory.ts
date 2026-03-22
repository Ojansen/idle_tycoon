const MAX_POINTS = 60
// Use a shared singleton so all components see the same history
const creditsProductionHistory = ref<number[]>([])
const creditsUpkeepHistory = ref<number[]>([])
const energyProductionHistory = ref<number[]>([])
const energyUpkeepHistory = ref<number[]>([])

// All-time cumulative growth tracking
const totalCreditsHistory = ref<number[]>([])
const totalEnergyHistory = ref<number[]>([])

export function useProductionHistory() {
  const { creditsPerSecond, energyPerSecond, state } = useGameState()
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

    // Sample production rates for all-time growth chart
    totalCreditsHistory.value.push(creditsPerSecond.value)
    totalEnergyHistory.value.push(energyPerSecond.value)
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

  const growthChartData = computed(() => {
    return totalCreditsHistory.value.map((credits, i) => ({
      t: i,
      credits,
      energy: totalEnergyHistory.value[i] ?? 0
    }))
  })

  return {
    creditsProductionHistory: readonly(creditsProductionHistory),
    creditsUpkeepHistory: readonly(creditsUpkeepHistory),
    energyProductionHistory: readonly(energyProductionHistory),
    energyUpkeepHistory: readonly(energyUpkeepHistory),
    energyChartData,
    creditsChartData,
    growthChartData,
    sample
  }
}
