// ── Galaxy Generation: Donut-shaped graph with Dijkstra validation ──

// Inline seeded RNG to avoid composable import in pure utility
function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// ── Constants ──

export const INNER_RADIUS = 200   // black hole exclusion zone
export const OUTER_RADIUS = 600   // galaxy outer edge
export const STRETCH_X = 1.3      // elliptical stretch (oval)
export const STRETCH_Y = 1.0
export const GOLDEN_ANGLE = 2.399963 // ~137.5° in radians — golden angle for even distribution
export const DEFAULT_SYSTEM_COUNT = 120
export const NEIGHBOR_K = 3       // connect each system to 1-3 nearest neighbors
export const MAX_EDGE_DISTANCE = 200 // max distance for an edge

// ── Types ──

export interface GalaxyNode {
  id: string
  x: number
  y: number
  seed: number      // per-system seed for content generation
  tier: number      // assigned by Dijkstra distance from home
  edges: string[]   // connected system IDs
}

export interface GeneratedGalaxy {
  nodes: GalaxyNode[]
  homeId: string
}

// ── Coordinate Generation: Donut Placement ──

function generateDonutCoordinates(count: number, rng: () => number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []

  for (let i = 0; i < count; i++) {
    // Golden angle distribution for even spacing around ring
    const theta = GOLDEN_ANGLE * i + rng() * 0.3 // slight random jitter

    // Random radius within annulus (inner to outer)
    const r = INNER_RADIUS + rng() * (OUTER_RADIUS - INNER_RADIUS)

    // Warp to elliptical shape
    const x = r * Math.cos(theta) * STRETCH_X
    const y = r * Math.sin(theta) * STRETCH_Y

    points.push({ x, y })
  }

  return points
}

// ── Edge Building ──

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// Check if a line segment from A to B crosses the inner void circle
function crossesVoid(a: { x: number; y: number }, b: { x: number; y: number }, voidRadius: number): boolean {
  // Find closest point on line segment AB to origin (0,0)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return false // A and B are the same point

  // Parameter t for closest point: clamp to [0,1] for segment
  let t = -(a.x * dx + a.y * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  // Closest point on segment
  const cx = a.x + t * dx
  const cy = a.y + t * dy

  // Distance from origin to closest point
  const distToCenter = Math.sqrt(cx * cx + cy * cy)

  return distToCenter < voidRadius
}

function buildEdges(nodes: { id: string; x: number; y: number }[], rng: () => number): Map<string, Set<string>> {
  const edges = new Map<string, Set<string>>()
  for (const n of nodes) edges.set(n.id, new Set())

  // For each node, connect to 1-3 nearest neighbors (that don't cross void)
  for (const node of nodes) {
    const k = 1 + Math.floor(rng() * NEIGHBOR_K) // 1 to NEIGHBOR_K edges

    // Sort all other nodes by distance
    const sorted = nodes
      .filter(n => n.id !== node.id)
      .map(n => ({ id: n.id, dist: distance(node, n), x: n.x, y: n.y }))
      .sort((a, b) => a.dist - b.dist)

    let connected = 0
    for (const candidate of sorted) {
      if (connected >= k) break
      if (candidate.dist > MAX_EDGE_DISTANCE) break

      // Check void crossing
      if (crossesVoid(node, candidate, INNER_RADIUS * 0.8)) continue

      // Add bidirectional edge
      edges.get(node.id)!.add(candidate.id)
      edges.get(candidate.id)!.add(node.id)
      connected++
    }
  }

  return edges
}

// ── Dijkstra: Shortest Path from Home ──

export function dijkstra(nodes: { id: string }[], edges: Map<string, Set<string>>, startId: string): Map<string, number> {
  const dist = new Map<string, number>()
  const visited = new Set<string>()

  for (const n of nodes) dist.set(n.id, Infinity)
  dist.set(startId, 0)

  // Simple priority queue (array-based, fine for ~100-200 nodes)
  const queue = [startId]

  while (queue.length > 0) {
    // Find unvisited node with smallest distance
    queue.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity))
    const current = queue.shift()!

    if (visited.has(current)) continue
    visited.add(current)

    const currentDist = dist.get(current) ?? Infinity
    if (currentDist === Infinity) break // remaining nodes unreachable

    for (const neighbor of edges.get(current) ?? []) {
      if (visited.has(neighbor)) continue
      const newDist = currentDist + 1 // uniform edge weight
      if (newDist < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDist)
        queue.push(neighbor)
      }
    }
  }

  return dist
}

// ── Connectivity: Ensure All Nodes Reachable ──

function ensureConnected(
  nodes: { id: string; x: number; y: number }[],
  edges: Map<string, Set<string>>,
  homeId: string
): void {
  const distances = dijkstra(nodes, edges, homeId)

  // Find unreachable nodes
  const unreachable = nodes.filter(n => (distances.get(n.id) ?? Infinity) === Infinity)

  if (unreachable.length === 0) return

  // For each unreachable node, connect to nearest reachable node (ignoring void check)
  const reachable = nodes.filter(n => (distances.get(n.id) ?? Infinity) < Infinity)

  for (const ur of unreachable) {
    let nearest: string | null = null
    let nearestDist = Infinity
    for (const r of reachable) {
      const d = distance(ur, r)
      if (d < nearestDist) {
        nearestDist = d
        nearest = r.id
      }
    }
    if (nearest) {
      edges.get(ur.id)!.add(nearest)
      edges.get(nearest)!.add(ur.id)
      reachable.push(ur) // now reachable for future iterations
    }
  }
}

// ── Tier Assignment (based on Dijkstra hop distance from home) ──

function assignTiers(distances: Map<string, number>, maxTier: number = 5): Map<string, number> {
  const tiers = new Map<string, number>()
  const maxDist = Math.max(...[...distances.values()].filter(d => d < Infinity))

  for (const [id, dist] of distances) {
    if (dist === Infinity) {
      tiers.set(id, maxTier)
    } else {
      // Map distance to tier 0-maxTier
      const tier = Math.min(maxTier, Math.floor((dist / (maxDist + 1)) * (maxTier + 1)))
      tiers.set(id, tier)
    }
  }

  return tiers
}

// ── Main Generation Function ──

export function generateGalaxy(masterSeed: number, systemCount: number = DEFAULT_SYSTEM_COUNT): GeneratedGalaxy {
  const rng = seededRandom(masterSeed)

  // 1. Generate donut coordinates
  const coords = generateDonutCoordinates(systemCount, rng)

  // 2. Create nodes with IDs and per-system seeds
  const nodes: GalaxyNode[] = coords.map((c, i) => ({
    id: `sys_${i}`,
    x: Math.round(c.x),
    y: Math.round(c.y),
    seed: Math.floor(rng() * 2147483647),
    tier: 0,
    edges: [],
  }))

  // 3. Pick home system (random position on the ring)
  const homeIndex = Math.floor(rng() * systemCount)
  const homeId = nodes[homeIndex]!.id

  // 4. Build edges (K nearest neighbors, no void crossing)
  const edgeMap = buildEdges(nodes, rng)

  // 5. Ensure connectivity via Dijkstra
  ensureConnected(nodes, edgeMap, homeId)

  // 6. Run final Dijkstra for tier assignment
  const distances = dijkstra(nodes, edgeMap, homeId)
  const tiers = assignTiers(distances)

  // 7. Apply tiers and edges to nodes
  for (const node of nodes) {
    node.tier = tiers.get(node.id) ?? 0
    node.edges = [...(edgeMap.get(node.id) ?? [])]
  }

  return { nodes, homeId }
}

// ── Utility: Get frontier systems (adjacent to claimed but not claimed/surveyed) ──

export function getFrontierIds(
  allNodes: { id: string; edges: string[] }[],
  claimedIds: Set<string>,
  surveyedIds: Set<string>
): string[] {
  const frontier: string[] = []
  const nodeMap = new Map(allNodes.map(n => [n.id, n]))

  for (const claimedId of claimedIds) {
    const node = nodeMap.get(claimedId)
    if (!node) continue
    for (const neighborId of node.edges) {
      if (!claimedIds.has(neighborId) && !surveyedIds.has(neighborId)) {
        if (!frontier.includes(neighborId)) {
          frontier.push(neighborId)
        }
      }
    }
  }

  return frontier
}
