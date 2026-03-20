import type { BuildingDefinition, ClickUpgradeDefinition, KardashevLevel, PrestigeUpgradeDefinition, RepeatablePrestigeUpgrade } from '~/types/game'

// Real Kardashev scale: ~10^10 ratio between each level
// Energy unit: TW (terawatts). Type I ≈ 10^4 TW/s

const buildings: BuildingDefinition[] = [
  // =============================================
  // TYPE 0 — Sub-planetary civilization
  // =============================================

  // Credits
  {
    id: 'mining_drone',
    name: 'Mining Drone',
    description: 'Autonomous drones extracting resources from nearby asteroids.',
    icon: 'i-lucide-pickaxe',
    baseCost: 10,
    costMultiplier: 1.12,
    baseOutput: 0.5,
    resource: 'credits',
    unlockKardashev: 0
  },
  {
    id: 'ore_refinery',
    name: 'Ore Refinery',
    description: 'Processes raw minerals into valuable commodities.',
    icon: 'i-lucide-hammer',
    baseCost: 150,
    costMultiplier: 1.13,
    baseOutput: 3,
    resource: 'credits',
    unlockKardashev: 0
  },
  {
    id: 'cargo_shuttle',
    name: 'Cargo Shuttle',
    description: 'Small-range transport shuttles running trade loops.',
    icon: 'i-lucide-truck',
    baseCost: 1500,
    costMultiplier: 1.14,
    baseOutput: 15,
    resource: 'credits',
    unlockKardashev: 0
  },
  {
    id: 'orbital_factory',
    name: 'Orbital Factory',
    description: 'Zero-gravity manufacturing of high-value goods.',
    icon: 'i-lucide-factory',
    baseCost: 10000,
    costMultiplier: 1.14,
    baseOutput: 60,
    resource: 'credits',
    unlockKardashev: 0
  },
  {
    id: 'space_station',
    name: 'Space Station',
    description: 'A bustling hub of commerce in low orbit.',
    icon: 'i-lucide-satellite',
    baseCost: 50000,
    costMultiplier: 1.15,
    baseOutput: 200,
    resource: 'credits',
    unlockKardashev: 0
  },

  // Energy
  {
    id: 'solar_array',
    name: 'Solar Array',
    description: 'Orbital solar panels harvesting stellar energy.',
    icon: 'i-lucide-sun',
    baseCost: 50,
    costMultiplier: 1.12,
    baseOutput: 2,
    resource: 'energy',
    unlockKardashev: 0
  },
  {
    id: 'wind_turbine_grid',
    name: 'Wind Turbine Grid',
    description: 'Continent-spanning atmospheric energy harvesting.',
    icon: 'i-lucide-fan',
    baseCost: 400,
    costMultiplier: 1.13,
    baseOutput: 10,
    resource: 'energy',
    unlockKardashev: 0
  },
  {
    id: 'geothermal_tap',
    name: 'Geothermal Tap',
    description: 'Deep planetary core energy extraction.',
    icon: 'i-lucide-thermometer',
    baseCost: 3000,
    costMultiplier: 1.13,
    baseOutput: 50,
    resource: 'energy',
    unlockKardashev: 0
  },
  {
    id: 'fission_plant',
    name: 'Fission Plant',
    description: 'Nuclear fission reactors providing steady baseload power.',
    icon: 'i-lucide-radiation',
    baseCost: 20000,
    costMultiplier: 1.14,
    baseOutput: 250,
    resource: 'energy',
    unlockKardashev: 0
  },
  {
    id: 'orbital_mirror',
    name: 'Orbital Mirror',
    description: 'Giant reflectors focusing sunlight onto collection stations.',
    icon: 'i-lucide-eclipse',
    baseCost: 80000,
    costMultiplier: 1.15,
    baseOutput: 800,
    resource: 'energy',
    unlockKardashev: 0
  },

  // Pops
  {
    id: 'corporate_drone',
    name: 'Corporate Drone',
    description: 'A loyal employee who clicks on your behalf. Tirelessly.',
    icon: 'i-lucide-user',
    baseCost: 50,
    costMultiplier: 1.14,
    baseOutput: 1,
    resource: 'autoclick',
    unlockKardashev: 0
  },

  // =============================================
  // TYPE I — Planetary civilization (10,000 TW/s)
  // =============================================

  // Credits
  {
    id: 'asteroid_mine',
    name: 'Asteroid Mine',
    description: 'Industrial-scale mining operations on mineral-rich asteroids.',
    icon: 'i-lucide-mountain',
    baseCost: 200000,
    costMultiplier: 1.12,
    baseOutput: 500,
    resource: 'credits',
    unlockKardashev: 1
  },
  {
    id: 'trade_hub',
    name: 'Trade Hub',
    description: 'Orbital marketplace connecting interstellar trade routes.',
    icon: 'i-lucide-arrow-left-right',
    baseCost: 1e6,
    costMultiplier: 1.13,
    baseOutput: 2000,
    resource: 'credits',
    unlockKardashev: 1
  },
  {
    id: 'planetary_exchange',
    name: 'Planetary Exchange',
    description: 'Planet-wide commodities trading network.',
    icon: 'i-lucide-bar-chart-3',
    baseCost: 5e6,
    costMultiplier: 1.13,
    baseOutput: 8000,
    resource: 'credits',
    unlockKardashev: 1
  },
  {
    id: 'megacorp_hq',
    name: 'MegaCorp HQ',
    description: 'Your corporate headquarters. Generates revenue from subsidiaries.',
    icon: 'i-lucide-building-2',
    baseCost: 25e6,
    costMultiplier: 1.14,
    baseOutput: 30000,
    resource: 'credits',
    unlockKardashev: 1
  },
  {
    id: 'system_monopoly',
    name: 'System Monopoly',
    description: 'Total economic control over an entire star system.',
    icon: 'i-lucide-gem',
    baseCost: 100e6,
    costMultiplier: 1.15,
    baseOutput: 100000,
    resource: 'credits',
    unlockKardashev: 1
  },

  // Energy
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    description: 'Advanced fusion plants powering entire orbital stations.',
    icon: 'i-lucide-atom',
    baseCost: 300000,
    costMultiplier: 1.12,
    baseOutput: 1000,
    resource: 'energy',
    unlockKardashev: 1
  },
  {
    id: 'planetary_grid',
    name: 'Planetary Grid',
    description: 'Unified energy grid harnessing an entire planet\'s output.',
    icon: 'i-lucide-network',
    baseCost: 2e6,
    costMultiplier: 1.13,
    baseOutput: 5000,
    resource: 'energy',
    unlockKardashev: 1
  },
  {
    id: 'antimatter_forge',
    name: 'Antimatter Forge',
    description: 'Produces and annihilates antimatter for enormous energy yields.',
    icon: 'i-lucide-flask-conical',
    baseCost: 15e6,
    costMultiplier: 1.13,
    baseOutput: 25000,
    resource: 'energy',
    unlockKardashev: 1
  },
  {
    id: 'helium3_harvester',
    name: 'Helium-3 Harvester',
    description: 'Scoops fusion fuel from gas giant atmospheres.',
    icon: 'i-lucide-cloud',
    baseCost: 80e6,
    costMultiplier: 1.14,
    baseOutput: 100000,
    resource: 'energy',
    unlockKardashev: 1
  },
  {
    id: 'stellar_collector',
    name: 'Stellar Collector',
    description: 'Early prototype for capturing a fraction of a star\'s output.',
    icon: 'i-lucide-sunset',
    baseCost: 500e6,
    costMultiplier: 1.15,
    baseOutput: 500000,
    resource: 'energy',
    unlockKardashev: 1
  },

  // Pops
  {
    id: 'executive_assistant',
    name: 'Executive Assistant',
    description: 'Highly efficient middle management. Delegates at scale.',
    icon: 'i-lucide-user-check',
    baseCost: 500000,
    costMultiplier: 1.14,
    baseOutput: 15,
    resource: 'autoclick',
    unlockKardashev: 1
  },

  // =============================================
  // TYPE II — Stellar civilization (10^14 TW/s)
  // =============================================

  // Credits
  {
    id: 'colony_world',
    name: 'Colony World',
    description: 'A fully colonized planet generating massive economic output.',
    icon: 'i-lucide-globe',
    baseCost: 1e9,
    costMultiplier: 1.12,
    baseOutput: 1e6,
    resource: 'credits',
    unlockKardashev: 2
  },
  {
    id: 'stellar_shipyard',
    name: 'Stellar Shipyard',
    description: 'Constructs starships in orbit, fueling interstellar commerce.',
    icon: 'i-lucide-rocket',
    baseCost: 10e9,
    costMultiplier: 1.13,
    baseOutput: 5e6,
    resource: 'credits',
    unlockKardashev: 2
  },
  {
    id: 'galactic_bank',
    name: 'Galactic Bank',
    description: 'A financial institution spanning multiple star systems.',
    icon: 'i-lucide-landmark',
    baseCost: 100e9,
    costMultiplier: 1.13,
    baseOutput: 25e6,
    resource: 'credits',
    unlockKardashev: 2
  },
  {
    id: 'matter_synthesizer',
    name: 'Matter Synthesizer',
    description: 'Creates valuable materials from raw energy. Alchemy perfected.',
    icon: 'i-lucide-sparkles',
    baseCost: 1e12,
    costMultiplier: 1.14,
    baseOutput: 200e6,
    resource: 'credits',
    unlockKardashev: 2
  },
  {
    id: 'sector_conglomerate',
    name: 'Sector Conglomerate',
    description: 'A sprawling corporate empire controlling dozens of systems.',
    icon: 'i-lucide-briefcase',
    baseCost: 20e12,
    costMultiplier: 1.15,
    baseOutput: 2e9,
    resource: 'credits',
    unlockKardashev: 2
  },

  // Energy
  {
    id: 'dyson_swarm',
    name: 'Dyson Swarm',
    description: 'Millions of orbital collectors surrounding a star.',
    icon: 'i-lucide-orbit',
    baseCost: 2e9,
    costMultiplier: 1.12,
    baseOutput: 1e7,
    resource: 'energy',
    unlockKardashev: 2
  },
  {
    id: 'dyson_sphere',
    name: 'Dyson Sphere',
    description: 'A megastructure fully enclosing a star to capture its total output.',
    icon: 'i-lucide-circle-dot',
    baseCost: 50e9,
    costMultiplier: 1.13,
    baseOutput: 1e9,
    resource: 'energy',
    unlockKardashev: 2
  },
  {
    id: 'penrose_engine',
    name: 'Penrose Engine',
    description: 'Extracts rotational energy from spinning black holes.',
    icon: 'i-lucide-rotate-cw',
    baseCost: 500e9,
    costMultiplier: 1.13,
    baseOutput: 1e11,
    resource: 'energy',
    unlockKardashev: 2
  },
  {
    id: 'star_lifter',
    name: 'Star Lifter',
    description: 'Harvests matter directly from a star\'s surface.',
    icon: 'i-lucide-arrow-up-from-line',
    baseCost: 10e12,
    costMultiplier: 1.14,
    baseOutput: 5e12,
    resource: 'energy',
    unlockKardashev: 2
  },
  {
    id: 'kugelblitz_reactor',
    name: 'Kugelblitz Reactor',
    description: 'Artificial micro black holes converting matter to energy at near 100% efficiency.',
    icon: 'i-lucide-diameter',
    baseCost: 500e12,
    costMultiplier: 1.15,
    baseOutput: 1e14,
    resource: 'energy',
    unlockKardashev: 2
  },

  // Pops
  {
    id: 'sector_governor',
    name: 'Sector Governor',
    description: 'Oversees an entire sector of your empire.',
    icon: 'i-lucide-crown',
    baseCost: 5e9,
    costMultiplier: 1.15,
    baseOutput: 500,
    resource: 'autoclick',
    unlockKardashev: 2
  },

  // =============================================
  // TYPE III — Galactic civilization (10^24 TW/s)
  // =============================================

  // Credits
  {
    id: 'megastructure_forge',
    name: 'Megastructure Forge',
    description: 'A galaxy-scale industrial complex building wonders.',
    icon: 'i-lucide-boxes',
    baseCost: 1e15,
    costMultiplier: 1.12,
    baseOutput: 1e12,
    resource: 'credits',
    unlockKardashev: 3
  },
  {
    id: 'galactic_trade_league',
    name: 'Galactic Trade League',
    description: 'An economic alliance spanning the entire galaxy.',
    icon: 'i-lucide-handshake',
    baseCost: 50e15,
    costMultiplier: 1.13,
    baseOutput: 50e12,
    resource: 'credits',
    unlockKardashev: 3
  },
  {
    id: 'reality_market',
    name: 'Reality Market',
    description: 'Trading in simulated universes, pocket dimensions, and exotic matter.',
    icon: 'i-lucide-layout-grid',
    baseCost: 1e18,
    costMultiplier: 1.13,
    baseOutput: 1e15,
    resource: 'credits',
    unlockKardashev: 3
  },
  {
    id: 'intergalactic_consortium',
    name: 'Intergalactic Consortium',
    description: 'Joint ventures with civilizations in neighboring galaxies.',
    icon: 'i-lucide-globe-2',
    baseCost: 50e18,
    costMultiplier: 1.14,
    baseOutput: 50e15,
    resource: 'credits',
    unlockKardashev: 3
  },
  {
    id: 'time_arbitrage_firm',
    name: 'Time Arbitrage Firm',
    description: 'Exploits temporal differentials for guaranteed profit across timelines.',
    icon: 'i-lucide-timer',
    baseCost: 1e21,
    costMultiplier: 1.15,
    baseOutput: 1e18,
    resource: 'credits',
    unlockKardashev: 3
  },

  // Energy
  {
    id: 'stellar_engine',
    name: 'Stellar Engine',
    description: 'Harnesses the thrust of entire stars as propulsion.',
    icon: 'i-lucide-flame',
    baseCost: 5e15,
    costMultiplier: 1.12,
    baseOutput: 1e17,
    resource: 'energy',
    unlockKardashev: 3
  },
  {
    id: 'galactic_core_tap',
    name: 'Galactic Core Tap',
    description: 'Extracts energy from the supermassive black hole at the galactic center.',
    icon: 'i-lucide-target',
    baseCost: 100e15,
    costMultiplier: 1.13,
    baseOutput: 1e19,
    resource: 'energy',
    unlockKardashev: 3
  },
  {
    id: 'quasar_harvester',
    name: 'Quasar Harvester',
    description: 'Collects the jets of energy erupting from active galactic nuclei.',
    icon: 'i-lucide-cone',
    baseCost: 5e18,
    costMultiplier: 1.13,
    baseOutput: 1e21,
    resource: 'energy',
    unlockKardashev: 3
  },
  {
    id: 'dark_matter_reactor',
    name: 'Dark Matter Reactor',
    description: 'Annihilates dark matter particles for incomprehensible energy yields.',
    icon: 'i-lucide-moon',
    baseCost: 100e18,
    costMultiplier: 1.14,
    baseOutput: 1e23,
    resource: 'energy',
    unlockKardashev: 3
  },
  {
    id: 'neutron_star_battery',
    name: 'Neutron Star Battery',
    description: 'Stores and releases the spin-down energy of magnetars.',
    icon: 'i-lucide-circle',
    baseCost: 5e21,
    costMultiplier: 1.15,
    baseOutput: 5e24,
    resource: 'energy',
    unlockKardashev: 3
  },

  // Pops
  {
    id: 'galactic_viceroy',
    name: 'Galactic Viceroy',
    description: 'Commands entire galactic arms on your behalf.',
    icon: 'i-lucide-swords',
    baseCost: 1e16,
    costMultiplier: 1.15,
    baseOutput: 25000,
    resource: 'autoclick',
    unlockKardashev: 3
  },

  // =============================================
  // TYPE IV — Universal civilization (10^34 TW/s)
  // =============================================

  // Credits
  {
    id: 'universe_factory',
    name: 'Universe Factory',
    description: 'Manufactures pocket universes optimized for resource extraction.',
    icon: 'i-lucide-package',
    baseCost: 1e24,
    costMultiplier: 1.12,
    baseOutput: 1e21,
    resource: 'credits',
    unlockKardashev: 4
  },
  {
    id: 'entropy_bank',
    name: 'Entropy Bank',
    description: 'Trades in negentropy — the most valuable commodity in a dying universe.',
    icon: 'i-lucide-database',
    baseCost: 50e24,
    costMultiplier: 1.13,
    baseOutput: 50e21,
    resource: 'credits',
    unlockKardashev: 4
  },
  {
    id: 'dimension_broker',
    name: 'Dimension Broker',
    description: 'Facilitates commerce between parallel dimensional planes.',
    icon: 'i-lucide-layers',
    baseCost: 1e27,
    costMultiplier: 1.13,
    baseOutput: 1e24,
    resource: 'credits',
    unlockKardashev: 4
  },
  {
    id: 'causality_exchange',
    name: 'Causality Exchange',
    description: 'Trades cause-and-effect chains across the multiverse.',
    icon: 'i-lucide-git-branch',
    baseCost: 50e27,
    costMultiplier: 1.14,
    baseOutput: 50e24,
    resource: 'credits',
    unlockKardashev: 4
  },
  {
    id: 'omega_corp',
    name: 'Omega Corp',
    description: 'The ultimate corporation. Transcends spacetime itself.',
    icon: 'i-lucide-hexagon',
    baseCost: 1e30,
    costMultiplier: 1.15,
    baseOutput: 1e27,
    resource: 'credits',
    unlockKardashev: 4
  },

  // Energy
  {
    id: 'vacuum_harvester',
    name: 'Vacuum Energy Harvester',
    description: 'Extracts energy from the quantum vacuum of spacetime itself.',
    icon: 'i-lucide-waves',
    baseCost: 5e24,
    costMultiplier: 1.12,
    baseOutput: 1e27,
    resource: 'energy',
    unlockKardashev: 4
  },
  {
    id: 'cosmic_string_engine',
    name: 'Cosmic String Engine',
    description: 'Harvests immense energy from topological defects in spacetime.',
    icon: 'i-lucide-zap',
    baseCost: 100e24,
    costMultiplier: 1.13,
    baseOutput: 1e29,
    resource: 'energy',
    unlockKardashev: 4
  },
  {
    id: 'false_vacuum_tap',
    name: 'False Vacuum Tap',
    description: 'Carefully extracts energy from metastable vacuum states.',
    icon: 'i-lucide-alert-triangle',
    baseCost: 5e27,
    costMultiplier: 1.13,
    baseOutput: 1e31,
    resource: 'energy',
    unlockKardashev: 4
  },
  {
    id: 'white_hole_generator',
    name: 'White Hole Generator',
    description: 'Creates artificial white holes as unlimited energy fountains.',
    icon: 'i-lucide-sun-dim',
    baseCost: 100e27,
    costMultiplier: 1.14,
    baseOutput: 1e33,
    resource: 'energy',
    unlockKardashev: 4
  },
  {
    id: 'big_bang_echo',
    name: 'Big Bang Echo Harvester',
    description: 'Taps residual energy from the cosmic microwave background at universal scale.',
    icon: 'i-lucide-radio',
    baseCost: 5e30,
    costMultiplier: 1.15,
    baseOutput: 5e34,
    resource: 'energy',
    unlockKardashev: 4
  },

  // =============================================
  // TYPE V — Multiversal civilization (10^44 TW/s)
  // =============================================

  // Credits
  {
    id: 'multiverse_holding',
    name: 'Multiverse Holdings',
    description: 'A conglomerate operating across infinite parallel realities.',
    icon: 'i-lucide-infinity',
    baseCost: 1e33,
    costMultiplier: 1.12,
    baseOutput: 1e30,
    resource: 'credits',
    unlockKardashev: 5
  },
  {
    id: 'probability_mine',
    name: 'Probability Mine',
    description: 'Mines favorable probability outcomes from the quantum foam.',
    icon: 'i-lucide-dice-5',
    baseCost: 50e33,
    costMultiplier: 1.13,
    baseOutput: 50e30,
    resource: 'credits',
    unlockKardashev: 5
  },
  {
    id: 'reality_compiler',
    name: 'Reality Compiler',
    description: 'Writes new physical laws optimized for profit.',
    icon: 'i-lucide-code',
    baseCost: 1e36,
    costMultiplier: 1.13,
    baseOutput: 1e33,
    resource: 'credits',
    unlockKardashev: 5
  },
  {
    id: 'entropy_reversal_engine',
    name: 'Entropy Reversal Engine',
    description: 'Reverses thermodynamic entropy. Creates value from nothing.',
    icon: 'i-lucide-refresh-cw',
    baseCost: 50e36,
    costMultiplier: 1.14,
    baseOutput: 50e33,
    resource: 'credits',
    unlockKardashev: 5
  },
  {
    id: 'omniscience_engine',
    name: 'Omniscience Engine',
    description: 'Perfect knowledge of all realities. Perfect profit.',
    icon: 'i-lucide-eye',
    baseCost: 1e39,
    costMultiplier: 1.15,
    baseOutput: 1e36,
    resource: 'credits',
    unlockKardashev: 5
  },

  // Energy
  {
    id: 'big_crunch_generator',
    name: 'Big Crunch Generator',
    description: 'Triggers controlled universal collapses to harvest total cosmic energy.',
    icon: 'i-lucide-shrink',
    baseCost: 5e33,
    costMultiplier: 1.12,
    baseOutput: 1e37,
    resource: 'energy',
    unlockKardashev: 5
  },
  {
    id: 'multiversal_conduit',
    name: 'Multiversal Conduit',
    description: 'Siphons energy across the membrane between parallel universes.',
    icon: 'i-lucide-git-merge',
    baseCost: 100e33,
    costMultiplier: 1.13,
    baseOutput: 1e39,
    resource: 'energy',
    unlockKardashev: 5
  },
  {
    id: 'boltzmann_brain_farm',
    name: 'Boltzmann Brain Farm',
    description: 'Cultivates spontaneous consciousness fluctuations as energy sources.',
    icon: 'i-lucide-brain',
    baseCost: 5e36,
    costMultiplier: 1.13,
    baseOutput: 1e41,
    resource: 'energy',
    unlockKardashev: 5
  },
  {
    id: 'reality_annihilator',
    name: 'Reality Annihilator',
    description: 'Converts entire universes into pure energy.',
    icon: 'i-lucide-bomb',
    baseCost: 100e36,
    costMultiplier: 1.14,
    baseOutput: 1e43,
    resource: 'energy',
    unlockKardashev: 5
  },
  {
    id: 'omega_point_engine',
    name: 'Omega Point Engine',
    description: 'Harnesses the final singularity. Infinite energy from the end of time.',
    icon: 'i-lucide-star',
    baseCost: 5e39,
    costMultiplier: 1.15,
    baseOutput: 5e44,
    resource: 'energy',
    unlockKardashev: 5
  }
]

const clickUpgrades: ClickUpgradeDefinition[] = [
  { id: 'reinforced_gloves', name: 'Reinforced Gloves', description: 'Better grip, harder clicks.', cost: 100, clickPowerAdd: 1 },
  { id: 'neural_interface', name: 'Neural Interface', description: 'Think-to-click technology.', cost: 1000, clickPowerAdd: 5 },
  { id: 'cybernetic_arm', name: 'Cybernetic Arm', description: 'Mechanical precision, organic ambition.', cost: 10000, clickPowerAdd: 25 },
  { id: 'quantum_clicker', name: 'Quantum Clicker', description: 'Clicks in multiple dimensions simultaneously.', cost: 250000, clickPowerAdd: 100 },
  { id: 'psionic_amplifier', name: 'Psionic Amplifier', description: 'Channel raw psychic energy into each click.', cost: 5e6, clickPowerAdd: 1000 },
  { id: 'galactic_decree', name: 'Galactic Decree', description: 'Each click carries the weight of an empire.', cost: 1e9, clickPowerAdd: 50000 }
]

// Real Kardashev scale: ~10^10 ratio between each level
// Energy unit: TW (terawatts)
const kardashevLevels: KardashevLevel[] = [
  { level: 0, name: 'Type 0', description: 'Sub-planetary civilization', energyPerSecond: 0 },
  { level: 1, name: 'Type I', description: 'Planetary civilization', energyPerSecond: 1e4 },
  { level: 2, name: 'Type II', description: 'Stellar civilization', energyPerSecond: 1e14 },
  { level: 3, name: 'Type III', description: 'Galactic civilization', energyPerSecond: 1e24 },
  { level: 4, name: 'Type IV', description: 'Universal civilization', energyPerSecond: 1e34 },
  { level: 5, name: 'Type V', description: 'Multiversal civilization', energyPerSecond: 1e44 }
]

const prestigeUpgrades: PrestigeUpgradeDefinition[] = [
  {
    id: 'efficient_management',
    name: 'Efficient Management',
    description: '+50% Credits per second',
    cost: 5,
    effect: { type: 'creditsMultiplier', value: 1.5 }
  },
  {
    id: 'advanced_reactors',
    name: 'Advanced Reactors',
    description: '+50% Energy per second',
    cost: 5,
    effect: { type: 'energyMultiplier', value: 1.5 }
  },
  {
    id: 'power_clicks',
    name: 'Power Clicks',
    description: '2x click power',
    cost: 3,
    effect: { type: 'clickMultiplier', value: 2 }
  },
  {
    id: 'quick_start',
    name: 'Quick Start',
    description: 'Start with 5 Mining Drones and 5 Solar Arrays after prestige',
    cost: 10,
    effect: { type: 'quickStart', buildings: { mining_drone: 5, solar_array: 5 } }
  },
]

const repeatablePrestigeUpgrades: RepeatablePrestigeUpgrade[] = [
  {
    id: 'profit_margins',
    name: 'Profit Margins',
    description: '+20% Credits/s per level',
    icon: 'i-lucide-banknote',
    baseCost: 2,
    costScale: 1.5,
    maxLevel: 50,
    effect: { type: 'creditsMultiplier', valuePerLevel: 1.2 }
  },
  {
    id: 'reactor_efficiency',
    name: 'Reactor Efficiency',
    description: '+20% Energy/s per level',
    icon: 'i-lucide-zap',
    baseCost: 2,
    costScale: 1.5,
    maxLevel: 50,
    effect: { type: 'energyMultiplier', valuePerLevel: 1.2 }
  },
  {
    id: 'click_amplifier',
    name: 'Click Amplifier',
    description: '+25% Click power per level',
    icon: 'i-lucide-mouse-pointer-click',
    baseCost: 3,
    costScale: 1.5,
    maxLevel: 30,
    effect: { type: 'clickMultiplier', valuePerLevel: 1.25 }
  },
  {
    id: 'workforce_training',
    name: 'Workforce Training',
    description: '+20% Pop output per level',
    icon: 'i-lucide-users',
    baseCost: 3,
    costScale: 1.5,
    maxLevel: 30,
    effect: { type: 'popMultiplier', valuePerLevel: 1.2 }
  },
  {
    id: 'bulk_purchasing',
    name: 'Bulk Purchasing',
    description: '-10% Building costs per level',
    icon: 'i-lucide-tags',
    baseCost: 4,
    costScale: 1.8,
    maxLevel: 20,
    effect: { type: 'buildingCostMultiplier', valuePerLevel: 0.9 }
  },
  {
    id: 'casino_vip',
    name: 'Casino VIP',
    description: '+15% Casino winnings per level',
    icon: 'i-lucide-dices',
    baseCost: 3,
    costScale: 1.6,
    maxLevel: 20,
    effect: { type: 'casinoMultiplier', valuePerLevel: 1.15 }
  }
]

export function useGameConfig() {
  return {
    buildings: readonly(buildings),
    clickUpgrades: readonly(clickUpgrades),
    kardashevLevels: readonly(kardashevLevels),
    prestigeUpgrades: readonly(prestigeUpgrades),
    repeatablePrestigeUpgrades: readonly(repeatablePrestigeUpgrades)
  }
}
