import type { StarSystemState, GeneratedStar, GeneratedPlanet, StarType } from '~/types/galaxy'
import type { PlanetType, PlanetSize, PlanetState } from '~/types/planet'
import {
  seededRandom,
  BASE_SURVEY_TIME,
  SURVEY_TIME_PER_TIER,
  BASE_SURVEY_COST,
  BASE_CLAIM_COST,
  COST_SCALE_PER_TIER,
  STAR_OUTPUT_SCALE_PER_TIER,
  BASE_DISCOVERY_INTERVAL,
  MAX_UNDISCOVERED,
  SYSTEM_MAINTENANCE_PER_STAR,
} from '~/composables/useGalaxyConfig'

// ── System Name Generator ──

const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Sigma', 'Omega', 'Nova', 'Proxima', 'Tau', 'Kepler', 'Vega', 'Rigel', 'Altair', 'Deneb', 'Sirius', 'Polaris', 'Arcturus']
const suffixes = ['Prime', 'Major', 'Minor', 'Reach', 'Expanse', 'Nebula', 'Cluster', 'Haven', 'Deep', 'Frontier']

function generateSystemName(rng: () => number): string {
  const prefix = prefixes[Math.floor(rng() * prefixes.length)]!
  if (rng() > 0.5) {
    const suffix = suffixes[Math.floor(rng() * suffixes.length)]!
    return `${prefix} ${suffix}`
  }
  // Number suffix: e.g. "Kepler-442"
  return `${prefix}-${Math.floor(rng() * 900 + 100)}`
}

// ── Planet Name Generator ──

const planetNames = ['Terra', 'Aethon', 'Kronos', 'Helios', 'Cryos', 'Magmus', 'Oceanus', 'Eden', 'Tartarus', 'Elysium', 'Vulcan', 'Thalassa', 'Boreas', 'Nyx', 'Gaia']

function generatePlanetName(rng: () => number, systemName: string, index: number): string {
  if (rng() > 0.6) {
    return `${systemName} ${['I', 'II', 'III'][index] ?? String(index + 1)}`
  }
  return planetNames[Math.floor(rng() * planetNames.length)]!
}

// ── System Generation ──

const allStarTypes: StarType[] = ['yellow_dwarf', 'red_giant', 'blue_supergiant', 'white_dwarf', 'neutron_star', 'binary_system']
const allPlanetTypes: PlanetType[] = ['garden', 'volcanic', 'ocean', 'desert', 'ice', 'barren', 'gaia']
const allPlanetSizes: PlanetSize[] = ['small', 'medium', 'large']
const allTraitIds = ['mineral_rich', 'nebula', 'pirate_activity', 'ancient_gateway', 'resource_poor', 'pristine']
const allPlanetTraitIds = ['mineral_rich', 'lush_biosphere', 'hostile_atmosphere', 'trade_hub', 'industrial_deposits', 'low_gravity', 'extreme_weather', 'ancient_ruins']

function pickWeightedStarType(rng: () => number, starTypeDefs: readonly { type: StarType; rarity: number }[]): StarType {
  const totalWeight = starTypeDefs.reduce((sum, s) => sum + s.rarity, 0)
  let roll = rng() * totalWeight
  for (const s of starTypeDefs) {
    roll -= s.rarity
    if (roll <= 0) return s.type
  }
  return 'yellow_dwarf'
}

export function generateSystem(seed: number, tier: number, starTypeDefs: readonly { type: StarType; rarity: number; baseOutput: any; maintenanceCost: number }[]): Omit<StarSystemState, 'status' | 'planets' | 'surveyProgress' | 'discoveredAt'> {
  const rng = seededRandom(seed)
  const name = generateSystemName(rng)
  const tierScale = Math.pow(STAR_OUTPUT_SCALE_PER_TIER, tier)

  // Generate 1-5 stars (higher tier = more likely to have more)
  const starCount = Math.min(5, 1 + Math.floor(rng() * (2 + tier * 0.5)))
  const stars: GeneratedStar[] = []
  for (let i = 0; i < starCount; i++) {
    const starType = pickWeightedStarType(rng, starTypeDefs)
    const def = starTypeDefs.find(s => s.type === starType)!
    stars.push({
      type: starType,
      output: {
        credits: def.baseOutput.credits * tierScale * (0.8 + rng() * 0.4),
        cg: def.baseOutput.cg * tierScale * (0.8 + rng() * 0.4),
        trade: def.baseOutput.trade * tierScale * (0.8 + rng() * 0.4),
        researchSpeed: def.baseOutput.researchSpeed * (1 + tier * 0.3),
      },
      maintenanceCost: def.maintenanceCost * tierScale * 0.3,
    })
  }

  // Generate 0-2 planets (30% chance for each slot, higher tier slightly more likely)
  const planetSlots: GeneratedPlanet[] = []
  const maxPlanets = 2
  for (let i = 0; i < maxPlanets; i++) {
    if (rng() < 0.3 + tier * 0.05) {
      const pType = allPlanetTypes[Math.floor(rng() * allPlanetTypes.length)]!
      const sizeRoll = rng()
      const pSize: PlanetSize = sizeRoll < 0.3 ? 'small' : sizeRoll < 0.75 ? 'medium' : 'large'
      const traitCount = rng() < 0.3 ? 0 : rng() < 0.7 ? 1 : 2
      const traits: string[] = []
      const shuffled = [...allPlanetTraitIds].sort(() => rng() - 0.5)
      for (let t = 0; t < traitCount && t < shuffled.length; t++) {
        traits.push(shuffled[t]!)
      }
      planetSlots.push({
        type: pType,
        size: pSize,
        traits,
        colonized: false,
        colonyCost: Math.floor(BASE_CLAIM_COST * tierScale * (1 + rng() * 0.5)),
        name: generatePlanetName(rng, name, i),
      })
    }
  }

  // System traits (0-2)
  const systemTraitCount = rng() < 0.4 ? 0 : rng() < 0.7 ? 1 : 2
  const shuffledTraits = [...allTraitIds].sort(() => rng() - 0.5)
  const traits = shuffledTraits.slice(0, systemTraitCount)

  // Costs
  const surveyCost = Math.floor(BASE_SURVEY_COST * Math.pow(COST_SCALE_PER_TIER, tier))
  const claimCost = Math.floor(BASE_CLAIM_COST * Math.pow(COST_SCALE_PER_TIER, tier))
  const surveyTime = BASE_SURVEY_TIME + SURVEY_TIME_PER_TIER * tier

  return {
    id: `sys_${seed}`,
    seed,
    tier,
    stars,
    planetSlots,
    traits,
    surveyTime,
    surveyCost,
    claimCost,
    name,
  }
}

// ── Composable ──

export function useGalaxy() {
  const { state } = useGameState()
  const { starTypes, getSystemTrait } = useGalaxyConfig()

  // ── All planets across all systems ──

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

  // Flat list of all colonized planets (for usePlanets compatibility)
  const allColonizedPlanets = computed((): PlanetState[] => {
    return allPlanets.value.map(p => p.planet)
  })

  // ── Star passive income totals ──

  const totalStarCredits = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'starOutput')
      for (const star of sys.stars) {
        total += star.output.credits * traitMod
      }
    }
    return total
  })

  const totalStarCg = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'starOutput')
      for (const star of sys.stars) {
        total += star.output.cg * traitMod
      }
    }
    return total
  })

  const totalStarTrade = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'starOutput')
      for (const star of sys.stars) {
        total += star.output.trade * traitMod
      }
    }
    return total
  })

  const totalResearchSpeedBonus = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      for (const star of sys.stars) {
        total += star.output.researchSpeed
      }
    }
    return total
  })

  // ── System maintenance ──

  const totalSystemMaintenance = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      const traitMod = getSystemTraitMod(sys, 'maintenance')
      for (const star of sys.stars) {
        total += (star.maintenanceCost + SYSTEM_MAINTENANCE_PER_STAR) * traitMod
      }
    }
    return total
  })

  // ── Claimed system count ──

  const claimedSystemCount = computed(() => {
    return (state.value.systems ?? []).filter(s => s.status === 'claimed').length
  })

  const totalStarCount = computed(() => {
    let total = 0
    for (const sys of state.value.systems ?? []) {
      if (sys.status !== 'claimed') continue
      total += sys.stars.length
    }
    return total
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

  // ── Discovery tick ──

  function tickDiscovery(dt: number) {
    if (!state.value.systems) return

    // Count undiscovered systems
    const undiscovered = state.value.systems.filter(s => s.status === 'undiscovered')
    const surveyed = state.value.systems.filter(s => s.status === 'surveyed')

    // Generate new systems if under cap
    if (undiscovered.length + surveyed.length < MAX_UNDISCOVERED) {
      // Check if enough time has passed since last discovery
      const lastDiscovery = state.value.lastDiscoveryTime ?? 0
      const elapsed = (Date.now() - lastDiscovery) / 1000
      if (elapsed >= BASE_DISCOVERY_INTERVAL) {
        discoverNewSystem()
        state.value.lastDiscoveryTime = Date.now()
      }
    }

    // Tick survey progress on systems being surveyed
    for (const sys of state.value.systems) {
      if (sys.status === 'undiscovered' && sys.surveyProgress > 0 && sys.surveyProgress < sys.surveyTime) {
        sys.surveyProgress += dt
        if (sys.surveyProgress >= sys.surveyTime) {
          sys.surveyProgress = sys.surveyTime
          sys.status = 'surveyed'
        }
      }
    }
  }

  function discoverNewSystem() {
    const { kardashevLevel } = useGameState()
    const tier = Math.min(5, kardashevLevel.value)
    const systemIndex = (state.value.systems?.length ?? 0)
    const seed = (state.value.prestigeCount ?? 0) * 10000 + systemIndex * 7 + 42
    const generated = generateSystem(seed, tier, starTypes)
    const sys: StarSystemState = {
      ...generated,
      status: 'undiscovered',
      planets: [],
      surveyProgress: 0,
      discoveredAt: Date.now(),
    }
    state.value.systems.push(sys)
  }

  return {
    allColonizedPlanets,
    allPlanets,
    totalStarCredits,
    totalStarCg,
    totalStarTrade,
    totalResearchSpeedBonus,
    totalSystemMaintenance,
    claimedSystemCount,
    totalStarCount,
    tickDiscovery,
    discoverNewSystem,
    getSystemTraitMod,
  }
}
