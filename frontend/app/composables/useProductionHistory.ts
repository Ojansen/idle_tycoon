const MAX_POINTS = 60

// Ephemeral rolling window for production/upkeep rate charts
const creditsProductionHistory = ref<number[]>([])
const creditsUpkeepHistory = ref<number[]>([])
const energyProductionHistory = ref<number[]>([])
const energyUpkeepHistory = ref<number[]>([])

// Counter for throttled all-time sampling (every 10s)
let growthSampleCounter = 0

export function useProductionHistory() {
  const { creditsPerSecond, energyPerSecond, state } = useGameState()
  const { totalEnergyUpkeep, totalCreditsUpkeep } = useUpkeep()

  function sample() {
    // Rolling window for production/upkeep charts (1s interval, 60 points)
    creditsProductionHistory.value.push(creditsPerSecond.value)
    creditsUpkeepHistory.value.push(totalCreditsUpkeep.value)
    energyProductionHistory.value.push(energyPerSecond.value)
    energyUpkeepHistory.value.push(totalEnergyUpkeep.value)

    if (creditsProductionHistory.value.length > MAX_POINTS) {
      creditsProductionHistory.value.shift()
      creditsUpkeepHistory.value.shift()
      energyProductionHistory.value.shift()
      energyUpkeepHistory.value.shift()
    }

    // All-time growth: sample every 10 calls (10s) into persisted state
    growthSampleCounter++
    if (growthSampleCounter >= 10) {
      growthSampleCounter = 0
      state.value.productionHistory.push({
        credits: creditsPerSecond.value,
        energy: energyPerSecond.value
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

  const creditsChartData = computed(() => {
    return creditsProductionHistory.value.map((prod, i) => ({
      t: i,
      production: prod,
      upkeep: creditsUpkeepHistory.value[i] ?? 0
    }))
  })

  const growthChartData = computed(() => {
    return state.value.productionHistory.map((point, i) => ({
      t: i,
      credits: point.credits,
      energy: point.energy
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
