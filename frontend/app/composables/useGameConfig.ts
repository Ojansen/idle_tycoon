import type { BuildingDefinition, ClickUpgradeConfig, KardashevLevel, PrestigeUpgradeDefinition, RepeatablePrestigeUpgrade } from '~/types/game'

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
    costMultiplier: 1.045,
    baseOutput: 0.50,
    resource: 'credits',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'ore_refinery',
    name: 'Ore Refinery',
    description: 'Processes raw minerals into valuable commodities.',
    icon: 'i-lucide-hammer',
    baseCost: 150,
    costMultiplier: 1.048,
    baseOutput: 5.3,
    resource: 'credits',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'cargo_shuttle',
    name: 'Cargo Shuttle',
    description: 'Small-range transport shuttles running trade loops.',
    icon: 'i-lucide-truck',
    baseCost: 1500,
    costMultiplier: 1.050,
    baseOutput: 37,
    resource: 'credits',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'orbital_factory',
    name: 'Orbital Factory',
    description: 'Zero-gravity manufacturing of high-value goods.',
    icon: 'i-lucide-factory',
    baseCost: 10000,
    costMultiplier: 1.053,
    baseOutput: 172,
    resource: 'credits',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'space_station',
    name: 'Space Station',
    description: 'A bustling hub of commerce in low orbit.',
    icon: 'i-lucide-satellite',
    baseCost: 50000,
    costMultiplier: 1.055,
    baseOutput: 600,
    resource: 'credits',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },

  // Energy
  {
    id: 'solar_array',
    name: 'Solar Array',
    description: 'Orbital solar panels harvesting stellar energy.',
    icon: 'i-lucide-sun',
    baseCost: 50,
    costMultiplier: 1.045,
    baseOutput: 2.00,
    resource: 'energy',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'wind_turbine_grid',
    name: 'Wind Turbine Grid',
    description: 'Continent-spanning atmospheric energy harvesting.',
    icon: 'i-lucide-fan',
    baseCost: 400,
    costMultiplier: 1.048,
    baseOutput: 11.2,
    resource: 'energy',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'geothermal_tap',
    name: 'Geothermal Tap',
    description: 'Deep planetary core energy extraction.',
    icon: 'i-lucide-thermometer',
    baseCost: 3000,
    costMultiplier: 1.050,
    baseOutput: 59,
    resource: 'energy',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'fission_plant',
    name: 'Fission Plant',
    description: 'Nuclear fission reactors providing steady baseload power.',
    icon: 'i-lucide-radiation',
    baseCost: 20000,
    costMultiplier: 1.053,
    baseOutput: 274,
    resource: 'energy',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },
  {
    id: 'orbital_mirror',
    name: 'Orbital Mirror',
    description: 'Giant reflectors focusing sunlight onto collection stations.',
    icon: 'i-lucide-eclipse',
    baseCost: 80000,
    costMultiplier: 1.055,
    baseOutput: 960,
    resource: 'energy',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },

  // Pops
  {
    id: 'corporate_drone',
    name: 'Corporate Drone',
    description: 'A loyal employee who clicks on your behalf. Tirelessly.',
    icon: 'i-lucide-user',
    baseCost: 50,
    costMultiplier: 1.12,
    baseOutput: 1,
    resource: 'autoclick',
    unlockKardashev: 0,
    cgUpkeep: 0.25
  },

  // Consumer Goods
  {
    id: 'consumer_factory',
    name: 'Consumer Factory',
    description: 'Mass-produces the essential products that keep your empire running.',
    icon: 'i-lucide-package',
    baseCost: 500,
    costMultiplier: 1.06,
    baseOutput: 5,
    resource: 'consumer_goods',
    unlockKardashev: 0,
    energyUpkeep: 5
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
    costMultiplier: 1.045,
    baseOutput: 3000,
    resource: 'credits',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'trade_hub',
    name: 'Trade Hub',
    description: 'Orbital marketplace connecting interstellar trade routes.',
    icon: 'i-lucide-arrow-left-right',
    baseCost: 1e6,
    costMultiplier: 1.048,
    baseOutput: 10500,
    resource: 'credits',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'planetary_exchange',
    name: 'Planetary Exchange',
    description: 'Planet-wide commodities trading network.',
    icon: 'i-lucide-bar-chart-3',
    baseCost: 5e6,
    costMultiplier: 1.050,
    baseOutput: 36800,
    resource: 'credits',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'megacorp_hq',
    name: 'MegaCorp HQ',
    description: 'Your corporate headquarters. Generates revenue from subsidiaries.',
    icon: 'i-lucide-building-2',
    baseCost: 25e6,
    costMultiplier: 1.053,
    baseOutput: 129000,
    resource: 'credits',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'system_monopoly',
    name: 'System Monopoly',
    description: 'Total economic control over an entire star system.',
    icon: 'i-lucide-gem',
    baseCost: 100e6,
    costMultiplier: 1.055,
    baseOutput: 360000,
    resource: 'credits',
    unlockKardashev: 1,
    cgUpkeep: 250
  },

  // Energy
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    description: 'Advanced fusion plants powering entire orbital stations.',
    icon: 'i-lucide-atom',
    baseCost: 300000,
    costMultiplier: 1.045,
    baseOutput: 3600,
    resource: 'energy',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'planetary_grid',
    name: 'Planetary Grid',
    description: 'Unified energy grid harnessing an entire planet\'s output.',
    icon: 'i-lucide-network',
    baseCost: 2e6,
    costMultiplier: 1.048,
    baseOutput: 16800,
    resource: 'energy',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'antimatter_forge',
    name: 'Antimatter Forge',
    description: 'Produces and annihilates antimatter for enormous energy yields.',
    icon: 'i-lucide-flask-conical',
    baseCost: 15e6,
    costMultiplier: 1.050,
    baseOutput: 88200,
    resource: 'energy',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'helium3_harvester',
    name: 'Helium-3 Harvester',
    description: 'Scoops fusion fuel from gas giant atmospheres.',
    icon: 'i-lucide-cloud',
    baseCost: 80e6,
    costMultiplier: 1.053,
    baseOutput: 329000,
    resource: 'energy',
    unlockKardashev: 1,
    cgUpkeep: 250
  },
  {
    id: 'stellar_collector',
    name: 'Stellar Collector',
    description: 'Early prototype for capturing a fraction of a star\'s output.',
    icon: 'i-lucide-sunset',
    baseCost: 500e6,
    costMultiplier: 1.055,
    baseOutput: 1.44e6,
    resource: 'energy',
    unlockKardashev: 1,
    cgUpkeep: 250
  },

  // Pops
  {
    id: 'executive_assistant',
    name: 'Executive Assistant',
    description: 'Highly efficient middle management. Delegates at scale.',
    icon: 'i-lucide-user-check',
    baseCost: 500000,
    costMultiplier: 1.12,
    baseOutput: 15,
    resource: 'autoclick',
    unlockKardashev: 1,
    cgUpkeep: 250
  },

  // Consumer Goods
  {
    id: 'industrial_complex',
    name: 'Industrial Complex',
    description: 'Planetary-scale manufacturing meeting interstellar demand.',
    icon: 'i-lucide-package',
    baseCost: 5e5,
    costMultiplier: 1.06,
    baseOutput: 5e3,
    resource: 'consumer_goods',
    unlockKardashev: 1,
    energyUpkeep: 5e3
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
    costMultiplier: 1.045,
    baseOutput: 4.50e6,
    resource: 'credits',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'stellar_shipyard',
    name: 'Stellar Shipyard',
    description: 'Constructs starships in orbit, fueling interstellar commerce.',
    icon: 'i-lucide-rocket',
    baseCost: 10e9,
    costMultiplier: 1.048,
    baseOutput: 3.15e7,
    resource: 'credits',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'galactic_bank',
    name: 'Galactic Bank',
    description: 'A financial institution spanning multiple star systems.',
    icon: 'i-lucide-landmark',
    baseCost: 100e9,
    costMultiplier: 1.050,
    baseOutput: 2.21e8,
    resource: 'credits',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'matter_synthesizer',
    name: 'Matter Synthesizer',
    description: 'Creates valuable materials from raw energy. Alchemy perfected.',
    icon: 'i-lucide-sparkles',
    baseCost: 1e12,
    costMultiplier: 1.053,
    baseOutput: 1.54e9,
    resource: 'credits',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'sector_conglomerate',
    name: 'Sector Conglomerate',
    description: 'A sprawling corporate empire controlling dozens of systems.',
    icon: 'i-lucide-briefcase',
    baseCost: 20e12,
    costMultiplier: 1.055,
    baseOutput: 2.16e10,
    resource: 'credits',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },

  // Energy
  {
    id: 'dyson_swarm',
    name: 'Dyson Swarm',
    description: 'Millions of orbital collectors surrounding a star.',
    icon: 'i-lucide-orbit',
    baseCost: 2e9,
    costMultiplier: 1.045,
    baseOutput: 7.20e6,
    resource: 'energy',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'dyson_sphere',
    name: 'Dyson Sphere',
    description: 'A megastructure fully enclosing a star to capture its total output.',
    icon: 'i-lucide-circle-dot',
    baseCost: 50e9,
    costMultiplier: 1.048,
    baseOutput: 1.26e8,
    resource: 'energy',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'penrose_engine',
    name: 'Penrose Engine',
    description: 'Extracts rotational energy from spinning black holes.',
    icon: 'i-lucide-rotate-cw',
    baseCost: 500e9,
    costMultiplier: 1.050,
    baseOutput: 8.82e8,
    resource: 'energy',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'star_lifter',
    name: 'Star Lifter',
    description: 'Harvests matter directly from a star\'s surface.',
    icon: 'i-lucide-arrow-up-from-line',
    baseCost: 10e12,
    costMultiplier: 1.053,
    baseOutput: 1.24e10,
    resource: 'energy',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },
  {
    id: 'kugelblitz_reactor',
    name: 'Kugelblitz Reactor',
    description: 'Artificial micro black holes converting matter to energy at near 100% efficiency.',
    icon: 'i-lucide-diameter',
    baseCost: 500e12,
    costMultiplier: 1.055,
    baseOutput: 4.32e11,
    resource: 'energy',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },

  // Pops
  {
    id: 'sector_governor',
    name: 'Sector Governor',
    description: 'Oversees an entire sector of your empire.',
    icon: 'i-lucide-crown',
    baseCost: 5e9,
    costMultiplier: 1.12,
    baseOutput: 500,
    resource: 'autoclick',
    unlockKardashev: 2,
    cgUpkeep: 2.5e5
  },

  // Consumer Goods
  {
    id: 'stellar_forge_cg',
    name: 'Stellar Forge',
    description: 'Star-powered foundries crafting consumer goods at astronomical scale.',
    icon: 'i-lucide-package',
    baseCost: 5e8,
    costMultiplier: 1.06,
    baseOutput: 5e6,
    resource: 'consumer_goods',
    unlockKardashev: 2,
    energyUpkeep: 5e6
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
    costMultiplier: 1.045,
    baseOutput: 1.35e12,
    resource: 'credits',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'galactic_trade_league',
    name: 'Galactic Trade League',
    description: 'An economic alliance spanning the entire galaxy.',
    icon: 'i-lucide-handshake',
    baseCost: 50e15,
    costMultiplier: 1.048,
    baseOutput: 4.73e13,
    resource: 'credits',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'reality_market',
    name: 'Reality Market',
    description: 'Trading in simulated universes, pocket dimensions, and exotic matter.',
    icon: 'i-lucide-layout-grid',
    baseCost: 1e18,
    costMultiplier: 1.050,
    baseOutput: 6.62e14,
    resource: 'credits',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'intergalactic_consortium',
    name: 'Intergalactic Consortium',
    description: 'Joint ventures with civilizations in neighboring galaxies.',
    icon: 'i-lucide-globe-2',
    baseCost: 50e18,
    costMultiplier: 1.053,
    baseOutput: 2.32e16,
    resource: 'credits',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'time_arbitrage_firm',
    name: 'Time Arbitrage Firm',
    description: 'Exploits temporal differentials for guaranteed profit across timelines.',
    icon: 'i-lucide-timer',
    baseCost: 1e21,
    costMultiplier: 1.055,
    baseOutput: 3.24e17,
    resource: 'credits',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },

  // Energy
  {
    id: 'stellar_engine',
    name: 'Stellar Engine',
    description: 'Harnesses the thrust of entire stars as propulsion.',
    icon: 'i-lucide-flame',
    baseCost: 5e15,
    costMultiplier: 1.045,
    baseOutput: 5.41e12,
    resource: 'energy',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'galactic_core_tap',
    name: 'Galactic Core Tap',
    description: 'Extracts energy from the supermassive black hole at the galactic center.',
    icon: 'i-lucide-target',
    baseCost: 100e15,
    costMultiplier: 1.048,
    baseOutput: 7.57e13,
    resource: 'energy',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'quasar_harvester',
    name: 'Quasar Harvester',
    description: 'Collects the jets of energy erupting from active galactic nuclei.',
    icon: 'i-lucide-cone',
    baseCost: 5e18,
    costMultiplier: 1.050,
    baseOutput: 2.65e15,
    resource: 'energy',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'dark_matter_reactor',
    name: 'Dark Matter Reactor',
    description: 'Annihilates dark matter particles for incomprehensible energy yields.',
    icon: 'i-lucide-moon',
    baseCost: 100e18,
    costMultiplier: 1.053,
    baseOutput: 3.71e16,
    resource: 'energy',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },
  {
    id: 'neutron_star_battery',
    name: 'Neutron Star Battery',
    description: 'Stores and releases the spin-down energy of magnetars.',
    icon: 'i-lucide-circle',
    baseCost: 5e21,
    costMultiplier: 1.055,
    baseOutput: 1.30e18,
    resource: 'energy',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },

  // Pops
  {
    id: 'galactic_viceroy',
    name: 'Galactic Viceroy',
    description: 'Commands entire galactic arms on your behalf.',
    icon: 'i-lucide-swords',
    baseCost: 1e16,
    costMultiplier: 1.12,
    baseOutput: 25000,
    resource: 'autoclick',
    unlockKardashev: 3,
    cgUpkeep: 2.5e11
  },

  // Consumer Goods
  {
    id: 'galactic_fabricator',
    name: 'Galactic Fabricator',
    description: 'Galaxy-spanning production networks. Every system a factory floor.',
    icon: 'i-lucide-package',
    baseCost: 5e14,
    costMultiplier: 1.06,
    baseOutput: 5e12,
    resource: 'consumer_goods',
    unlockKardashev: 3,
    energyUpkeep: 5e12
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
    costMultiplier: 1.045,
    baseOutput: 4.06e20,
    resource: 'credits',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'entropy_bank',
    name: 'Entropy Bank',
    description: 'Trades in negentropy — the most valuable commodity in a dying universe.',
    icon: 'i-lucide-database',
    baseCost: 50e24,
    costMultiplier: 1.048,
    baseOutput: 1.42e22,
    resource: 'credits',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'dimension_broker',
    name: 'Dimension Broker',
    description: 'Facilitates commerce between parallel dimensional planes.',
    icon: 'i-lucide-layers',
    baseCost: 1e27,
    costMultiplier: 1.050,
    baseOutput: 1.99e23,
    resource: 'credits',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'causality_exchange',
    name: 'Causality Exchange',
    description: 'Trades cause-and-effect chains across the multiverse.',
    icon: 'i-lucide-git-branch',
    baseCost: 50e27,
    costMultiplier: 1.053,
    baseOutput: 6.96e24,
    resource: 'credits',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'omega_corp',
    name: 'Omega Corp',
    description: 'The ultimate corporation. Transcends spacetime itself.',
    icon: 'i-lucide-hexagon',
    baseCost: 1e30,
    costMultiplier: 1.055,
    baseOutput: 9.75e25,
    resource: 'credits',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },

  // Energy
  {
    id: 'vacuum_harvester',
    name: 'Vacuum Energy Harvester',
    description: 'Extracts energy from the quantum vacuum of spacetime itself.',
    icon: 'i-lucide-waves',
    baseCost: 5e24,
    costMultiplier: 1.045,
    baseOutput: 1.62e21,
    resource: 'energy',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'cosmic_string_engine',
    name: 'Cosmic String Engine',
    description: 'Harvests immense energy from topological defects in spacetime.',
    icon: 'i-lucide-zap',
    baseCost: 100e24,
    costMultiplier: 1.048,
    baseOutput: 2.27e22,
    resource: 'energy',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'false_vacuum_tap',
    name: 'False Vacuum Tap',
    description: 'Carefully extracts energy from metastable vacuum states.',
    icon: 'i-lucide-alert-triangle',
    baseCost: 5e27,
    costMultiplier: 1.050,
    baseOutput: 7.94e23,
    resource: 'energy',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'white_hole_generator',
    name: 'White Hole Generator',
    description: 'Creates artificial white holes as unlimited energy fountains.',
    icon: 'i-lucide-sun-dim',
    baseCost: 100e27,
    costMultiplier: 1.053,
    baseOutput: 1.11e25,
    resource: 'energy',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },
  {
    id: 'big_bang_echo',
    name: 'Big Bang Echo Harvester',
    description: 'Taps residual energy from the cosmic microwave background at universal scale.',
    icon: 'i-lucide-radio',
    baseCost: 5e30,
    costMultiplier: 1.055,
    baseOutput: 3.89e26,
    resource: 'energy',
    unlockKardashev: 4,
    cgUpkeep: 2.5e19
  },

  // Consumer Goods
  {
    id: 'universal_assembly',
    name: 'Universal Assembly',
    description: 'Cross-dimensional manufacturing on a universal scale.',
    icon: 'i-lucide-package',
    baseCost: 5e22,
    costMultiplier: 1.06,
    baseOutput: 5e20,
    resource: 'consumer_goods',
    unlockKardashev: 4,
    energyUpkeep: 5e20
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
    costMultiplier: 1.045,
    baseOutput: 1.22e29,
    resource: 'credits',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'probability_mine',
    name: 'Probability Mine',
    description: 'Mines favorable probability outcomes from the quantum foam.',
    icon: 'i-lucide-dice-5',
    baseCost: 50e33,
    costMultiplier: 1.048,
    baseOutput: 4.26e30,
    resource: 'credits',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'reality_compiler',
    name: 'Reality Compiler',
    description: 'Writes new physical laws optimized for profit.',
    icon: 'i-lucide-code',
    baseCost: 1e36,
    costMultiplier: 1.050,
    baseOutput: 5.97e31,
    resource: 'credits',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'entropy_reversal_engine',
    name: 'Entropy Reversal Engine',
    description: 'Reverses thermodynamic entropy. Creates value from nothing.',
    icon: 'i-lucide-refresh-cw',
    baseCost: 50e36,
    costMultiplier: 1.053,
    baseOutput: 2.09e33,
    resource: 'credits',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'omniscience_engine',
    name: 'Omniscience Engine',
    description: 'Perfect knowledge of all realities. Perfect profit.',
    icon: 'i-lucide-eye',
    baseCost: 1e39,
    costMultiplier: 1.055,
    baseOutput: 2.92e34,
    resource: 'credits',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },

  // Energy
  {
    id: 'big_crunch_generator',
    name: 'Big Crunch Generator',
    description: 'Triggers controlled universal collapses to harvest total cosmic energy.',
    icon: 'i-lucide-shrink',
    baseCost: 5e33,
    costMultiplier: 1.045,
    baseOutput: 4.87e29,
    resource: 'energy',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'multiversal_conduit',
    name: 'Multiversal Conduit',
    description: 'Siphons energy across the membrane between parallel universes.',
    icon: 'i-lucide-git-merge',
    baseCost: 100e33,
    costMultiplier: 1.048,
    baseOutput: 6.82e30,
    resource: 'energy',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'boltzmann_brain_farm',
    name: 'Boltzmann Brain Farm',
    description: 'Cultivates spontaneous consciousness fluctuations as energy sources.',
    icon: 'i-lucide-brain',
    baseCost: 5e36,
    costMultiplier: 1.050,
    baseOutput: 2.39e32,
    resource: 'energy',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'reality_annihilator',
    name: 'Reality Annihilator',
    description: 'Converts entire universes into pure energy.',
    icon: 'i-lucide-bomb',
    baseCost: 100e36,
    costMultiplier: 1.053,
    baseOutput: 3.34e33,
    resource: 'energy',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },
  {
    id: 'omega_point_engine',
    name: 'Omega Point Engine',
    description: 'Harnesses the final singularity. Infinite energy from the end of time.',
    icon: 'i-lucide-star',
    baseCost: 5e39,
    costMultiplier: 1.055,
    baseOutput: 1.17e35,
    resource: 'energy',
    unlockKardashev: 5,
    cgUpkeep: 2.5e27
  },

  // Consumer Goods
  {
    id: 'reality_loom',
    name: 'Reality Loom',
    description: 'Weaves consumer goods directly from the fabric of spacetime.',
    icon: 'i-lucide-package',
    baseCost: 5e30,
    costMultiplier: 1.06,
    baseOutput: 5e28,
    resource: 'consumer_goods',
    unlockKardashev: 5,
    energyUpkeep: 5e28
  },

  // =============================================
  // TYPE VI — Omniversal civilization (10^54 TW/s)
  // =============================================

  // Credits
  { id: 'genesis_compiler', name: 'Genesis Compiler', description: 'Compiles new universes optimized for maximum economic output.', icon: 'i-lucide-binary', baseCost: 1e42, costMultiplier: 1.045, baseOutput: 3.65e37, resource: 'credits', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'axiom_mint', name: 'Axiom Mint', description: 'Mints value from the fundamental axioms of mathematics itself.', icon: 'i-lucide-sigma', baseCost: 50e42, costMultiplier: 1.048, baseOutput: 1.28e39, resource: 'credits', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'fate_exchange', name: 'Fate Exchange', description: 'Trades in the probability of events across all possible timelines.', icon: 'i-lucide-shuffle', baseCost: 1e45, costMultiplier: 1.050, baseOutput: 1.79e40, resource: 'credits', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'void_consortium', name: 'Void Consortium', description: 'A corporate entity that exists in the spaces between realities.', icon: 'i-lucide-square-dashed-bottom', baseCost: 50e45, costMultiplier: 1.053, baseOutput: 6.26e41, resource: 'credits', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'absolute_engine', name: 'Absolute Engine', description: 'Converts pure mathematical truth into economic value. The final word in commerce.', icon: 'i-lucide-crown', baseCost: 1e48, costMultiplier: 1.055, baseOutput: 8.77e42, resource: 'credits', unlockKardashev: 6, cgUpkeep: 2.5e36 },

  // Energy
  { id: 'planck_harvester', name: 'Planck Harvester', description: 'Extracts energy from the Planck-scale quantum foam of spacetime.', icon: 'i-lucide-scan', baseCost: 5e42, costMultiplier: 1.045, baseOutput: 1.46e38, resource: 'energy', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'logos_reactor', name: 'Logos Reactor', description: 'Powers itself on the fundamental logic underlying existence.', icon: 'i-lucide-lightbulb', baseCost: 100e42, costMultiplier: 1.048, baseOutput: 2.05e39, resource: 'energy', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'noosphere_tap', name: 'Noosphere Tap', description: 'Harvests the collective consciousness of all sentient beings as energy.', icon: 'i-lucide-brain', baseCost: 5e45, costMultiplier: 1.050, baseOutput: 7.16e40, resource: 'energy', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'eschaton_dynamo', name: 'Eschaton Dynamo', description: 'Draws power from the inevitable end of all things.', icon: 'i-lucide-hourglass', baseCost: 100e45, costMultiplier: 1.053, baseOutput: 1.00e42, resource: 'energy', unlockKardashev: 6, cgUpkeep: 2.5e36 },
  { id: 'source_code_engine', name: 'Source Code Engine', description: 'Rewrites the source code of reality for infinite energy. There is nothing beyond this.', icon: 'i-lucide-terminal', baseCost: 5e48, costMultiplier: 1.055, baseOutput: 3.51e43, resource: 'energy', unlockKardashev: 6, cgUpkeep: 2.5e36 },

  // Consumer Goods
  {
    id: 'omnifactory',
    name: 'Omnifactory',
    description: 'Produces anything from nothing. The final word in manufacturing.',
    icon: 'i-lucide-package',
    baseCost: 5e42,
    costMultiplier: 1.06,
    baseOutput: 5e37,
    resource: 'consumer_goods',
    unlockKardashev: 6,
    energyUpkeep: 5e37
  }
]

const clickUpgradeConfig: ClickUpgradeConfig = {
  baseCost: 50,
  costMultiplier: 1.18,
  clickPowerAdd: 1,
}

// Real Kardashev scale: ~10^10 ratio between each level
// Energy unit: TW (terawatts)
const kardashevLevels: KardashevLevel[] = [
  { level: 0, name: 'Type 0', description: 'Sub-planetary civilization', energyPerSecond: 0 },
  { level: 1, name: 'Type I', description: 'Planetary civilization', energyPerSecond: 1e4 },
  { level: 2, name: 'Type II', description: 'Stellar civilization', energyPerSecond: 1e14 },
  { level: 3, name: 'Type III', description: 'Galactic civilization', energyPerSecond: 1e24 },
  { level: 4, name: 'Type IV', description: 'Universal civilization', energyPerSecond: 1e34 },
  { level: 5, name: 'Type V', description: 'Multiversal civilization', energyPerSecond: 1e44 },
  { level: 6, name: 'Type VI', description: 'Omniversal civilization', energyPerSecond: 1e54 }
]

const prestigeUpgrades: PrestigeUpgradeDefinition[] = [
  // ── Tier 0: Available immediately ──
  {
    id: 'quantum_computing',
    name: 'Quantum Computing',
    description: '1.5x Credits/s — quantum algorithms optimize every transaction',
    cost: 500,
    effect: { type: 'creditsMultiplier', value: 1.5 },
    requiredKardashev: 0
  },
  {
    id: 'plasma_reactors',
    name: 'Plasma Reactors',
    description: '1.5x Energy/s — next-gen plasma confinement boosts all energy',
    cost: 500,
    effect: { type: 'energyMultiplier', value: 1.5 },
    requiredKardashev: 0
  },
  {
    id: 'neural_clicking',
    name: 'Neural Clicking',
    description: '2x Click power — brain-computer interface amplifies clicks',
    cost: 800,
    effect: { type: 'clickMultiplier', value: 2 },
    requiredKardashev: 0
  },
  {
    id: 'quick_start',
    name: 'Quick Start',
    description: 'Start with 25 Mining Drones and 25 Solar Arrays after prestige',
    cost: 1500,
    effect: { type: 'quickStart', buildings: { mining_drone: 25, solar_array: 25 } },
    requiredKardashev: 0
  },
  { id: 'efficient_logistics', name: 'Efficient Logistics', description: '1.5x Consumer Goods/s — optimized supply chains', cost: 500, effect: { type: 'cgMultiplier', value: 1.5 }, requiredKardashev: 0 },
  // ── Tier 1: Requires Type I ──
  {
    id: 'corporate_synergy',
    name: 'Corporate Synergy',
    description: '2x Credits/s — vertical integration creates unstoppable revenue',
    cost: 5000,
    effect: { type: 'creditsMultiplier', value: 2 },
    requiredKardashev: 1
  },
  {
    id: 'fusion_breakthrough',
    name: 'Fusion Breakthrough',
    description: '2x Energy/s — cold fusion breakthrough, energy output explodes',
    cost: 5000,
    effect: { type: 'energyMultiplier', value: 2 },
    requiredKardashev: 1
  },
  {
    id: 'drone_swarm_ai',
    name: 'Drone Swarm AI',
    description: '2x Pop output — autonomous drone networks multiply workforce',
    cost: 8000,
    effect: { type: 'popMultiplier', value: 2 },
    requiredKardashev: 1
  },
  { id: 'interstellar_supply', name: 'Interstellar Supply Lines', description: '2x Consumer Goods/s — interplanetary logistics network', cost: 5000, effect: { type: 'cgMultiplier', value: 2 }, requiredKardashev: 1 },
  // ── Tier 2: Requires Type II ──
  {
    id: 'bulk_contracts',
    name: 'Bulk Contracts',
    description: 'Buildings cost 50% less — galaxy-wide procurement slashes prices',
    cost: 15000,
    effect: { type: 'buildingCostMultiplier', value: 0.5 },
    requiredKardashev: 2
  },
  {
    id: 'stellar_mastery',
    name: 'Stellar Mastery',
    description: '3x Energy/s — complete mastery over stellar energy harvesting',
    cost: 25000,
    effect: { type: 'energyMultiplier', value: 3 },
    requiredKardashev: 2
  },
  {
    id: 'galactic_trade',
    name: 'Galactic Trade Networks',
    description: '3x Credits/s — interstellar trade routes flood your coffers',
    cost: 25000,
    effect: { type: 'creditsMultiplier', value: 3 },
    requiredKardashev: 2
  },
  { id: 'galactic_distribution', name: 'Galactic Distribution', description: '3x Consumer Goods/s — galaxy-spanning supply infrastructure', cost: 25000, effect: { type: 'cgMultiplier', value: 3 }, requiredKardashev: 2 },
  // ── Tier 3: Requires Type III ──
  {
    id: 'galactic_monopoly',
    name: 'Galactic Monopoly',
    description: '5x Credits/s — total economic dominance across the galaxy',
    cost: 150000,
    effect: { type: 'creditsMultiplier', value: 5 },
    requiredKardashev: 3
  },
  {
    id: 'cosmic_energy_grid',
    name: 'Cosmic Energy Grid',
    description: '5x Energy/s — a galaxy-spanning energy collection network',
    cost: 150000,
    effect: { type: 'energyMultiplier', value: 5 },
    requiredKardashev: 3
  },
  {
    id: 'transcendent_workforce',
    name: 'Transcendent Workforce',
    description: '3x Pop output — post-biological workers transcend physical limits',
    cost: 100000,
    effect: { type: 'popMultiplier', value: 3 },
    requiredKardashev: 3
  },
  { id: 'universal_fabrication', name: 'Universal Fabrication', description: '5x Consumer Goods/s — cross-dimensional manufacturing', cost: 150000, effect: { type: 'cgMultiplier', value: 5 }, requiredKardashev: 3 },
  // ── Tier 4: Requires Type IV ──
  {
    id: 'universal_dominion',
    name: 'Universal Dominion',
    description: '10x Credits/s — universal-scale economic supremacy',
    cost: 1000000,
    effect: { type: 'creditsMultiplier', value: 10 },
    requiredKardashev: 4
  },
  {
    id: 'cosmic_omniscience',
    name: 'Cosmic Omniscience',
    description: '10x Energy/s — harness the fundamental forces of the universe',
    cost: 1000000,
    effect: { type: 'energyMultiplier', value: 10 },
    requiredKardashev: 4
  },
  {
    id: 'reality_rewrite',
    name: 'Reality Rewrite',
    description: 'Buildings cost 75% less — rewrite the laws of economics itself',
    cost: 500000,
    effect: { type: 'buildingCostMultiplier', value: 0.25 },
    requiredKardashev: 4
  },
  { id: 'omnipresent_supply', name: 'Omnipresent Supply', description: '10x Consumer Goods/s — goods materialize from pure will', cost: 1000000, effect: { type: 'cgMultiplier', value: 10 }, requiredKardashev: 4 },
]

const repeatablePrestigeUpgrades: RepeatablePrestigeUpgrade[] = [
  {
    id: 'profit_margins',
    name: 'Profit Margins',
    description: '+10% Credits/s per level',
    icon: 'i-lucide-banknote',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'creditsMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'reactor_efficiency',
    name: 'Reactor Efficiency',
    description: '+10% Energy/s per level',
    icon: 'i-lucide-zap',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'energyMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'click_amplifier',
    name: 'Click Amplifier',
    description: '+10% Click power per level',
    icon: 'i-lucide-mouse-pointer-click',
    baseCost: 150,
    costScale: 1.8,
    maxLevel: 25,
    effect: { type: 'clickMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'workforce_training',
    name: 'Workforce Training',
    description: '+10% Pop output per level',
    icon: 'i-lucide-users',
    baseCost: 150,
    costScale: 1.8,
    maxLevel: 25,
    effect: { type: 'popMultiplier', valuePerLevel: 1.10 }
  },
  {
    id: 'bulk_purchasing',
    name: 'Bulk Purchasing',
    description: '-3% Building costs per level',
    icon: 'i-lucide-tags',
    baseCost: 200,
    costScale: 2.0,
    maxLevel: 20,
    effect: { type: 'buildingCostMultiplier', valuePerLevel: 0.97 }
  },
  {
    id: 'casino_vip',
    name: 'Casino VIP',
    description: '+8% Casino winnings per level',
    icon: 'i-lucide-dices',
    baseCost: 150,
    costScale: 1.8,
    maxLevel: 20,
    effect: { type: 'casinoMultiplier', valuePerLevel: 1.08 }
  },
  {
    id: 'operational_efficiency',
    name: 'Operational Efficiency',
    description: '-3% upkeep costs per level',
    icon: 'i-lucide-wrench',
    baseCost: 200,
    costScale: 2.0,
    maxLevel: 20,
    effect: { type: 'upkeepReduction', valuePerLevel: 0.97 }
  },
  {
    id: 'supply_optimization',
    name: 'Supply Optimization',
    description: '+10% Consumer Goods/s per level',
    icon: 'i-lucide-package',
    baseCost: 100,
    costScale: 1.8,
    maxLevel: 30,
    effect: { type: 'cgMultiplier', valuePerLevel: 1.10 }
  },
]

export function useGameConfig() {
  return {
    buildings: readonly(buildings),
    clickUpgradeConfig: readonly(clickUpgradeConfig),
    kardashevLevels: readonly(kardashevLevels),
    prestigeUpgrades: readonly(prestigeUpgrades),
    repeatablePrestigeUpgrades: readonly(repeatablePrestigeUpgrades)
  }
}
