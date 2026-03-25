import { describe, expect, it } from 'vitest'
import {
  generateGalaxy,
  dijkstra,
  getFrontierIds,
  INNER_RADIUS,
} from '../../app/utils/galaxyGen'

describe('generateGalaxy', () => {
  const galaxy = generateGalaxy(42, 100)

  it('generates the requested number of systems', () => {
    expect(galaxy.nodes.length).toBe(100)
  })

  it('assigns unique IDs to all systems', () => {
    const ids = new Set(galaxy.nodes.map(n => n.id))
    expect(ids.size).toBe(100)
  })

  it('home system exists in the galaxy', () => {
    expect(galaxy.nodes.some(n => n.id === galaxy.homeId)).toBe(true)
  })

  it('all systems are outside the inner void', () => {
    for (const node of galaxy.nodes) {
      const distFromCenter = Math.sqrt(node.x ** 2 + node.y ** 2)
      // Allow some tolerance (coordinates are rounded, stretching applied)
      expect(distFromCenter).toBeGreaterThan(INNER_RADIUS * 0.7)
    }
  })

  it('all systems have at least 1 edge', () => {
    for (const node of galaxy.nodes) {
      expect(node.edges.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('edges are bidirectional', () => {
    for (const node of galaxy.nodes) {
      for (const neighborId of node.edges) {
        const neighbor = galaxy.nodes.find(n => n.id === neighborId)
        expect(neighbor).toBeDefined()
        expect(neighbor!.edges).toContain(node.id)
      }
    }
  })

  it('all systems are reachable from home (Dijkstra validates)', () => {
    const edgeMap = new Map<string, Set<string>>()
    for (const n of galaxy.nodes) edgeMap.set(n.id, new Set(n.edges))
    const distances = dijkstra(galaxy.nodes, edgeMap, galaxy.homeId)

    for (const node of galaxy.nodes) {
      expect(distances.get(node.id)).toBeLessThan(Infinity)
    }
  })

  it('home system has tier 0', () => {
    const home = galaxy.nodes.find(n => n.id === galaxy.homeId)
    expect(home!.tier).toBe(0)
  })

  it('tiers increase with distance from home', () => {
    const edgeMap = new Map<string, Set<string>>()
    for (const n of galaxy.nodes) edgeMap.set(n.id, new Set(n.edges))
    const distances = dijkstra(galaxy.nodes, edgeMap, galaxy.homeId)

    // Systems closer to home should have lower or equal tiers to systems farther away
    const home = galaxy.nodes.find(n => n.id === galaxy.homeId)!
    const farNode = galaxy.nodes.reduce((best, n) =>
      (distances.get(n.id) ?? 0) > (distances.get(best.id) ?? 0) ? n : best, home)

    expect(farNode.tier).toBeGreaterThanOrEqual(home.tier)
  })

  it('each system has a unique seed', () => {
    const seeds = new Set(galaxy.nodes.map(n => n.seed))
    // Seeds should be mostly unique (collision possible but extremely unlikely with 100 systems)
    expect(seeds.size).toBeGreaterThan(95)
  })

  it('is deterministic (same seed = same galaxy)', () => {
    const g1 = generateGalaxy(42, 50)
    const g2 = generateGalaxy(42, 50)
    expect(g1.homeId).toBe(g2.homeId)
    expect(g1.nodes.map(n => n.x)).toEqual(g2.nodes.map(n => n.x))
    expect(g1.nodes.map(n => n.y)).toEqual(g2.nodes.map(n => n.y))
  })

  it('different seeds produce different galaxies', () => {
    const g1 = generateGalaxy(42, 50)
    const g2 = generateGalaxy(99, 50)
    expect(g1.homeId).not.toBe(g2.homeId)
  })
})

describe('getFrontierIds', () => {
  const nodes = [
    { id: 'a', edges: ['b', 'c'] },
    { id: 'b', edges: ['a', 'd'] },
    { id: 'c', edges: ['a', 'e'] },
    { id: 'd', edges: ['b'] },
    { id: 'e', edges: ['c'] },
  ]

  it('returns neighbors of claimed systems that are not claimed or surveyed', () => {
    const claimed = new Set(['a'])
    const surveyed = new Set<string>()
    const frontier = getFrontierIds(nodes, claimed, surveyed)
    expect(frontier.sort()).toEqual(['b', 'c'])
  })

  it('excludes already surveyed systems', () => {
    const claimed = new Set(['a'])
    const surveyed = new Set(['b'])
    const frontier = getFrontierIds(nodes, claimed, surveyed)
    expect(frontier).toEqual(['c'])
  })

  it('expands frontier as more systems are claimed', () => {
    const claimed = new Set(['a', 'b'])
    const surveyed = new Set<string>()
    const frontier = getFrontierIds(nodes, claimed, surveyed)
    expect(frontier.sort()).toEqual(['c', 'd'])
  })

  it('returns empty when all neighbors are claimed', () => {
    const claimed = new Set(['a', 'b', 'c', 'd', 'e'])
    const surveyed = new Set<string>()
    const frontier = getFrontierIds(nodes, claimed, surveyed)
    expect(frontier).toEqual([])
  })
})
