import type { StarSystemState, GeneratedStar, GeneratedPlanet, StarType } from '~/types/galaxy'
import type { PlanetType, PlanetSize } from '~/types/planet'
import {
  BASE_SURVEY_TIME,
  SURVEY_TIME_PER_TIER,
  BASE_SURVEY_COST,
  BASE_CLAIM_COST,
  COST_SCALE_PER_TIER,
  STAR_OUTPUT_SCALE_PER_TIER,
  seededRandom,
} from '~/composables/useGalaxyConfig'

const allPlanetTypes: PlanetType[] = ['garden', 'volcanic', 'ocean', 'desert', 'ice', 'barren', 'gaia']
const allPlanetTraitIds = ['mineral_rich', 'lush_biosphere', 'hostile_atmosphere', 'trade_hub', 'industrial_deposits', 'low_gravity', 'extreme_weather', 'ancient_ruins']
const allTraitIds = ['mineral_rich', 'nebula', 'pirate_activity', 'ancient_gateway', 'resource_poor', 'pristine']

const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Sigma', 'Omega', 'Nova', 'Proxima', 'Tau', 'Kepler', 'Vega', 'Rigel', 'Altair', 'Deneb', 'Sirius', 'Polaris', 'Arcturus']
const suffixes = ['Prime', 'Major', 'Minor', 'Reach', 'Expanse', 'Nebula', 'Cluster', 'Haven', 'Deep', 'Frontier']
const planetNames = ['Terra', 'Aethon', 'Kronos', 'Helios', 'Cryos', 'Magmus', 'Oceanus', 'Eden', 'Tartarus', 'Elysium', 'Vulcan', 'Thalassa', 'Boreas', 'Nyx', 'Gaia']

function pickWeightedStarType(rng: () => number, starTypeDefs: readonly { type: StarType; rarity: number }[]): StarType {
  const totalWeight = starTypeDefs.reduce((sum, s) => sum + s.rarity, 0)
  let roll = rng() * totalWeight
  for (const s of starTypeDefs) {
    roll -= s.rarity
    if (roll <= 0) return s.type
  }
  return 'yellow_dwarf'
}

export function generateSystem(
  seed: number,
  tier: number,
  starTypeDefs: readonly { type: StarType; rarity: number; baseOutput: { credits: number; cg: number; trade: number; rp: number }; maintenanceCost: number }[]
): Omit<StarSystemState, 'status' | 'planets' | 'surveyProgress' | 'discoveredAt' | 'x' | 'y' | 'edges'> {
  const rng = seededRandom(seed)
  const tierScale = Math.pow(STAR_OUTPUT_SCALE_PER_TIER, tier)

  // Name
  const prefix = prefixes[Math.floor(rng() * prefixes.length)]!
  const name = rng() > 0.5
    ? `${prefix} ${suffixes[Math.floor(rng() * suffixes.length)]!}`
    : `${prefix}-${Math.floor(rng() * 900 + 100)}`

  // Stars: 1-5
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
        rp: def.baseOutput.rp * (1 + tier * 0.3),
      },
      maintenanceCost: def.maintenanceCost * tierScale * 0.3,
    })
  }

  // Planets: 0-2
  const planetSlots: GeneratedPlanet[] = []
  for (let i = 0; i < 2; i++) {
    if (rng() < 0.3 + tier * 0.05) {
      const pType = allPlanetTypes[Math.floor(rng() * allPlanetTypes.length)]!
      const sizeRoll = rng()
      const pSize: PlanetSize = sizeRoll < 0.3 ? 'small' : sizeRoll < 0.75 ? 'medium' : 'large'
      const traitCount = rng() < 0.3 ? 0 : rng() < 0.7 ? 1 : 2
      const traits: string[] = []
      const shuffled = [...allPlanetTraitIds].sort(() => rng() - 0.5)
      for (let t = 0; t < traitCount && t < shuffled.length; t++) traits.push(shuffled[t]!)

      const pName = rng() > 0.6
        ? `${name} ${['I', 'II'][i] ?? String(i + 1)}`
        : planetNames[Math.floor(rng() * planetNames.length)]!

      planetSlots.push({
        type: pType, size: pSize, traits, colonized: false,
        colonyCost: Math.floor(BASE_CLAIM_COST * tierScale * (1 + rng() * 0.5)),
        name: pName,
      })
    }
  }

  // System traits: 0-2
  const systemTraitCount = rng() < 0.4 ? 0 : rng() < 0.7 ? 1 : 2
  const shuffledTraits = [...allTraitIds].sort(() => rng() - 0.5)
  const traits = shuffledTraits.slice(0, systemTraitCount)

  return {
    id: `sys_${seed}`,
    seed,
    tier,
    stars,
    planetSlots,
    traits,
    surveyTime: BASE_SURVEY_TIME + SURVEY_TIME_PER_TIER * tier,
    surveyCost: Math.floor(BASE_SURVEY_COST * Math.pow(COST_SCALE_PER_TIER, tier)),
    claimCost: Math.floor(BASE_CLAIM_COST * Math.pow(COST_SCALE_PER_TIER, tier)),
    name,
  }
}

// ── Create full galaxy from seed ──

export function createGalaxy(masterSeed: number): StarSystemState[] {
  const { starTypes } = useGalaxyConfig()
  const galaxy = generateGalaxy(masterSeed)
  const systems: StarSystemState[] = []

  for (const node of galaxy.nodes) {
    const generated = generateSystem(node.seed, node.tier, starTypes)
    const isHome = node.id === galaxy.homeId

    systems.push({
      ...generated,
      id: node.id,
      status: isHome ? 'claimed' : 'undiscovered',
      planets: isHome ? [{
        definitionId: 'homeworld',
        name: 'Homeworld',
        type: 'garden',
        size: 'medium',
        traits: [],
        pops: 2,
        divisions: [
          { type: 'mining', level: 1 },
          { type: 'industrial', level: 1 },
          { type: 'administrative', level: 1 },
          null,
        ],
        policy: 'balanced',
      }] : [],
      surveyProgress: 0,
      discoveredAt: 0,
      x: node.x,
      y: node.y,
      edges: node.edges,
    })
  }

  return systems
}
