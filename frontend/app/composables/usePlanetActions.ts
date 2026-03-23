import type { DivisionType, PlanetPolicy, PlanetState } from '~/types/planet'
import { calcDivisionUpgradeCost, calcColonyCost, calcTransferCost } from '~/utils/gameMath'
import {
  DIVISION_REASSIGN_COST_MULT,
  POP_TRANSFER_BASE_COST,
  POP_TRANSFER_TIER_SCALE,
} from '~/composables/usePlanetConfig'

export function usePlanetActions() {
  const { state } = useGameState()
  const { getPlanetDef, getPlanetSize, getDivision, planets: planetDefs } = usePlanetConfig()

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
    // Check Kardashev level
    const { kardashevLevel } = useGameState()
    if (kardashevLevel.value < def.unlockKardashev) return false
    // Check not already colonized
    if ((state.value.planets || []).some(p => p.definitionId === planetDefId)) return false
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
      pops: 1, // start with 1 pop
      divisions: new Array(sizeDef.slots).fill(null),
      policy: 'balanced',
    }

    if (!state.value.planets) state.value.planets = []
    state.value.planets.push(newPlanet)
    return true
  }

  // ── Assign a division to a slot ──

  function getAssignCost(planetIndex: number, slotIndex: number, divisionType: DivisionType): number {
    const planet = state.value.planets?.[planetIndex]
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

  function assignDivision(planetIndex: number, slotIndex: number, divisionType: DivisionType): boolean {
    const planet = state.value.planets?.[planetIndex]
    if (!planet) return false
    if (slotIndex < 0 || slotIndex >= planet.divisions.length) return false

    const cost = getAssignCost(planetIndex, slotIndex, divisionType)
    if (state.value.credits < cost) return false

    state.value.credits -= cost
    planet.divisions[slotIndex] = { type: divisionType, level: 1 }
    return true
  }

  // ── Upgrade a division ──

  function getDivisionUpgradeCost(planetIndex: number, slotIndex: number): number {
    const planet = state.value.planets?.[planetIndex]
    if (!planet) return Infinity
    const div = planet.divisions[slotIndex]
    if (!div) return Infinity
    const divDef = getDivision(div.type)
    if (!divDef) return Infinity
    return calcDivisionUpgradeCost(divDef.baseUpgradeCost, divDef.costMultiplier, div.level)
  }

  function canUpgradeDivision(planetIndex: number, slotIndex: number): boolean {
    const planet = state.value.planets[planetIndex]
    if (!planet) return false
    // Check planet level cap
    const { getPlanetTotalLevels, getPlanetMaxLevels } = usePlanets()
    if (getPlanetTotalLevels(planet) >= getPlanetMaxLevels(planet)) return false
    return state.value.credits >= getDivisionUpgradeCost(planetIndex, slotIndex)
  }

  function upgradeDivision(planetIndex: number, slotIndex: number): boolean {
    if (!canUpgradeDivision(planetIndex, slotIndex)) return false
    const planet = state.value.planets[planetIndex]
    const div = planet?.divisions[slotIndex]
    if (!planet || !div) return false
    const cost = getDivisionUpgradeCost(planetIndex, slotIndex)
    state.value.credits -= cost
    div.level++
    return true
  }

  // ── Set planet policy ──

  function setPlanetPolicy(planetIndex: number, policy: PlanetPolicy): boolean {
    const planet = state.value.planets?.[planetIndex]
    if (!planet) return false
    planet.policy = policy
    return true
  }

  // ── Transfer pops between planets ──

  function getTransferCost(fromIndex: number, toIndex: number, popCount: number): number {
    const fromPlanet = state.value.planets?.[fromIndex]
    const toPlanet = state.value.planets?.[toIndex]
    if (!fromPlanet || !toPlanet) return Infinity
    const fromDef = getPlanetDef(fromPlanet.definitionId)
    const toDef = getPlanetDef(toPlanet.definitionId)
    if (!fromDef || !toDef) return Infinity
    const tierDiff = Math.abs(fromDef.unlockKardashev - toDef.unlockKardashev)
    return calcTransferCost(popCount, POP_TRANSFER_BASE_COST, POP_TRANSFER_TIER_SCALE, tierDiff)
  }

  function canTransferPops(fromIndex: number, toIndex: number, popCount: number): boolean {
    if (fromIndex === toIndex) return false
    const fromPlanet = state.value.planets?.[fromIndex]
    if (!fromPlanet || fromPlanet.pops < popCount || popCount <= 0) return false
    // Must leave at least 1 pop
    if (fromPlanet.pops - popCount < 1) return false
    return state.value.credits >= getTransferCost(fromIndex, toIndex, popCount)
  }

  function transferPops(fromIndex: number, toIndex: number, popCount: number): boolean {
    if (!canTransferPops(fromIndex, toIndex, popCount)) return false
    const from = state.value.planets[fromIndex]
    const to = state.value.planets[toIndex]
    if (!from || !to) return false
    const cost = getTransferCost(fromIndex, toIndex, popCount)
    state.value.credits -= cost
    from.pops -= popCount
    to.pops += popCount
    return true
  }

  // ── Available planets for colonization ──

  const availablePlanets = computed(() => {
    const { kardashevLevel } = useGameState()
    const colonized = new Set((state.value.planets || []).map(p => p.definitionId))
    return planetDefs.filter(p => {
      if (colonized.has(p.id)) return false
      if (p.unlockKardashev > kardashevLevel.value) return false
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
    setPlanetPolicy,
    transferPops,
    canTransferPops,
    getTransferCost,
    availablePlanets,
  }
}
