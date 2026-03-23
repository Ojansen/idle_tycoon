import { describe, expect, it } from 'vitest'
import { calcBuildingMultiplier, calcUpkeepMultiplier, calcBuildingCost } from '../../app/utils/gameMath'

// ── Building data Types 0-5 ──

interface B { id: string; name: string; baseCost: number; cm: number; out: number; res: 'cr'|'en'|'pop'|'cg'; tier: number; eUp?: number; cgUp?: number }

// prettier-ignore
const ALL: B[] = [
  // TYPE 0
  { id: 'mining_drone',     name: 'Mining Drone',      baseCost: 10,     cm: 1.045, out: 0.5,      res: 'cr',  tier: 0, cgUp: 0.02 },
  { id: 'ore_refinery',     name: 'Ore Refinery',      baseCost: 150,    cm: 1.048, out: 5.3,      res: 'cr',  tier: 0, cgUp: 0.05 },
  { id: 'cargo_shuttle',    name: 'Cargo Shuttle',     baseCost: 1500,   cm: 1.050, out: 37,       res: 'cr',  tier: 0, cgUp: 0.12 },
  { id: 'orbital_factory',  name: 'Orbital Factory',   baseCost: 10000,  cm: 1.053, out: 172,      res: 'cr',  tier: 0, cgUp: 0.30 },
  { id: 'space_station',    name: 'Space Station',     baseCost: 50000,  cm: 1.055, out: 600,      res: 'cr',  tier: 0, cgUp: 0.75 },
  { id: 'solar_array',      name: 'Solar Array',       baseCost: 50,     cm: 1.045, out: 2.0,      res: 'en',  tier: 0, cgUp: 0.02 },
  { id: 'wind_turbine',     name: 'Wind Turbine',      baseCost: 400,    cm: 1.048, out: 11.2,     res: 'en',  tier: 0, cgUp: 0.05 },
  { id: 'geothermal_tap',   name: 'Geothermal Tap',    baseCost: 3000,   cm: 1.050, out: 59,       res: 'en',  tier: 0, cgUp: 0.12 },
  { id: 'fission_plant',    name: 'Fission Plant',     baseCost: 20000,  cm: 1.053, out: 274,      res: 'en',  tier: 0, cgUp: 0.30 },
  { id: 'orbital_mirror',   name: 'Orbital Mirror',    baseCost: 80000,  cm: 1.055, out: 960,      res: 'en',  tier: 0, cgUp: 0.75 },
  { id: 'consumer_factory', name: 'Consumer Factory',  baseCost: 500,    cm: 1.06,  out: 5,        res: 'cg',  tier: 0, eUp: 5 },
  // TYPE 1
  { id: 'asteroid_mine',    name: 'Asteroid Mine',     baseCost: 2e5,    cm: 1.045, out: 3000,     res: 'cr',  tier: 1, cgUp: 20 },
  { id: 'trade_hub',        name: 'Trade Hub',         baseCost: 1e6,    cm: 1.048, out: 10500,    res: 'cr',  tier: 1, cgUp: 50 },
  { id: 'planetary_exch',   name: 'Planetary Exch.',   baseCost: 5e6,    cm: 1.050, out: 36800,    res: 'cr',  tier: 1, cgUp: 125 },
  { id: 'megacorp_hq',      name: 'MegaCorp HQ',      baseCost: 25e6,   cm: 1.053, out: 129000,   res: 'cr',  tier: 1, cgUp: 300 },
  { id: 'system_monopoly',  name: 'System Monopoly',   baseCost: 100e6,  cm: 1.055, out: 360000,   res: 'cr',  tier: 1, cgUp: 750 },
  { id: 'fusion_reactor',   name: 'Fusion Reactor',    baseCost: 3e5,    cm: 1.045, out: 3600,     res: 'en',  tier: 1, cgUp: 20 },
  { id: 'planetary_grid',   name: 'Planetary Grid',    baseCost: 2e6,    cm: 1.048, out: 16800,    res: 'en',  tier: 1, cgUp: 50 },
  { id: 'antimatter_forge', name: 'Antimatter Forge',  baseCost: 15e6,   cm: 1.050, out: 88200,    res: 'en',  tier: 1, cgUp: 125 },
  { id: 'helium3',          name: 'Helium-3 Harv.',    baseCost: 80e6,   cm: 1.053, out: 329000,   res: 'en',  tier: 1, cgUp: 300 },
  { id: 'stellar_coll',     name: 'Stellar Collector', baseCost: 500e6,  cm: 1.055, out: 1.44e6,   res: 'en',  tier: 1, cgUp: 750 },
  { id: 'industrial_cplx',  name: 'Industrial Cmplx.', baseCost: 5e5,    cm: 1.06,  out: 5e3,      res: 'cg',  tier: 1, eUp: 5e3 },
  // TYPE 2
  { id: 'colony_world',     name: 'Colony World',      baseCost: 1e9,    cm: 1.045, out: 4.5e6,    res: 'cr',  tier: 2, cgUp: 2e4 },
  { id: 'stellar_shipyard', name: 'Stellar Shipyard',  baseCost: 10e9,   cm: 1.048, out: 3.15e7,   res: 'cr',  tier: 2, cgUp: 5e4 },
  { id: 'galactic_bank',    name: 'Galactic Bank',     baseCost: 100e9,  cm: 1.050, out: 2.21e8,   res: 'cr',  tier: 2, cgUp: 1.25e5 },
  { id: 'matter_synth',     name: 'Matter Synth.',     baseCost: 1e12,   cm: 1.053, out: 1.54e9,   res: 'cr',  tier: 2, cgUp: 3e5 },
  { id: 'sector_conglom',   name: 'Sector Conglom.',   baseCost: 20e12,  cm: 1.055, out: 2.16e10,  res: 'cr',  tier: 2, cgUp: 7.5e5 },
  { id: 'dyson_swarm',      name: 'Dyson Swarm',       baseCost: 2e9,    cm: 1.045, out: 7.2e6,    res: 'en',  tier: 2, cgUp: 2e4 },
  { id: 'dyson_sphere',     name: 'Dyson Sphere',      baseCost: 50e9,   cm: 1.048, out: 1.26e8,   res: 'en',  tier: 2, cgUp: 5e4 },
  { id: 'penrose_engine',   name: 'Penrose Engine',    baseCost: 500e9,  cm: 1.050, out: 8.82e8,   res: 'en',  tier: 2, cgUp: 1.25e5 },
  { id: 'star_lifter',      name: 'Star Lifter',       baseCost: 10e12,  cm: 1.053, out: 1.24e10,  res: 'en',  tier: 2, cgUp: 3e5 },
  { id: 'kugelblitz',       name: 'Kugelblitz React.', baseCost: 500e12, cm: 1.055, out: 4.32e11,  res: 'en',  tier: 2, cgUp: 7.5e5 },
  { id: 'stellar_forge_cg', name: 'Stellar Forge CG',  baseCost: 5e8,    cm: 1.06,  out: 5e6,      res: 'cg',  tier: 2, eUp: 5e6 },
  // TYPE 3
  { id: 'mega_forge',       name: 'Megastruct. Forge', baseCost: 1e15,   cm: 1.045, out: 1.35e12,  res: 'cr',  tier: 3, cgUp: 2e10 },
  { id: 'gal_trade',        name: 'Galactic Trade L.', baseCost: 50e15,  cm: 1.048, out: 4.73e13,  res: 'cr',  tier: 3, cgUp: 5e10 },
  { id: 'reality_market',   name: 'Reality Market',    baseCost: 1e18,   cm: 1.050, out: 6.62e14,  res: 'cr',  tier: 3, cgUp: 1.25e11 },
  { id: 'intergal_consort', name: 'Intergal. Consort.',baseCost: 50e18,  cm: 1.053, out: 2.32e16,  res: 'cr',  tier: 3, cgUp: 3e11 },
  { id: 'time_arb',         name: 'Time Arbitrage',    baseCost: 1e21,   cm: 1.055, out: 3.24e17,  res: 'cr',  tier: 3, cgUp: 7.5e11 },
  { id: 'stellar_engine',   name: 'Stellar Engine',    baseCost: 5e15,   cm: 1.045, out: 5.41e12,  res: 'en',  tier: 3, cgUp: 2e10 },
  { id: 'gal_core_tap',     name: 'Galactic Core Tap', baseCost: 100e15, cm: 1.048, out: 7.57e13,  res: 'en',  tier: 3, cgUp: 5e10 },
  { id: 'quasar_harv',      name: 'Quasar Harvester',  baseCost: 5e18,   cm: 1.050, out: 2.65e15,  res: 'en',  tier: 3, cgUp: 1.25e11 },
  { id: 'dark_matter_r',    name: 'Dark Matter React.',baseCost: 100e18, cm: 1.053, out: 3.71e16,  res: 'en',  tier: 3, cgUp: 3e11 },
  { id: 'neutron_battery',  name: 'Neutron Star Batt.',baseCost: 5e21,   cm: 1.055, out: 1.30e18,  res: 'en',  tier: 3, cgUp: 7.5e11 },
  { id: 'gal_fabricator',   name: 'Galactic Fabric.',  baseCost: 5e14,   cm: 1.06,  out: 5e12,     res: 'cg',  tier: 3, eUp: 5e12 },
  // TYPE 4
  { id: 'universe_factory', name: 'Universe Factory',  baseCost: 1e24,   cm: 1.045, out: 4.06e20,  res: 'cr',  tier: 4, cgUp: 2e18 },
  { id: 'entropy_bank',     name: 'Entropy Bank',      baseCost: 50e24,  cm: 1.048, out: 1.42e22,  res: 'cr',  tier: 4, cgUp: 5e18 },
  { id: 'vacuum_harv',      name: 'Vacuum Harvester',  baseCost: 5e24,   cm: 1.045, out: 1.62e21,  res: 'en',  tier: 4, cgUp: 2e18 },
  { id: 'cosmic_string',    name: 'Cosmic String Eng.',baseCost: 100e24, cm: 1.048, out: 2.27e22,  res: 'en',  tier: 4, cgUp: 5e18 },
  { id: 'univ_assembly',    name: 'Universal Assembly',baseCost: 5e22,   cm: 1.06,  out: 5e20,     res: 'cg',  tier: 4, eUp: 5e20 },
  // TYPE 5
  { id: 'multiverse_hold',  name: 'Multiverse Hold.', baseCost: 1e33,    cm: 1.045, out: 1.22e29,  res: 'cr',  tier: 5, cgUp: 2e26 },
  { id: 'big_crunch_gen',   name: 'Big Crunch Gen.',  baseCost: 5e33,    cm: 1.045, out: 4.87e29,  res: 'en',  tier: 5, cgUp: 2e26 },
  { id: 'reality_loom',     name: 'Reality Loom',     baseCost: 5e30,    cm: 1.06,  out: 5e28,     res: 'cg',  tier: 5, eUp: 5e28 },
]

const KARDASHEV = [0, 1e4, 1e14, 1e24, 1e34, 1e44]

// ── Engine ──

interface S { credits: number; energy: number; bldg: Record<string, number>; time: number; clicks: number }

function own(s: S, id: string) { return s.bldg[id] || 0 }

function prod(s: S, res: string) {
  let t = 0
  for (const b of ALL) {
    if (b.res !== res) continue
    const n = own(s, b.id)
    if (n) t += n * b.out * (res === 'cg' ? calcUpkeepMultiplier(n) : calcBuildingMultiplier(n))
  }
  return t
}

function eUpkeep(s: S) {
  let t = 0
  for (const b of ALL) { if (b.res !== 'cg' || !b.eUp) continue; const n = own(s, b.id); if (n) t += n * b.eUp * calcUpkeepMultiplier(n) }
  return t
}

function cgCons(s: S) {
  let t = 0
  for (const b of ALL) { if (b.res === 'cg' || !b.cgUp) continue; const n = own(s, b.id); if (n) t += n * b.cgUp * calcUpkeepMultiplier(n) }
  return t
}

function thr(p: number, c: number) { if (c <= 0) return 1; if (p >= c) return 1; return Math.max(0.25, p / c) }

function tick(s: S, dt: number) {
  const gE = prod(s, 'en'), eU = eUpkeep(s), eTh = thr(gE, eU)
  const cgP = prod(s, 'cg') * eTh, cgC = cgCons(s), cgTh = thr(cgP, cgC)
  const gCr = prod(s, 'cr'), nCr = gCr * cgTh, nE = Math.max(0, gE - eU)
  s.credits += nCr * dt; s.energy += nE * dt; s.time += dt
  return { gCr, gE, cgP, cgC, cgTh, eTh, nCr, nE }
}

function cost(s: S, id: string) { const b = ALL.find(x => x.id === id)!; return calcBuildingCost(b.baseCost, b.cm, own(s, id), 1) }

function buy(s: S, id: string) {
  const c = cost(s, id); if (s.credits < c) return false
  s.credits -= c; s.bldg[id] = (s.bldg[id] || 0) + 1; return true
}

// Earn until you can afford, then buy. Returns seconds waited.
function earnAndBuy(s: S, id: string, clicksPerSec = 3, maxWait = 36000): number {
  const targetCost = cost(s, id)
  let waited = 0
  while (s.credits < targetCost && waited < maxWait) {
    s.credits += clicksPerSec  // clicks
    s.clicks += clicksPerSec
    tick(s, 1)
    waited++
  }
  if (s.credits >= targetCost) buy(s, id)
  return waited
}

function earnAndBuyN(s: S, id: string, n: number, cps = 3): number {
  let total = 0
  for (let i = 0; i < n; i++) total += earnAndBuy(s, id, cps)
  return total
}

function kard(s: S) { const e = prod(s, 'en'); let l = 0; for (let i = 0; i < KARDASHEV.length; i++) if (e >= KARDASHEV[i]) l = i; return l }

function fmt(n: number) { if (Math.abs(n) < 1000) return n.toFixed(1); return n.toExponential(2) }

function status(s: S) {
  const r = tick(s, 0)
  const tb = Object.values(s.bldg).reduce((a, b) => a + b, 0)
  return `T${kard(s)} | ${fmtTime(s.time)} | ₢${fmt(s.credits)} (${fmt(r.nCr)}/s) | E=${fmt(r.nE)}/s | CG ${fmt(r.cgP)}/${fmt(r.cgC)} | eff=${(r.cgTh*100).toFixed(0)}%/${(r.eTh*100).toFixed(0)}% | ${tb} bldg`
}

function fmtTime(sec: number) {
  if (sec < 60) return `${sec.toFixed(0)}s`
  if (sec < 3600) return `${(sec/60).toFixed(1)}m`
  return `${(sec/3600).toFixed(1)}h`
}

// ── PLAYTHROUGH ──

describe('full playthrough — Type 0 to Type 5', () => {
  it('smart player earns and buys through all tiers', () => {
    const s: S = { credits: 0, energy: 0, bldg: {}, time: 0, clicks: 0 }
    const log: string[] = []

    function phase(label: string, purchases: [string, number][], cps = 3) {
      for (const [id, n] of purchases) earnAndBuyN(s, id, n, cps)
      const r = tick(s, 0)
      log.push(`${label.padEnd(22)} ${status(s)}`)
      return r
    }

    // ═══ TYPE 0 ═══
    log.push('─── TYPE 0: Sub-planetary ───')
    phase('Bootstrap',        [['mining_drone', 5], ['solar_array', 3], ['consumer_factory', 1]], 5)
    phase('Expand cheap',     [['ore_refinery', 5], ['wind_turbine', 3], ['consumer_factory', 1]])
    phase('Mid T0',           [['cargo_shuttle', 5], ['geothermal_tap', 3], ['consumer_factory', 2]])
    phase('Late T0',          [['orbital_factory', 5], ['fission_plant', 5], ['consumer_factory', 2]])
    phase('Top T0',           [['space_station', 5], ['orbital_mirror', 5], ['consumer_factory', 3]])

    // ═══ TYPE 1 ═══
    log.push('')
    log.push('─── TYPE 1: Planetary ───')
    phase('Enter T1',         [['asteroid_mine', 3], ['fusion_reactor', 3], ['industrial_cplx', 1]])
    phase('Expand T1',        [['trade_hub', 3], ['planetary_grid', 3], ['industrial_cplx', 1]])
    phase('Mid T1',           [['planetary_exch', 3], ['antimatter_forge', 3], ['industrial_cplx', 2]])
    phase('Late T1',          [['megacorp_hq', 3], ['helium3', 3], ['industrial_cplx', 2]])
    phase('Top T1',           [['system_monopoly', 3], ['stellar_coll', 3], ['industrial_cplx', 2]])

    // ═══ TYPE 2 ═══
    log.push('')
    log.push('─── TYPE 2: Stellar ───')
    phase('Enter T2',         [['colony_world', 3], ['dyson_swarm', 3], ['stellar_forge_cg', 1]])
    phase('Expand T2',        [['stellar_shipyard', 3], ['dyson_sphere', 3], ['stellar_forge_cg', 1]])
    phase('Mid T2',           [['galactic_bank', 3], ['penrose_engine', 3], ['stellar_forge_cg', 2]])
    phase('Late T2',          [['matter_synth', 3], ['star_lifter', 3], ['stellar_forge_cg', 2]])
    phase('Top T2',           [['sector_conglom', 3], ['kugelblitz', 3], ['stellar_forge_cg', 2]])

    // ═══ TYPE 3 ═══
    log.push('')
    log.push('─── TYPE 3: Galactic ───')
    phase('Enter T3',         [['mega_forge', 3], ['stellar_engine', 3], ['gal_fabricator', 1]])
    phase('Expand T3',        [['gal_trade', 3], ['gal_core_tap', 3], ['gal_fabricator', 2]])
    phase('Mid T3',           [['reality_market', 3], ['quasar_harv', 3], ['gal_fabricator', 2]])
    phase('Late T3',          [['intergal_consort', 3], ['dark_matter_r', 3], ['gal_fabricator', 2]])
    phase('Top T3',           [['time_arb', 3], ['neutron_battery', 3], ['gal_fabricator', 3]])

    // ═══ TYPE 4 ═══
    log.push('')
    log.push('─── TYPE 4: Universal ───')
    phase('Enter T4',         [['universe_factory', 3], ['vacuum_harv', 3], ['univ_assembly', 1]])
    phase('Expand T4',        [['entropy_bank', 3], ['cosmic_string', 3], ['univ_assembly', 2]])

    // ═══ TYPE 5 ═══
    log.push('')
    log.push('─── TYPE 5: Multiversal ───')
    phase('Enter T5',         [['multiverse_hold', 3], ['big_crunch_gen', 3], ['reality_loom', 1]])

    // ═══ SUMMARY ═══
    log.push('')
    log.push('═══════════════════════════════════════')
    log.push(`Total time: ${fmtTime(s.time)} | Clicks: ${s.clicks} | Kardashev: ${kard(s)}`)

    console.log('\n=== FULL PLAYTHROUGH ===')
    log.forEach(l => console.log('  ' + l))

    expect(kard(s)).toBeGreaterThanOrEqual(1)
  }, 30000) // 30s timeout for this heavy test
})
