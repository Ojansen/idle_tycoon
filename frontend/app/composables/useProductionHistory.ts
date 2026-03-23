const MAX_POINTS = 60

// Ephemeral rolling window for production/upkeep rate charts
const energyProductionHistory = ref<number[]>([])
const energyUpkeepHistory = ref<number[]>([])
const cgProductionHistory = ref<number[]>([])
const cgConsumptionHistory = ref<number[]>([])

// Counter for throttled all-time sampling (every 10s)
let growthSampleCounter = 0

export function useProductionHistory() {
  const { creditsPerSecond, state } = useGameState()
  const { effectiveCgProduction, totalCgConsumption } = useUpkeep()

  function sample() {
    // Rolling window for production/upkeep charts (1s interval, 60 points)
    energyProductionHistory.value.push(0)
    energyUpkeepHistory.value.push(0)
    cgProductionHistory.value.push(effectiveCgProduction.value)
    cgConsumptionHistory.value.push(totalCgConsumption.value)

    if (energyProductionHistory.value.length > MAX_POINTS) {
      energyProductionHistory.value.shift()
      energyUpkeepHistory.value.shift()
      cgProductionHistory.value.shift()
      cgConsumptionHistory.value.shift()
    }

    // All-time growth: sample every 10 calls (10s) into persisted state
    growthSampleCounter++
    if (growthSampleCounter >= 10) {
      growthSampleCounter = 0
      state.value.productionHistory.push({
        credits: creditsPerSecond.value
      })
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

  const cgChartData = computed(() => {
    return cgProductionHistory.value.map((prod, i) => ({
      t: i,
      production: prod,
      consumption: cgConsumptionHistory.value[i] ?? 0
    }))
  })

  const growthChartData = computed(() => {
    return state.value.productionHistory.map((point, i) => ({
      t: i,
      credits: point.credits
    }))
  })

  return {
    energyProductionHistory: readonly(energyProductionHistory),
    energyUpkeepHistory: readonly(energyUpkeepHistory),
    energyChartData,
    cgChartData,
    growthChartData,
    sample
  }
}
