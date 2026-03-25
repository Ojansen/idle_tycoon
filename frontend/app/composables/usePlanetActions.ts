import type { DivisionType, PlanetPolicy, PlanetState } from '~/types/planet'
import { calcDivisionUpgradeCost, calcColonyCost, calcTransferCost } from '~/utils/gameMath'
import {
  DIVISION_REASSIGN_COST_MULT,
  POP_TRANSFER_BASE_COST,
  POP_TRANSFER_TIER_SCALE,
  MAX_DIVISION_LEVEL,
} from '~/composables/usePlanetConfig'

export function usePlanetActions() {
  const { state } = useGameState()
  const { getPlanetDef, getPlanetSize, getDivision, planets: planetDefs } = usePlanetConfig()

  // ── Helper: locate planet by (systemIndex, planetIndex) ──

  function getPlanet(systemIndex: number, planetIndex: number): PlanetState | undefined {
    return state.value.systems[systemIndex]?.planets[planetIndex]
  }

  // ── Colonize a new planet ──

  function getColonyCost(planetDefId: string): number {
    const def = getPlanetDef(planetDefId)
    if (!def) return Infinity
    // TODO: apply cost multipliers (prestige, traits) here
    return calcColonyCost(def.colonyCost)
  }

  function canColonize(planetDefId: string): boolean {
    const def = getPlanetDef(planetDefId)
    if (!def) return false
    // Check required research
    const { isResearchComplete } = useResearchActions()
    if (!def.requiredResearch.every(techId => isResearchComplete(techId))) return false
    // Check not already colonized
    const alreadyColonized = state.value.systems.some(sys =>
      sys.planets.some(p => p.definitionId === planetDefId)
    )
    if (alreadyColonized) return false
    // Check can afford
    return state.value.credits >= getColonyCost(planetDefId)
  }

  function colonizePlanet(planetDefId: string): boolean {
    if (!canColonize(planetDefId)) return false
    const def = getPlanetDef(planetDefId)!
    const sizeDef = getPlanetSize(def.size)!
    const cost = getColonyCost(planetDefId)

    state.value.credits -= cost

    const newPlanet: PlanetState = {
      definitionId: def.id,
      name: def.name,
      type: def.type,
      size: def.size,
      traits: [...(def.traits || [])],
      pops: 1,
      divisions: new Array(sizeDef.slots).fill(null),
      policy: 'balanced',
    }

    // Add planet to the first claimed system (homeworld system)
    const homeSystem = state.value.systems.find(sys => sys.status === 'claimed')
    if (homeSystem) homeSystem.planets.push(newPlanet)
    return true
  }

  // ── Assign a division to a slot ──

  function getAssignCost(systemIndex: number, planetIndex: number, slotIndex: number, divisionType: DivisionType): number {
    const planet = getPlanet(systemIndex, planetIndex)
    if (!planet) return Infinity
    const existing = planet.divisions[slotIndex]
    if (!existing) {
      // New assignment: cost is the division's base upgrade cost
      const divDef = getDivision(divisionType)
      return divDef?.baseUpgradeCost ?? Infinity
    }
    // Reassignment: cost based on current level
    const divDef = getDivision(existing.type)
    if (!divDef) return Infinity
    return Math.floor(calcDivisionUpgradeCost(divDef.baseUpgradeCost, divDef.costMultiplier, existing.level) * DIVISION_REASSIGN_COST_MULT)
  }

  function assignDivision(systemIndex: number, planetIndex: number, slotIndex: number, divisionType: DivisionType): boolean {
    const planet = getPlanet(systemIndex, planetIndex)
    if (!planet) return false
    if (slotIndex < 0 || slotIndex >= planet.divisions.length) return false

    const cost = getAssignCost(systemIndex, planetIndex, slotIndex, divisionType)
    if (state.value.credits < cost) return false

    state.value.credits -= cost
    planet.divisions[slotIndex] = { type: divisionType, level: 1 }
    return true
  }

  // ── Upgrade a division ──

  function getDivisionUpgradeCost(systemIndex: number, planetIndex: number, slotIndex: number): number {
    const planet = getPlanet(systemIndex, planetIndex)
    if (!planet) return Infinity
    const div = planet.divisions[slotIndex]
    if (!div) return Infinity
    const divDef = getDivision(div.type)
    if (!divDef) return Infinity
    return calcDivisionUpgradeCost(divDef.baseUpgradeCost, divDef.costMultiplier, div.level)
  }

  function canUpgradeDivision(systemIndex: number, planetIndex: number, slotIndex: number): boolean {
    const planet = getPlanet(systemIndex, planetIndex)
    if (!planet) return false
    const div = planet.divisions[slotIndex]
    if (!div) return false
    // Check per-division max level
    if (div.level >= MAX_DIVISION_LEVEL) return false
    return state.value.credits >= getDivisionUpgradeCost(systemIndex, planetIndex, slotIndex)
  }

  // ── Downgrade a division (level - 1, removes at level 0) ──

  function downgradeDivision(systemIndex: number, planetIndex: number, slotIndex: number): boolean {
    const planet = getPlanet(systemIndex, planetIndex)
    if (!planet) return false
    const div = planet.divisions[slotIndex]
    if (!div) return false
    if (div.level <= 1) {
      // Level 1 → remove entirely
      planet.divisions[slotIndex] = null
    } else {
      div.level--
    }
    return true
  }

  function upgradeDivision(systemIndex: number, planetIndex: number, slotIndex: number): boolean {
    if (!canUpgradeDivision(systemIndex, planetIndex, slotIndex)) return false
    const planet = getPlanet(systemIndex, planetIndex)
    const div = planet?.divisions[slotIndex]
    if (!planet || !div) return false
    const cost = getDivisionUpgradeCost(systemIndex, planetIndex, slotIndex)
    state.value.credits -= cost
    div.level++
    return true
  }

  // ── Set planet policy ──

  function setPlanetPolicy(systemIndex: number, planetIndex: number, policy: PlanetPolicy): boolean {
    const planet = getPlanet(systemIndex, planetIndex)
    if (!planet) return false
    planet.policy = policy
    return true
  }

  // ── Transfer pops between planets ──
  // fromKey / toKey are { systemIndex, planetIndex } objects

  function getTransferCost(
    fromSystemIndex: number, fromPlanetIndex: number,
    toSystemIndex: number, toPlanetIndex: number,
    popCount: number
  ): number {
    const fromPlanet = getPlanet(fromSystemIndex, fromPlanetIndex)
    const toPlanet = getPlanet(toSystemIndex, toPlanetIndex)
    if (!fromPlanet || !toPlanet) return Infinity
    const fromDef = getPlanetDef(fromPlanet.definitionId)
    const toDef = getPlanetDef(toPlanet.definitionId)
    if (!fromDef || !toDef) return Infinity
    const tierDiff = Math.abs(fromDef.requiredResearch.length - toDef.requiredResearch.length)
    return calcTransferCost(popCount, POP_TRANSFER_BASE_COST, POP_TRANSFER_TIER_SCALE, tierDiff)
  }

  function canTransferPops(
    fromSystemIndex: number, fromPlanetIndex: number,
    toSystemIndex: number, toPlanetIndex: number,
    popCount: number
  ): boolean {
    if (fromSystemIndex === toSystemIndex && fromPlanetIndex === toPlanetIndex) return false
    const fromPlanet = getPlanet(fromSystemIndex, fromPlanetIndex)
    if (!fromPlanet || fromPlanet.pops < popCount || popCount <= 0) return false
    // Must leave at least 1 pop
    if (fromPlanet.pops - popCount < 1) return false
    return state.value.credits >= getTransferCost(fromSystemIndex, fromPlanetIndex, toSystemIndex, toPlanetIndex, popCount)
  }

  function transferPops(
    fromSystemIndex: number, fromPlanetIndex: number,
    toSystemIndex: number, toPlanetIndex: number,
    popCount: number
  ): boolean {
    if (!canTransferPops(fromSystemIndex, fromPlanetIndex, toSystemIndex, toPlanetIndex, popCount)) return false
    const from = getPlanet(fromSystemIndex, fromPlanetIndex)
    const to = getPlanet(toSystemIndex, toPlanetIndex)
    if (!from || !to) return false
    const cost = getTransferCost(fromSystemIndex, fromPlanetIndex, toSystemIndex, toPlanetIndex, popCount)
    state.value.credits -= cost
    from.pops -= popCount
    to.pops += popCount
    return true
  }

  // ── Available planets for colonization ──

  const availablePlanets = computed(() => {
    const { isResearchComplete } = useResearchActions()
    const colonized = new Set(
      state.value.systems.flatMap(sys => sys.planets.map(p => p.definitionId))
    )
    return planetDefs.filter(p => {
      if (colonized.has(p.id)) return false
      if (!p.requiredResearch.every(techId => isResearchComplete(techId))) return false
      return true
    })
  })

  return {
    colonizePlanet,
    canColonize,
    getColonyCost,
    assignDivision,
    getAssignCost,
    upgradeDivision,
    canUpgradeDivision,
    getDivisionUpgradeCost,
    downgradeDivision,
    setPlanetPolicy,
    transferPops,
    canTransferPops,
    getTransferCost,
    availablePlanets,
  }
}
