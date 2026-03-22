import type { MegastructureDefinition, RepeatableResearchDefinition, ResearchDefinition } from '~/types/game'

const researchTree: ResearchDefinition[] = [
  // =============================================
  // INDUSTRY BRANCH
  // =============================================
  {
    id: 'ind_automation',
    name: 'Automated Supply Chains',
    description: 'Fully automated logistics networks eliminate bottlenecks and drive continuous revenue growth.',
    icon: 'i-lucide-workflow',
    branch: 'industry',
    tier: 0,
    energyCost: 6000,
    researchTime: 30,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.15 }],
    unlockKardashev: 0
  },
  {
    id: 'ind_logistics',
    name: 'Interstellar Logistics',
    description: 'Coordinate supply chains across star systems for massive throughput gains.',
    icon: 'i-lucide-package-2',
    branch: 'industry',
    tier: 1,
    energyCost: 250000,
    researchTime: 60,
    prerequisites: ['ind_automation'],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.25 }],
    unlockKardashev: 1
  },
  {
    id: 'ind_nanofab',
    name: 'Nanofabrication',
    description: 'Molecular-scale manufacturing reduces material waste and building costs dramatically.',
    icon: 'i-lucide-microscope',
    branch: 'industry',
    tier: 2,
    energyCost: 2500000,
    researchTime: 120,
    prerequisites: ['ind_logistics'],
    effects: [{ type: 'multiplier', stat: 'buildingCostMultiplier', value: 0.85 }],
    unlockKardashev: 1
  },
  {
    id: 'ind_megascale',
    name: 'Megascale Engineering',
    description: 'Construction at stellar scales unlocks wonders of industry unimaginable to lesser civilizations.',
    icon: 'i-lucide-building',
    branch: 'industry',
    tier: 3,
    energyCost: 4e10,
    researchTime: 180,
    prerequisites: ['ind_nanofab'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.2 },
      { type: 'unlockMegastructure', megastructureId: 'stellar_forge' }
    ],
    unlockKardashev: 2
  },
  {
    id: 'ind_matter_prog',
    name: 'Programmable Matter',
    description: 'Matter that reconfigures itself on demand. Building costs plummet; possibilities become limitless.',
    icon: 'i-lucide-atom',
    branch: 'industry',
    tier: 4,
    energyCost: 6e20,
    researchTime: 300,
    prerequisites: ['ind_megascale'],
    effects: [
      { type: 'multiplier', stat: 'buildingCostMultiplier', value: 0.75 },
      { type: 'unlockMegastructure', megastructureId: 'matrioshka_brain' }
    ],
    unlockKardashev: 3
  },
  {
    id: 'ind_reality_fab',
    name: 'Reality Fabrication',
    description: 'Manufacture resources from the underlying substrate of reality itself. Credits flow like water.',
    icon: 'i-lucide-sparkles',
    branch: 'industry',
    tier: 5,
    energyCost: 1.2e31,
    researchTime: 600,
    prerequisites: ['ind_matter_prog'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'unlockMegastructure', megastructureId: 'genesis_engine' }
    ],
    unlockKardashev: 4
  },

  // =============================================
  // ENERGY BRANCH
  // =============================================
  {
    id: 'nrg_grid_opt',
    name: 'Grid Optimization',
    description: 'Advanced load-balancing algorithms squeeze maximum output from every energy source.',
    icon: 'i-lucide-activity',
    branch: 'energy',
    tier: 0,
    energyCost: 5000,
    researchTime: 30,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'energyMultiplier', value: 1.15 }],
    unlockKardashev: 0
  },
  {
    id: 'nrg_fusion_adv',
    name: 'Advanced Fusion',
    description: 'Next-generation fusion reactor designs achieve stable ignition with minimal fuel.',
    icon: 'i-lucide-flame',
    branch: 'energy',
    tier: 1,
    energyCost: 200000,
    researchTime: 60,
    prerequisites: ['nrg_grid_opt'],
    effects: [{ type: 'multiplier', stat: 'energyMultiplier', value: 1.25 }],
    unlockKardashev: 1
  },
  {
    id: 'nrg_antimatter',
    name: 'Antimatter Mastery',
    description: 'Safe production and containment of antimatter unlocks near-perfect energy conversion.',
    icon: 'i-lucide-flask-conical',
    branch: 'energy',
    tier: 2,
    energyCost: 2000000,
    researchTime: 120,
    prerequisites: ['nrg_fusion_adv'],
    effects: [{ type: 'multiplier', stat: 'energyMultiplier', value: 1.3 }],
    unlockKardashev: 1
  },
  {
    id: 'nrg_zero_point',
    name: 'Zero-Point Extraction',
    description: 'Tap the quantum vacuum itself. Energy from nothing — a civilization-defining breakthrough.',
    icon: 'i-lucide-zap',
    branch: 'energy',
    tier: 3,
    energyCost: 3e10,
    researchTime: 180,
    prerequisites: ['nrg_antimatter'],
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 1.5 },
      { type: 'unlockMegastructure', megastructureId: 'dyson_brain' }
    ],
    unlockKardashev: 2
  },
  {
    id: 'nrg_vacuum',
    name: 'Vacuum Engineering',
    description: 'Shape and manipulate the quantum vacuum at will, extracting boundless energy on demand.',
    icon: 'i-lucide-orbit',
    branch: 'energy',
    tier: 4,
    energyCost: 5e20,
    researchTime: 300,
    prerequisites: ['nrg_zero_point'],
    effects: [{ type: 'multiplier', stat: 'energyMultiplier', value: 1.75 }],
    unlockKardashev: 3
  },
  {
    id: 'nrg_entropy_rev',
    name: 'Entropy Mastery',
    description: 'Reverse thermodynamic entropy at will. The heat death of the universe is merely a suggestion.',
    icon: 'i-lucide-refresh-cw',
    branch: 'energy',
    tier: 5,
    energyCost: 1e31,
    researchTime: 600,
    prerequisites: ['nrg_vacuum'],
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 },
      { type: 'unlockMegastructure', megastructureId: 'cosmic_engine' }
    ],
    unlockKardashev: 4
  },
  {
    id: 'nrg_omega',
    name: 'Omega Energy',
    description: 'Harness the fundamental forces of existence. Energy output transcends all known limits.',
    icon: 'i-lucide-star',
    branch: 'energy',
    tier: 6,
    energyCost: 1.5e41,
    researchTime: 900,
    prerequisites: ['nrg_entropy_rev'],
    effects: [{ type: 'multiplier', stat: 'energyMultiplier', value: 3.0 }],
    unlockKardashev: 5
  },

  // Upkeep reduction research (energy branch)
  {
    id: 'nrg_efficiency_I',
    name: 'Power Grid Efficiency',
    description: 'Advanced power distribution reduces all building and megastructure upkeep by 10%.',
    icon: 'i-lucide-gauge',
    branch: 'energy',
    tier: 3,
    energyCost: 5e10,
    researchTime: 120,
    prerequisites: ['nrg_antimatter'],
    effects: [{ type: 'upkeepReduction', value: 0.9 }],
    unlockKardashev: 2
  },
  {
    id: 'nrg_efficiency_II',
    name: 'Superconducting Infrastructure',
    description: 'Lossless energy transmission slashes upkeep costs by an additional 15%.',
    icon: 'i-lucide-cable',
    branch: 'energy',
    tier: 4,
    energyCost: 8e10,
    researchTime: 240,
    prerequisites: ['nrg_efficiency_I', 'nrg_zero_point'],
    effects: [{ type: 'upkeepReduction', value: 0.85 }],
    unlockKardashev: 2
  },
  {
    id: 'nrg_efficiency_III',
    name: 'Thermodynamic Perfection',
    description: 'Near-zero waste processes reduce all upkeep costs by a further 20%.',
    icon: 'i-lucide-snowflake',
    branch: 'energy',
    tier: 5,
    energyCost: 5e11,
    researchTime: 480,
    prerequisites: ['nrg_efficiency_II'],
    effects: [{ type: 'upkeepReduction', value: 0.8 }],
    unlockKardashev: 2
  },

  // =============================================
  // SOCIETY BRANCH
  // =============================================
  {
    id: 'soc_education',
    name: 'Universal Education',
    description: 'Every citizen becomes a productive contributor. Population output surges across the board.',
    icon: 'i-lucide-graduation-cap',
    branch: 'society',
    tier: 0,
    energyCost: 5500,
    researchTime: 30,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'popMultiplier', value: 1.25 }],
    unlockKardashev: 0
  },
  {
    id: 'soc_cybernetics',
    name: 'Cybernetic Workforce',
    description: 'Augmented workers blur the line between human and machine, multiplying productivity.',
    icon: 'i-lucide-cpu',
    branch: 'society',
    tier: 1,
    energyCost: 220000,
    researchTime: 60,
    prerequisites: ['soc_education'],
    effects: [
      { type: 'multiplier', stat: 'popMultiplier', value: 1.3 },
      { type: 'multiplier', stat: 'clickMultiplier', value: 1.25 }
    ],
    unlockKardashev: 1
  },
  {
    id: 'soc_hive_mind',
    name: 'Hive-Mind Protocol',
    description: 'Collective consciousness eliminates inefficiency. The whole is far greater than its parts.',
    icon: 'i-lucide-network',
    branch: 'society',
    tier: 2,
    energyCost: 2200000,
    researchTime: 120,
    prerequisites: ['soc_cybernetics'],
    effects: [{ type: 'multiplier', stat: 'popMultiplier', value: 1.5 }],
    unlockKardashev: 1
  },
  {
    id: 'soc_uplift',
    name: 'Species Uplift',
    description: 'Accelerated cognitive enhancement transforms an entire species into hyper-capable operators.',
    icon: 'i-lucide-users',
    branch: 'society',
    tier: 3,
    energyCost: 3.5e10,
    researchTime: 180,
    prerequisites: ['soc_hive_mind'],
    effects: [
      { type: 'multiplier', stat: 'clickMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'popMultiplier', value: 1.25 }
    ],
    unlockKardashev: 2
  },
  {
    id: 'soc_transcend',
    name: 'Digital Transcendence',
    description: 'Consciousness migrates to pure information. Biological limits cease to exist.',
    icon: 'i-lucide-brain',
    branch: 'society',
    tier: 4,
    energyCost: 5.5e20,
    researchTime: 300,
    prerequisites: ['soc_uplift'],
    effects: [
      { type: 'multiplier', stat: 'popMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'clickMultiplier', value: 2.0 }
    ],
    unlockKardashev: 3
  },
  {
    id: 'soc_omega',
    name: 'Omega Consciousness',
    description: 'A unified cosmic mind encompassing all sapient life. Its will manifests as raw economic power.',
    icon: 'i-lucide-eye',
    branch: 'society',
    tier: 5,
    energyCost: 1.1e31,
    researchTime: 600,
    prerequisites: ['soc_transcend'],
    effects: [{ type: 'multiplier', stat: 'popMultiplier', value: 3.0 }],
    unlockKardashev: 4
  },

  // =============================================
  // EXOTIC BRANCH
  // =============================================
  {
    id: 'exo_xeno_arch',
    name: 'Xenoarchaeology',
    description: 'Ancient alien ruins yield lost technologies that boost both industry and energy generation.',
    icon: 'i-lucide-search',
    branch: 'exotic',
    tier: 0,
    energyCost: 180000,
    researchTime: 45,
    prerequisites: [],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.1 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 1.1 }
    ],
    unlockKardashev: 1
  },
  {
    id: 'exo_wormholes',
    name: 'Wormhole Theory',
    description: 'A theoretical framework for stable traversable wormholes accelerates all future research.',
    icon: 'i-lucide-circle-dashed',
    branch: 'exotic',
    tier: 1,
    energyCost: 2.5e10,
    researchTime: 90,
    prerequisites: ['exo_xeno_arch'],
    effects: [{ type: 'researchSpeed', value: 1.25 }],
    unlockKardashev: 2
  },
  {
    id: 'exo_dark_matter',
    name: 'Dark Matter Science',
    description: 'Understanding the invisible majority of the universe reveals extraordinary energy sources.',
    icon: 'i-lucide-moon',
    branch: 'exotic',
    tier: 2,
    energyCost: 5e10,
    researchTime: 150,
    prerequisites: ['exo_wormholes'],
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 1.5 },
      { type: 'unlockMegastructure', megastructureId: 'nidavellir_forge' }
    ],
    unlockKardashev: 2
  },
  {
    id: 'exo_dimension',
    name: 'Dimensional Physics',
    description: 'Access to extra dimensions opens untapped reservoirs of energy and commerce.',
    icon: 'i-lucide-layers',
    branch: 'exotic',
    tier: 3,
    energyCost: 4.5e20,
    researchTime: 240,
    prerequisites: ['exo_dark_matter'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 1.5 }
    ],
    unlockKardashev: 3
  },
  {
    id: 'exo_time_manip',
    name: 'Temporal Manipulation',
    description: 'Controlled time dilation accelerates research and turns every casino game in your favor.',
    icon: 'i-lucide-timer',
    branch: 'exotic',
    tier: 4,
    energyCost: 8e20,
    researchTime: 480,
    prerequisites: ['exo_dimension'],
    effects: [
      { type: 'researchSpeed', value: 1.5 },
      { type: 'multiplier', stat: 'casinoMultiplier', value: 1.25 }
    ],
    unlockKardashev: 4
  },
  {
    id: 'exo_reality',
    name: 'Reality Manipulation',
    description: 'Rewrite the laws of physics themselves. Credits and energy flow from a universe you control.',
    icon: 'i-lucide-wand',
    branch: 'exotic',
    tier: 5,
    energyCost: 1.5e31,
    researchTime: 900,
    prerequisites: ['exo_time_manip', 'nrg_omega'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 },
      { type: 'unlockMegastructure', megastructureId: 'reality_engine' }
    ],
    unlockKardashev: 5
  }
]

const megastructures: MegastructureDefinition[] = [
  {
    id: 'stellar_forge',
    name: 'Stellar Forge',
    description: 'A star-sized industrial complex forging megastructures from compressed stellar plasma.',
    icon: 'i-lucide-hammer',
    stages: 3,
    creditsCostPerStage: 50e9,
    energyCostPerStage: 1e11,
    buildTimePerStage: 120,
    requiredResearch: ['ind_megascale'],
    unlockKardashev: 2,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'buildingCostMultiplier', value: 0.8 }
    ],
    energyUpkeepPerSecond: 5e9,
    creditsUpkeepPerSecond: 2e9
  },
  {
    id: 'dyson_brain',
    name: 'Dyson Brain',
    description: 'A stellar-scale computronium shell converting an entire star\'s output into pure thought and power.',
    icon: 'i-lucide-brain-circuit',
    stages: 4,
    creditsCostPerStage: 200e9,
    energyCostPerStage: 5e11,
    buildTimePerStage: 180,
    requiredResearch: ['nrg_zero_point'],
    unlockKardashev: 2,
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'popMultiplier', value: 1.5 }
    ],
    energyUpkeepPerSecond: 2e10,
    creditsUpkeepPerSecond: 5e9
  },
  {
    id: 'nidavellir_forge',
    name: 'Nidavellir Forge',
    description: 'A neutron star compressed into a forge of impossible density, smelting exotic materials.',
    icon: 'i-lucide-anvil',
    stages: 3,
    creditsCostPerStage: 10e15,
    energyCostPerStage: 1e18,
    buildTimePerStage: 240,
    requiredResearch: ['exo_dark_matter'],
    unlockKardashev: 3,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 }
    ],
    energyUpkeepPerSecond: 5e17,
    creditsUpkeepPerSecond: 5e16
  },
  {
    id: 'matrioshka_brain',
    name: 'Matrioshka Brain',
    description: 'Nested Dyson spheres running the greatest computer ever built. A civilization-scale mind.',
    icon: 'i-lucide-server',
    stages: 5,
    creditsCostPerStage: 100e15,
    energyCostPerStage: 5e18,
    buildTimePerStage: 300,
    requiredResearch: ['ind_matter_prog', 'nrg_vacuum'],
    unlockKardashev: 3,
    effects: [
      { type: 'multiplier', stat: 'popMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'clickMultiplier', value: 2.0 },
      { type: 'researchSpeed', value: 2.0 }
    ],
    energyUpkeepPerSecond: 2e18,
    creditsUpkeepPerSecond: 2e17
  },
  {
    id: 'genesis_engine',
    name: 'Genesis Engine',
    description: 'A device capable of seeding entire star systems with life optimized for economic output.',
    icon: 'i-lucide-dna',
    stages: 4,
    creditsCostPerStage: 5e24,
    energyCostPerStage: 5e23,
    buildTimePerStage: 480,
    requiredResearch: ['ind_reality_fab'],
    unlockKardashev: 4,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 }
    ],
    energyUpkeepPerSecond: 5e23,
    creditsUpkeepPerSecond: 5e22
  },
  {
    id: 'cosmic_engine',
    name: 'Cosmic Engine',
    description: 'A universal-scale machine harnessing the expansion of spacetime itself as an energy source.',
    icon: 'i-lucide-globe',
    stages: 5,
    creditsCostPerStage: 50e24,
    energyCostPerStage: 5e26,
    buildTimePerStage: 600,
    requiredResearch: ['nrg_entropy_rev', 'exo_dimension'],
    unlockKardashev: 4,
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 3.0 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 }
    ],
    energyUpkeepPerSecond: 2e26,
    creditsUpkeepPerSecond: 5e24
  },
  {
    id: 'reality_engine',
    name: 'Reality Engine',
    description: 'The ultimate megastructure — a device that rewrites the physical constants of the universe for profit.',
    icon: 'i-lucide-infinity',
    stages: 6,
    creditsCostPerStage: 1e33,
    energyCostPerStage: 1e35,
    buildTimePerStage: 900,
    requiredResearch: ['exo_reality'],
    unlockKardashev: 5,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 5.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 5.0 },
      { type: 'multiplier', stat: 'clickMultiplier', value: 3.0 }
    ],
    energyUpkeepPerSecond: 5e34,
    creditsUpkeepPerSecond: 5e33
  },
  {
    id: 'omega_structure',
    name: 'Omega Structure',
    description: 'The ultimate construct — a device that transcends reality itself. Completing this is the pinnacle of civilization.',
    icon: 'i-lucide-hexagon',
    stages: 10,
    creditsCostPerStage: 1e36,
    energyCostPerStage: 1e38,
    buildTimePerStage: 1200,
    requiredResearch: ['exo_reality', 'ind_reality_fab', 'nrg_omega', 'soc_omega'],
    unlockKardashev: 5,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 10.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 10.0 },
      { type: 'multiplier', stat: 'popMultiplier', value: 5.0 }
    ],
    energyUpkeepPerSecond: 1e40,
    creditsUpkeepPerSecond: 1e38
  },
  {
    id: 'infinity_forge',
    name: 'Infinity Forge',
    description: 'A forge that operates outside of spacetime, producing infinite variations of matter and energy.',
    icon: 'i-lucide-flame',
    stages: 8,
    creditsCostPerStage: 5e39,
    energyCostPerStage: 5e41,
    buildTimePerStage: 600,
    requiredResearch: ['ind_reality_fab'],
    unlockKardashev: 6,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 3.0 },
      { type: 'upkeepReduction', value: 0.8 }
    ],
    energyUpkeepPerSecond: 1e42,
    creditsUpkeepPerSecond: 1e40
  },
  {
    id: 'chronosphere',
    name: 'Chronosphere',
    description: 'Manipulates the flow of time itself, accelerating all processes within its sphere of influence.',
    icon: 'i-lucide-clock',
    stages: 10,
    creditsCostPerStage: 1e42,
    energyCostPerStage: 1e44,
    buildTimePerStage: 900,
    requiredResearch: ['exo_reality'],
    unlockKardashev: 6,
    effects: [
      { type: 'researchSpeed', value: 3.0 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 }
    ],
    energyUpkeepPerSecond: 5e43,
    creditsUpkeepPerSecond: 5e41
  }
]

const repeatableResearch: RepeatableResearchDefinition[] = [
  {
    id: 'rep_industry',
    name: 'Advanced Manufacturing',
    description: '+5% Credits/s per level — endless industrial optimization',
    icon: 'i-lucide-factory',
    branch: 'industry',
    baseEnergyCost: 1e30,
    costScale: 2.0,
    baseResearchTime: 120,
    timeScale: 1.2,
    effect: { stat: 'creditsMultiplier', valuePerLevel: 1.05 }
  },
  {
    id: 'rep_energy',
    name: 'Power Optimization',
    description: '+5% Energy/s per level — infinite energy refinement',
    icon: 'i-lucide-zap',
    branch: 'energy',
    baseEnergyCost: 1e30,
    costScale: 2.0,
    baseResearchTime: 120,
    timeScale: 1.2,
    effect: { stat: 'energyMultiplier', valuePerLevel: 1.05 }
  },
  {
    id: 'rep_society',
    name: 'Workforce Expansion',
    description: '+5% Pop output per level — endless workforce growth',
    icon: 'i-lucide-users',
    branch: 'society',
    baseEnergyCost: 1e30,
    costScale: 2.0,
    baseResearchTime: 120,
    timeScale: 1.2,
    effect: { stat: 'popMultiplier', valuePerLevel: 1.05 }
  },
  {
    id: 'rep_exotic',
    name: 'Exotic Insights',
    description: '+2% all production per level — transcendent knowledge',
    icon: 'i-lucide-sparkles',
    branch: 'exotic',
    baseEnergyCost: 2e30,
    costScale: 2.5,
    baseResearchTime: 180,
    timeScale: 1.3,
    effect: { stat: 'creditsMultiplier', valuePerLevel: 1.02 }
  }
]

export function useResearchConfig() {
  return {
    researchTree: readonly(researchTree),
    megastructures: readonly(megastructures),
    repeatableResearchDefs: readonly(repeatableResearch)
  }
}
