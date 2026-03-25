import type { StarSystemState } from '~/types/galaxy'
import type { PlanetState } from '~/types/planet'
import { generateGalaxy, type GalaxyNode } from '~/utils/galaxyGen'
import { generateSystem } from '~/composables/useGalaxyGenSystem'

export function useGalaxy() {
  const { state } = useGameState()
  const { getSystemTrait } = useGalaxyConfig()

  // ── All planets across all claimed systems ──

  const allPlanets = computed(() => {
    const planets: { planet: PlanetState; systemIndex: number; planetIndex: number }[] = []
    for (let si = 0; si < (state.value.systems?.length ?? 0); si++) {
      const sys = state.value.systems[si]!
      if (sys.status !== 'claimed') continue
      for (let pi = 0; pi < sys.planets.length; pi++) {
        planets.push({ planet: sys.planets[pi]!, systemIndex: si, planetIndex: pi })
      }
    }
    return planets
  })

  const allColonizedPlanets = computed((): PlanetState[] => {
    return allPlanets.value.map(p => p.planet)
  })

  // ── Star passive income totals ──

  const totalStarCredits = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'starOutput')
      for (const star of sys.stars) total += star.output.credits * traitMod
    }
    return total
  })

  const totalStarCg = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'starOutput')
      for (const star of sys.stars) total += star.output.cg * traitMod
    }
    return total
  })

  const totalStarTrade = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'starOutput')
      for (const star of sys.stars) total += star.output.trade * traitMod
    }
    return total
  })

  const totalStarRp = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      for (const star of sys.stars) total += star.output.rp
    }
    return total
  })

  // ── System maintenance ──

  const totalSystemMaintenance = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'maintenance')
      for (const star of sys.stars) total += (star.maintenanceCost + 2) * traitMod
    }
    return total
  })

  // ── Counts ──

  const claimedSystemCount = computed(() =>
    (state.value.systems ?? []).filter(s => s.status === 'claimed').length
  )

  const totalStarCount = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      total += sys.stars.length
    }
    return total
  })

  // ── Frontier: systems adjacent to claimed territory ──

  const frontierIds = computed(() => {
    const systems = state.value.systems ?? []
    const claimedIds = new Set(systems.filter(s => s.status === 'claimed').map(s => s.id))
    const surveyedIds = new Set(systems.filter(s => s.status === 'surveyed').map(s => s.id))
    const frontier: string[] = []
    for (const claimedId of claimedIds) {
      const sys = systems.find(s => s.id === claimedId)
      if (!sys) continue
      for (const neighborId of sys.edges) {
        if (!claimedIds.has(neighborId) && !surveyedIds.has(neighborId) && !frontier.includes(neighborId)) {
          frontier.push(neighborId)
        }
      }
    }
    return frontier
  })

  // ── Helpers ──

  function getSystemTraitMod(sys: StarSystemState, stat: 'starOutput' | 'surveyCost' | 'claimCost' | 'maintenance'): number {
    let mod = 1
    for (const traitId of sys.traits) {
      const trait = getSystemTrait(traitId)
      if (!trait) continue
      for (const effect of trait.effects) {
        if (effect.stat === stat) mod *= effect.value
      }
    }
    return mod
  }

  // ── Survey tick ──

  function tickSurveys(dt: number) {
    for (const sys of state.value.systems ?? []) {
      if (sys.status === 'undiscovered' && sys.surveyProgress > 0 && sys.surveyProgress < sys.surveyTime) {
        sys.surveyProgress += dt
        if (sys.surveyProgress >= sys.surveyTime) {
          sys.surveyProgress = sys.surveyTime
          sys.status = 'surveyed'
        }
      }
    }
  }

  return {
    allColonizedPlanets,
    allPlanets,
    totalStarCredits,
    totalStarCg,
    totalStarTrade,
    totalStarRp,
    totalSystemMaintenance,
    claimedSystemCount,
    totalStarCount,
    frontierIds,
    tickSurveys,
    getSystemTraitMod,
  }
}
