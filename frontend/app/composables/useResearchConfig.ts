import type { MegastructureDefinition, ResearchDefinition } from '~/types/game'

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
    energyCost: 500,
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
    energyCost: 50000,
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
    energyCost: 500000,
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
    energyCost: 5e9,
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
    energyCost: 5e15,
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
    energyCost: 5e24,
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
    energyCost: 300,
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
    energyCost: 30000,
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
    energyCost: 300000,
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
    energyCost: 3e9,
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
    energyCost: 3e15,
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
    energyCost: 3e24,
    researchTime: 600,
    prerequisites: ['nrg_vacuum'],
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 3.0 },
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
    energyCost: 3e34,
    researchTime: 900,
    prerequisites: ['nrg_entropy_rev'],
    effects: [{ type: 'multiplier', stat: 'energyMultiplier', value: 6.0 }],
    unlockKardashev: 5
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
    energyCost: 400,
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
    energyCost: 40000,
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
    energyCost: 400000,
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
    energyCost: 4e9,
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
    energyCost: 4e15,
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
    energyCost: 4e24,
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
    energyCost: 20000,
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
    energyCost: 2e9,
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
    energyCost: 20e9,
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
    energyCost: 2e15,
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
    energyCost: 2e24,
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
    energyCost: 2e34,
    researchTime: 900,
    prerequisites: ['exo_time_manip', 'nrg_omega'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 6.0 },
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
    energyCostPerStage: 5e9,
    buildTimePerStage: 120,
    requiredResearch: ['ind_megascale'],
    unlockKardashev: 2,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'buildingCostMultiplier', value: 0.8 }
    ]
  },
  {
    id: 'dyson_brain',
    name: 'Dyson Brain',
    description: 'A stellar-scale computronium shell converting an entire star\'s output into pure thought and power.',
    icon: 'i-lucide-brain-circuit',
    stages: 4,
    creditsCostPerStage: 200e9,
    energyCostPerStage: 50e9,
    buildTimePerStage: 180,
    requiredResearch: ['nrg_zero_point'],
    unlockKardashev: 2,
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'popMultiplier', value: 1.5 }
    ]
  },
  {
    id: 'nidavellir_forge',
    name: 'Nidavellir Forge',
    description: 'A neutron star compressed into a forge of impossible density, smelting exotic materials.',
    icon: 'i-lucide-anvil',
    stages: 3,
    creditsCostPerStage: 10e15,
    energyCostPerStage: 1e15,
    buildTimePerStage: 240,
    requiredResearch: ['exo_dark_matter'],
    unlockKardashev: 3,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 }
    ]
  },
  {
    id: 'matrioshka_brain',
    name: 'Matrioshka Brain',
    description: 'Nested Dyson spheres running the greatest computer ever built. A civilization-scale mind.',
    icon: 'i-lucide-server',
    stages: 5,
    creditsCostPerStage: 100e15,
    energyCostPerStage: 10e15,
    buildTimePerStage: 300,
    requiredResearch: ['ind_matter_prog', 'nrg_vacuum'],
    unlockKardashev: 3,
    effects: [
      { type: 'multiplier', stat: 'popMultiplier', value: 3.0 },
      { type: 'multiplier', stat: 'clickMultiplier', value: 3.0 },
      { type: 'researchSpeed', value: 2.0 }
    ]
  },
  {
    id: 'genesis_engine',
    name: 'Genesis Engine',
    description: 'A device capable of seeding entire star systems with life optimized for economic output.',
    icon: 'i-lucide-dna',
    stages: 4,
    creditsCostPerStage: 5e24,
    energyCostPerStage: 500e21,
    buildTimePerStage: 480,
    requiredResearch: ['ind_reality_fab'],
    unlockKardashev: 4,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 6.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 2.0 }
    ]
  },
  {
    id: 'cosmic_engine',
    name: 'Cosmic Engine',
    description: 'A universal-scale machine harnessing the expansion of spacetime itself as an energy source.',
    icon: 'i-lucide-globe',
    stages: 5,
    creditsCostPerStage: 50e24,
    energyCostPerStage: 5e24,
    buildTimePerStage: 600,
    requiredResearch: ['nrg_entropy_rev', 'exo_dimension'],
    unlockKardashev: 4,
    effects: [
      { type: 'multiplier', stat: 'energyMultiplier', value: 11.0 }
    ]
  },
  {
    id: 'reality_engine',
    name: 'Reality Engine',
    description: 'The ultimate megastructure — a device that rewrites the physical constants of the universe for profit.',
    icon: 'i-lucide-infinity',
    stages: 6,
    creditsCostPerStage: 1e33,
    energyCostPerStage: 100e30,
    buildTimePerStage: 900,
    requiredResearch: ['exo_reality'],
    unlockKardashev: 5,
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 21.0 },
      { type: 'multiplier', stat: 'energyMultiplier', value: 21.0 },
      { type: 'multiplier', stat: 'clickMultiplier', value: 6.0 }
    ]
  }
]

export function useResearchConfig() {
  return {
    researchTree: readonly(researchTree),
    megastructures: readonly(megastructures)
  }
}
