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
    researchCost: 6000,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.15 }],

  },
  {
    id: 'ind_supply_chains',
    name: 'Supply Chain Optimization',
    description: 'Streamlined logistics boost consumer goods output.',
    icon: 'i-lucide-package-check',
    branch: 'industry',
    tier: 0,
    researchCost: 500,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'cgMultiplier', value: 1.15 }],

  },
  {
    id: 'ind_logistics',
    name: 'Interstellar Logistics',
    description: 'Coordinate supply chains across star systems for massive throughput gains.',
    icon: 'i-lucide-package-2',
    branch: 'industry',
    tier: 1,
    researchCost: 250000,
    prerequisites: ['ind_automation'],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.25 }],

  },
  {
    id: 'ind_mass_production',
    name: 'Mass Production',
    description: 'Assembly line automation doubles throughput.',
    icon: 'i-lucide-factory',
    branch: 'industry',
    tier: 1,
    researchCost: 5e4,
    prerequisites: ['ind_supply_chains'],
    effects: [{ type: 'multiplier', stat: 'cgMultiplier', value: 1.25 }],

  },
  {
    id: 'ind_nanofab',
    name: 'Nanofabrication',
    description: 'Molecular-scale manufacturing reduces material waste and building costs dramatically.',
    icon: 'i-lucide-microscope',
    branch: 'industry',
    tier: 2,
    researchCost: 2500000,
    prerequisites: ['ind_logistics'],
    effects: [{ type: 'multiplier', stat: 'divisionCostMultiplier', value: 0.85 }],

  },
  {
    id: 'ind_megascale',
    name: 'Megascale Engineering',
    description: 'Construction at stellar scales unlocks wonders of industry unimaginable to lesser civilizations.',
    icon: 'i-lucide-building',
    branch: 'industry',
    tier: 3,
    researchCost: 4e10,
    prerequisites: ['ind_nanofab'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.2 },
      { type: 'unlockMegastructure', megastructureId: 'stellar_forge' }
    ],

  },
  {
    id: 'ind_nano_assembly',
    name: 'Nano-Assembly',
    description: 'Molecular-scale manufacturing with zero waste. Unlocks the Universal Replicator megastructure.',
    icon: 'i-lucide-microscope',
    branch: 'industry',
    tier: 3,
    researchCost: 5e13,
    prerequisites: ['ind_mass_production'],
    effects: [
      { type: 'multiplier', stat: 'cgMultiplier', value: 1.5 },
      { type: 'unlockMegastructure', megastructureId: 'universal_replicator' }
    ],

  },
  {
    id: 'ind_matter_prog',
    name: 'Programmable Matter',
    description: 'Matter that reconfigures itself on demand. Building costs plummet; possibilities become limitless.',
    icon: 'i-lucide-atom',
    branch: 'industry',
    tier: 4,
    researchCost: 6e20,
    prerequisites: ['ind_megascale'],
    effects: [
      { type: 'multiplier', stat: 'divisionCostMultiplier', value: 0.75 },
      { type: 'unlockMegastructure', megastructureId: 'matrioshka_brain' }
    ],

  },
  {
    id: 'ind_reality_fab',
    name: 'Reality Fabrication',
    description: 'Manufacture resources from the underlying substrate of reality itself. Credits flow like water.',
    icon: 'i-lucide-sparkles',
    branch: 'industry',
    tier: 5,
    researchCost: 1.2e31,
    prerequisites: ['ind_matter_prog'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'unlockMegastructure', megastructureId: 'genesis_engine' }
    ],

  },

  {
    id: 'ind_reality_forge',
    name: 'Reality Forge',
    description: 'Fabricate consumer goods from raw spacetime. Unlocks the Omnifabricator megastructure.',
    icon: 'i-lucide-wand-sparkles',
    branch: 'industry',
    tier: 5,
    researchCost: 5e29,
    prerequisites: ['ind_nano_assembly'],
    effects: [
      { type: 'multiplier', stat: 'cgMultiplier', value: 2.0 },
      { type: 'unlockMegastructure', megastructureId: 'omnifabricator' }
    ],

  },

  // ── TRADE (Industry branch) ──
  {
    id: 'trade_fundamentals',
    name: 'Trade Fundamentals',
    description: 'Establish basic trade routes between your holdings. +15% trade capacity.',
    icon: 'i-lucide-handshake',
    branch: 'industry',
    tier: 0,
    researchCost: 4000,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'tradeMultiplier', value: 1.15 }],

  },
  {
    id: 'trade_consumer_policy',
    name: 'Consumer Trade Networks',
    description: 'Route trade into consumer goods production. +10% trade capacity. Unlocks Consumer Benefits policy.',
    icon: 'i-lucide-package-check',
    branch: 'industry',
    tier: 1,
    researchCost: 1e5,
    prerequisites: ['trade_fundamentals'],
    effects: [{ type: 'multiplier', stat: 'tradeMultiplier', value: 1.10 }],

  },
  {
    id: 'trade_energy_policy',
    name: 'Energy Trade Subsidies',
    description: 'Subsidize energy production through trade. +10% trade capacity. Unlocks Energy Subsidies policy.',
    icon: 'i-lucide-zap',
    branch: 'industry',
    tier: 1,
    researchCost: 1e5,
    prerequisites: ['trade_fundamentals'],
    effects: [{ type: 'multiplier', stat: 'tradeMultiplier', value: 1.10 }],

  },
  {
    id: 'trade_balanced_policy',
    name: 'Balanced Trade Agreement',
    description: 'A comprehensive trade framework distributing value evenly. +25% trade capacity. Unlocks Balanced Economy policy.',
    icon: 'i-lucide-scale',
    branch: 'industry',
    tier: 2,
    researchCost: 2e6,
    prerequisites: ['trade_consumer_policy', 'trade_energy_policy'],
    effects: [{ type: 'multiplier', stat: 'tradeMultiplier', value: 1.25 }],

  },
  {
    id: 'trade_mastery',
    name: 'Trade Mastery',
    description: 'Total mastery of interstellar commerce. +50% trade capacity.',
    icon: 'i-lucide-crown',
    branch: 'industry',
    tier: 3,
    researchCost: 5e10,
    prerequisites: ['trade_balanced_policy'],
    effects: [{ type: 'multiplier', stat: 'tradeMultiplier', value: 1.50 }],

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
    researchCost: 5000,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.15 }],

  },
  {
    id: 'nrg_fusion_adv',
    name: 'Advanced Fusion',
    description: 'Next-generation fusion reactor designs achieve stable ignition with minimal fuel.',
    icon: 'i-lucide-flame',
    branch: 'energy',
    tier: 1,
    researchCost: 200000,
    prerequisites: ['nrg_grid_opt'],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.25 }],

  },
  {
    id: 'nrg_antimatter',
    name: 'Antimatter Mastery',
    description: 'Safe production and containment of antimatter unlocks near-perfect energy conversion.',
    icon: 'i-lucide-flask-conical',
    branch: 'energy',
    tier: 2,
    researchCost: 2000000,
    prerequisites: ['nrg_fusion_adv'],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.3 }],

  },
  {
    id: 'nrg_zero_point',
    name: 'Zero-Point Extraction',
    description: 'Tap the quantum vacuum itself. Energy from nothing — a civilization-defining breakthrough.',
    icon: 'i-lucide-zap',
    branch: 'energy',
    tier: 3,
    researchCost: 3e10,
    prerequisites: ['nrg_antimatter'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'unlockMegastructure', megastructureId: 'dyson_brain' }
    ],

  },
  {
    id: 'nrg_vacuum',
    name: 'Vacuum Engineering',
    description: 'Shape and manipulate the quantum vacuum at will, extracting boundless energy on demand.',
    icon: 'i-lucide-orbit',
    branch: 'energy',
    tier: 4,
    researchCost: 5e20,
    prerequisites: ['nrg_zero_point'],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 1.75 }],

  },
  {
    id: 'nrg_entropy_rev',
    name: 'Entropy Mastery',
    description: 'Reverse thermodynamic entropy at will. The heat death of the universe is merely a suggestion.',
    icon: 'i-lucide-refresh-cw',
    branch: 'energy',
    tier: 5,
    researchCost: 1e31,
    prerequisites: ['nrg_vacuum'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'unlockMegastructure', megastructureId: 'cosmic_engine' }
    ],

  },
  {
    id: 'nrg_omega',
    name: 'Omega Energy',
    description: 'Harness the fundamental forces of existence. Energy output transcends all known limits.',
    icon: 'i-lucide-star',
    branch: 'energy',
    tier: 6,
    researchCost: 1.5e41,
    prerequisites: ['nrg_entropy_rev'],
    effects: [{ type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 }],

  },

  // Upkeep reduction research (energy branch)
  {
    id: 'nrg_efficiency_I',
    name: 'Power Grid Efficiency',
    description: 'Advanced power distribution reduces all building and megastructure upkeep by 10%.',
    icon: 'i-lucide-gauge',
    branch: 'energy',
    tier: 3,
    researchCost: 5e10,
    prerequisites: ['nrg_antimatter'],
    effects: [{ type: 'maintenanceReduction', value: 0.9 }],

  },
  {
    id: 'nrg_efficiency_II',
    name: 'Superconducting Infrastructure',
    description: 'Lossless energy transmission slashes upkeep costs by an additional 15%.',
    icon: 'i-lucide-cable',
    branch: 'energy',
    tier: 4,
    researchCost: 8e10,
    prerequisites: ['nrg_efficiency_I', 'nrg_zero_point'],
    effects: [{ type: 'maintenanceReduction', value: 0.85 }],

  },
  {
    id: 'nrg_efficiency_III',
    name: 'Thermodynamic Perfection',
    description: 'Near-zero waste processes reduce all upkeep costs by a further 20%.',
    icon: 'i-lucide-snowflake',
    branch: 'energy',
    tier: 5,
    researchCost: 5e11,
    prerequisites: ['nrg_efficiency_II'],
    effects: [{ type: 'maintenanceReduction', value: 0.8 }],

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
    researchCost: 5500,
    prerequisites: [],
    effects: [{ type: 'multiplier', stat: 'workerOutputMultiplier', value: 1.25 }],

  },
  {
    id: 'soc_cybernetics',
    name: 'Cybernetic Workforce',
    description: 'Augmented workers blur the line between human and machine, multiplying productivity.',
    icon: 'i-lucide-cpu',
    branch: 'society',
    tier: 1,
    researchCost: 220000,
    prerequisites: ['soc_education'],
    effects: [
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 1.3 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.1 }
    ],

  },
  {
    id: 'soc_hive_mind',
    name: 'Hive-Mind Protocol',
    description: 'Collective consciousness eliminates inefficiency. The whole is far greater than its parts.',
    icon: 'i-lucide-network',
    branch: 'society',
    tier: 2,
    researchCost: 2200000,
    prerequisites: ['soc_cybernetics'],
    effects: [{ type: 'multiplier', stat: 'workerOutputMultiplier', value: 1.5 }],

  },
  {
    id: 'soc_uplift',
    name: 'Species Uplift',
    description: 'Accelerated cognitive enhancement transforms an entire species into hyper-capable operators.',
    icon: 'i-lucide-users',
    branch: 'society',
    tier: 3,
    researchCost: 3.5e10,
    prerequisites: ['soc_hive_mind'],
    effects: [
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.1 }
    ],

  },
  {
    id: 'soc_transcend',
    name: 'Digital Transcendence',
    description: 'Consciousness migrates to pure information. Biological limits cease to exist.',
    icon: 'i-lucide-brain',
    branch: 'society',
    tier: 4,
    researchCost: 5.5e20,
    prerequisites: ['soc_uplift'],
    effects: [
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.25 }
    ],

  },
  {
    id: 'soc_omega',
    name: 'Omega Consciousness',
    description: 'A unified cosmic mind encompassing all sapient life. Its will manifests as raw economic power.',
    icon: 'i-lucide-eye',
    branch: 'society',
    tier: 5,
    researchCost: 1.1e31,
    prerequisites: ['soc_transcend'],
    effects: [{ type: 'multiplier', stat: 'workerOutputMultiplier', value: 3.0 }],

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
    researchCost: 180000,
    prerequisites: [],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.1 },
      { type: 'multiplier', stat: 'tradeMultiplier', value: 1.1 }
    ],

  },
  {
    id: 'exo_wormholes',
    name: 'Wormhole Theory',
    description: 'A theoretical framework for stable traversable wormholes accelerates all future research.',
    icon: 'i-lucide-circle-dashed',
    branch: 'exotic',
    tier: 1,
    researchCost: 2.5e10,
    prerequisites: ['exo_xeno_arch'],
    effects: [{ type: 'researchSpeed', value: 1.25 }],

  },
  {
    id: 'exo_dark_matter',
    name: 'Dark Matter Science',
    description: 'Understanding the invisible majority of the universe reveals extraordinary energy sources.',
    icon: 'i-lucide-moon',
    branch: 'exotic',
    tier: 2,
    researchCost: 5e10,
    prerequisites: ['exo_wormholes'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'unlockMegastructure', megastructureId: 'nidavellir_forge' }
    ],

  },
  {
    id: 'exo_dimension',
    name: 'Dimensional Physics',
    description: 'Access to extra dimensions opens untapped reservoirs of energy and commerce.',
    icon: 'i-lucide-layers',
    branch: 'exotic',
    tier: 3,
    researchCost: 4.5e20,
    prerequisites: ['exo_dark_matter'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'tradeMultiplier', value: 1.5 }
    ],

  },
  {
    id: 'exo_time_manip',
    name: 'Temporal Manipulation',
    description: 'Controlled time dilation accelerates research and turns every casino game in your favor.',
    icon: 'i-lucide-timer',
    branch: 'exotic',
    tier: 4,
    researchCost: 8e20,
    prerequisites: ['exo_dimension'],
    effects: [
      { type: 'researchSpeed', value: 1.5 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.25 }
    ],

  },
  {
    id: 'exo_reality',
    name: 'Reality Manipulation',
    description: 'Rewrite the laws of physics themselves. Credits and energy flow from a universe you control.',
    icon: 'i-lucide-wand',
    branch: 'exotic',
    tier: 5,
    researchCost: 1.5e31,
    prerequisites: ['exo_time_manip', 'nrg_omega'],
    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 },
      { type: 'unlockMegastructure', megastructureId: 'reality_engine' }
    ],

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
    requiredResearch: ['ind_megascale'],


    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 1.5 },
      { type: 'multiplier', stat: 'divisionCostMultiplier', value: 0.8 }
    ],
    creditsUpkeepPerSecond: 2e9,
    cgUpkeepPerSecond: 1e6
  },
  {
    id: 'dyson_brain',
    name: 'Dyson Brain',
    description: 'A stellar-scale computronium shell converting an entire star\'s output into pure thought and power.',
    icon: 'i-lucide-brain-circuit',
    stages: 4,
    creditsCostPerStage: 200e9,
    requiredResearch: ['nrg_zero_point'],


    effects: [
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 2.0 }
    ],
    creditsUpkeepPerSecond: 5e9,
    cgUpkeepPerSecond: 2e6
  },
  {
    id: 'nidavellir_forge',
    name: 'Nidavellir Forge',
    description: 'A neutron star compressed into a forge of impossible density, smelting exotic materials.',
    icon: 'i-lucide-anvil',
    stages: 3,
    creditsCostPerStage: 10e15,
    requiredResearch: ['exo_dark_matter'],


    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'tradeMultiplier', value: 1.5 }
    ],
    creditsUpkeepPerSecond: 5e16,
    cgUpkeepPerSecond: 5e12
  },
  {
    id: 'matrioshka_brain',
    name: 'Matrioshka Brain',
    description: 'Nested Dyson spheres running the greatest computer ever built. A civilization-scale mind.',
    icon: 'i-lucide-server',
    stages: 5,
    creditsCostPerStage: 100e15,
    requiredResearch: ['ind_matter_prog', 'nrg_vacuum'],


    effects: [
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 2.0 },
      { type: 'researchSpeed', value: 2.0 }
    ],
    creditsUpkeepPerSecond: 2e17,
    cgUpkeepPerSecond: 1e13
  },
  {
    id: 'genesis_engine',
    name: 'Genesis Engine',
    description: 'A device capable of seeding entire star systems with life optimized for economic output.',
    icon: 'i-lucide-dna',
    stages: 4,
    creditsCostPerStage: 5e24,
    requiredResearch: ['ind_reality_fab'],


    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 },
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 2.0 }
    ],
    creditsUpkeepPerSecond: 5e22,
    cgUpkeepPerSecond: 5e19
  },
  {
    id: 'cosmic_engine',
    name: 'Cosmic Engine',
    description: 'A universal-scale machine harnessing the expansion of spacetime itself as an energy source.',
    icon: 'i-lucide-globe',
    stages: 5,
    creditsCostPerStage: 50e24,
    requiredResearch: ['nrg_entropy_rev', 'exo_dimension'],


    effects: [
      { type: 'multiplier', stat: 'tradeMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 }
    ],
    creditsUpkeepPerSecond: 5e24,
    cgUpkeepPerSecond: 2e20
  },
  {
    id: 'reality_engine',
    name: 'Reality Engine',
    description: 'The ultimate megastructure — a device that rewrites the physical constants of the universe for profit.',
    icon: 'i-lucide-infinity',
    stages: 6,
    creditsCostPerStage: 1e33,
    requiredResearch: ['exo_reality'],


    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 5.0 },
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 3.0 }
    ],
    creditsUpkeepPerSecond: 5e33,
    cgUpkeepPerSecond: 5e27
  },
  {
    id: 'omega_structure',
    name: 'Omega Structure',
    description: 'The ultimate construct — a device that transcends reality itself. Completing this is the pinnacle of civilization.',
    icon: 'i-lucide-hexagon',
    stages: 10,
    creditsCostPerStage: 1e36,
    requiredResearch: ['exo_reality', 'ind_reality_fab', 'nrg_omega', 'soc_omega'],


    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 10.0 },
      { type: 'multiplier', stat: 'workerOutputMultiplier', value: 5.0 }
    ],
    creditsUpkeepPerSecond: 1e38,
    cgUpkeepPerSecond: 1e29
  },
  {
    id: 'universal_replicator',
    name: 'Universal Replicator',
    description: 'A megastructure that replicates any consumer good at molecular precision. Supplies entire civilizations from a single station.',
    icon: 'i-lucide-copy',
    stages: 5,
    creditsCostPerStage: 1e27,
    requiredResearch: ['ind_nano_assembly'],


    effects: [
      { type: 'multiplier', stat: 'cgMultiplier', value: 5.0 },
      { type: 'maintenanceReduction', value: 0.7 }
    ],
    creditsUpkeepPerSecond: 5e25,
    cgUpkeepPerSecond: 5e19
  },
  {
    id: 'omnifabricator',
    name: 'Omnifabricator',
    description: 'Weaves consumer goods from the quantum foam of spacetime. Demand is a concept that no longer applies.',
    icon: 'i-lucide-sparkles',
    stages: 8,
    creditsCostPerStage: 1e36,
    requiredResearch: ['ind_reality_forge'],


    effects: [
      { type: 'multiplier', stat: 'cgMultiplier', value: 10.0 },
      { type: 'maintenanceReduction', value: 0.5 }
    ],
    creditsUpkeepPerSecond: 5e35,
    cgUpkeepPerSecond: 5e28
  },
  {
    id: 'infinity_forge',
    name: 'Infinity Forge',
    description: 'A forge that operates outside of spacetime, producing infinite variations of matter and energy.',
    icon: 'i-lucide-flame',
    stages: 8,
    creditsCostPerStage: 5e39,
    requiredResearch: ['ind_reality_fab'],


    effects: [
      { type: 'multiplier', stat: 'creditsMultiplier', value: 3.0 },
      { type: 'multiplier', stat: 'cgMultiplier', value: 2.0 },
      { type: 'maintenanceReduction', value: 0.8 }
    ],
    creditsUpkeepPerSecond: 1e40,
    cgUpkeepPerSecond: 1e37
  },
  {
    id: 'chronosphere',
    name: 'Chronosphere',
    description: 'Manipulates the flow of time itself, accelerating all processes within its sphere of influence.',
    icon: 'i-lucide-clock',
    stages: 10,
    creditsCostPerStage: 1e42,
    requiredResearch: ['exo_reality'],


    effects: [
      { type: 'researchSpeed', value: 3.0 },
      { type: 'multiplier', stat: 'creditsMultiplier', value: 2.0 },
      { type: 'multiplier', stat: 'tradeMultiplier', value: 2.0 }
    ],
    creditsUpkeepPerSecond: 5e41,
    cgUpkeepPerSecond: 5e37
  }
]

const repeatableResearch: RepeatableResearchDefinition[] = [
  { id: 'rep_credits', name: 'Advanced Revenue Systems', description: '+5% ₢ production per level', icon: 'i-lucide-banknote', branch: 'industry', baseResearchCost: 1e4, costScale: 1.5, effect: { stat: 'creditsMultiplier', valuePerLevel: 1.05 } },
  { id: 'rep_cg', name: 'Logistics Optimization', description: '+5% CG production per level', icon: 'i-lucide-package', branch: 'industry', baseResearchCost: 1e4, costScale: 1.5, effect: { stat: 'cgMultiplier', valuePerLevel: 1.05 } },
  { id: 'rep_workers', name: 'Workforce Enhancement', description: '+5% worker output per level', icon: 'i-lucide-users', branch: 'society', baseResearchCost: 1.5e4, costScale: 1.5, effect: { stat: 'workerOutputMultiplier', valuePerLevel: 1.05 } },
  { id: 'rep_trade', name: 'Trade Optimization', description: '+5% trade value per level', icon: 'i-lucide-handshake', branch: 'industry', baseResearchCost: 1e4, costScale: 1.5, effect: { stat: 'tradeMultiplier', valuePerLevel: 1.05 } },
  { id: 'rep_growth', name: 'Colonial Genetics', description: '+3% pop growth per level', icon: 'i-lucide-trending-up', branch: 'society', baseResearchCost: 1.2e4, costScale: 1.5, effect: { stat: 'popGrowthMultiplier', valuePerLevel: 1.03 } },
  { id: 'rep_division_cost', name: 'Construction Efficiency', description: '-3% division costs per level', icon: 'i-lucide-hard-hat', branch: 'industry', baseResearchCost: 1.5e4, costScale: 1.6, effect: { stat: 'divisionCostMultiplier', valuePerLevel: 0.97 } },
  { id: 'rep_maintenance', name: 'Maintenance Protocols', description: '-3% maintenance per level', icon: 'i-lucide-wrench', branch: 'energy', baseResearchCost: 1.5e4, costScale: 1.6, effect: { stat: 'maintenanceReduction', valuePerLevel: 0.97 } },
  { id: 'rep_exotic', name: 'Exotic Insights', description: '+2% all production per level', icon: 'i-lucide-sparkles', branch: 'exotic', baseResearchCost: 5e4, costScale: 2.0, effect: { stat: 'allProductionMultiplier', valuePerLevel: 1.02 } },
  { id: 'rep_research', name: 'Research Amplification', description: '+5% RP per level', icon: 'i-lucide-flask-conical', branch: 'society', baseResearchCost: 1.5e4, costScale: 1.5, effect: { stat: 'researchMultiplier', valuePerLevel: 1.05 } },
]

export function useResearchConfig() {
  return {
    researchTree: readonly(researchTree),
    megastructures: readonly(megastructures),
    repeatableResearchDefs: readonly(repeatableResearch)
  }
}
