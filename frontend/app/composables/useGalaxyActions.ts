import type { PlanetState } from '~/types/planet'

export function useGalaxyActions() {
  const { state } = useGameState()
  const { getPlanetSize } = usePlanetConfig()
  const { getSystemTraitMod } = useGalaxy()

  // ── Start Survey ──

  function canStartSurvey(systemIndex: number): boolean {
    const sys = state.value.systems?.[systemIndex]
    if (!sys || sys.status !== 'undiscovered') return false
    if (sys.surveyProgress > 0) return false // already surveying
    const costMod = getSystemTraitMod(sys, 'surveyCost')
    return state.value.credits >= sys.surveyCost * costMod
  }

  function startSurvey(systemIndex: number): boolean {
    if (!canStartSurvey(systemIndex)) return false
    const sys = state.value.systems[systemIndex]!
    const costMod = getSystemTraitMod(sys, 'surveyCost')
    state.value.credits -= Math.floor(sys.surveyCost * costMod)
    sys.surveyProgress = 0.01 // mark as "surveying" (will tick up)
    return true
  }

  // ── Claim System ──

  function canClaimSystem(systemIndex: number): boolean {
    const sys = state.value.systems?.[systemIndex]
    if (!sys || sys.status !== 'surveyed') return false
    const costMod = getSystemTraitMod(sys, 'claimCost')
    return state.value.credits >= sys.claimCost * costMod
  }

  function claimSystem(systemIndex: number): boolean {
    if (!canClaimSystem(systemIndex)) return false
    const sys = state.value.systems[systemIndex]!
    const costMod = getSystemTraitMod(sys, 'claimCost')
    state.value.credits -= Math.floor(sys.claimCost * costMod)
    sys.status = 'claimed'
    return true
  }

  // ── Colonize Planet ──

  function canColonizePlanet(systemIndex: number, planetSlotIndex: number): boolean {
    const sys = state.value.systems?.[systemIndex]
    if (!sys || sys.status !== 'claimed') return false
    const slot = sys.planetSlots[planetSlotIndex]
    if (!slot || slot.colonized) return false
    return state.value.credits >= slot.colonyCost
  }

  function colonizePlanet(systemIndex: number, planetSlotIndex: number): boolean {
    if (!canColonizePlanet(systemIndex, planetSlotIndex)) return false
    const sys = state.value.systems[systemIndex]!
    const slot = sys.planetSlots[planetSlotIndex]!
    state.value.credits -= slot.colonyCost

    slot.colonized = true

    const sizeDef = getPlanetSize(slot.size)
    const newPlanet: PlanetState = {
      definitionId: `${sys.id}_planet_${planetSlotIndex}`,
      name: slot.name,
      type: slot.type,
      size: slot.size,
      traits: [...slot.traits],
      pops: 1,
      divisions: new Array(sizeDef?.slots ?? 4).fill(null),
      policy: 'balanced',
    }

    sys.planets.push(newPlanet)
    return true
  }

  // ── Abandon surveyed system (remove from list) ──

  function abandonSystem(systemIndex: number): boolean {
    const sys = state.value.systems?.[systemIndex]
    if (!sys || sys.status === 'claimed') return false // can't abandon claimed
    state.value.systems.splice(systemIndex, 1)
    return true
  }

  // ── Available actions ──

  const undiscoveredSystems = computed(() => {
    return (state.value.systems ?? [])
      .map((s, i) => ({ system: s, index: i }))
      .filter(s => s.system.status === 'undiscovered')
  })

  const surveyedSystems = computed(() => {
    return (state.value.systems ?? [])
      .map((s, i) => ({ system: s, index: i }))
      .filter(s => s.system.status === 'surveyed')
  })

  const claimedSystems = computed(() => {
    return (state.value.systems ?? [])
      .map((s, i) => ({ system: s, index: i }))
      .filter(s => s.system.status === 'claimed')
  })

  return {
    canStartSurvey,
    startSurvey,
    canClaimSystem,
    claimSystem,
    canColonizePlanet,
    colonizePlanet,
    abandonSystem,
    undiscoveredSystems,
    surveyedSystems,
    claimedSystems,
  }
}
