<script setup lang="ts">
const emit = defineEmits<{ selectSystem: [systemIndex: number] }>()

const { state } = useGameState()
const { frontierIds } = useGalaxy()
const { formatNumber } = useNumberFormat()
const { getStarType } = useGalaxyConfig()

// Map center: average of all system positions
const mapCenter = computed<[number, number]>(() => {
  const systems = state.value.systems ?? []
  if (systems.length === 0) return [0, 0]
  // Find home system to center on
  const home = systems.find(s => s.status === 'claimed')
  if (home) return [home.y, home.x] // Leaflet uses [lat, lng] = [y, x]
  return [0, 0]
})

// Color by status
function getSystemColor(sys: { id: string; status: string }): string {
  if (sys.status === 'claimed') return '#4ade80'     // green
  if (sys.status === 'surveyed') return '#fbbf24'    // amber
  if (frontierIds.value.includes(sys.id)) return '#818cf8' // indigo (frontier)
  return '#3f3f46'                                    // dim zinc (fog)
}

function getSystemRadius(sys: { status: string; stars: any[] }): number {
  if (sys.status === 'claimed') return 6
  if (sys.status === 'surveyed') return 5
  return 3
}

function getSystemOpacity(sys: { id: string; status: string }): number {
  if (sys.status === 'claimed') return 1
  if (sys.status === 'surveyed') return 0.9
  if (frontierIds.value.includes(sys.id)) return 0.7
  return 0.2 // fog
}

// Edge color
function getEdgeColor(sys1: { status: string }, sys2: { status: string }): string {
  if (sys1.status === 'claimed' && sys2.status === 'claimed') return '#4ade8040'
  if (sys1.status === 'claimed' || sys2.status === 'claimed') return '#818cf820'
  return '#3f3f4610'
}

function handleSystemClick(systemIndex: number) {
  emit('selectSystem', systemIndex)
}
</script>

<template>
  <div class="w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
    <LMap
      :zoom="1"
      :center="mapCenter"
      :min-zoom="-2"
      :max-zoom="4"
      :use-global-leaflet="false"
      style="background: #09090b;"
      :options="{ attributionControl: false, zoomControl: true }"
    >
      <!-- Edges -->
      <template v-for="(sys, si) in state.systems" :key="'edge_' + sys.id">
        <template v-for="neighborId in sys.edges" :key="'e_' + sys.id + '_' + neighborId">
          <LPolyline
            v-if="sys.id < neighborId"
            :lat-lngs="[
              [sys.y, sys.x],
              [(state.systems.find(s => s.id === neighborId)?.y ?? 0), (state.systems.find(s => s.id === neighborId)?.x ?? 0)]
            ]"
            :color="getEdgeColor(sys, state.systems.find(s => s.id === neighborId) ?? sys)"
            :weight="1"
          />
        </template>
      </template>

      <!-- Black hole center indicator -->
      <LCircle
        :lat-lng="[0, 0]"
        :radius="200"
        color="#7c3aed30"
        fill-color="#7c3aed10"
        :fill="true"
        :weight="1"
      />

      <!-- System markers -->
      <LCircleMarker
        v-for="(sys, si) in state.systems"
        :key="sys.id"
        :lat-lng="[sys.y, sys.x]"
        :radius="getSystemRadius(sys)"
        :color="getSystemColor(sys)"
        :fill-color="getSystemColor(sys)"
        :fill="true"
        :fill-opacity="getSystemOpacity(sys)"
        :opacity="getSystemOpacity(sys)"
        :weight="1"
        @click="handleSystemClick(si)"
      >
        <LTooltip v-if="sys.status !== 'undiscovered' || frontierIds.includes(sys.id)">
          <div class="text-xs">
            <div class="font-bold">{{ sys.status === 'undiscovered' ? 'Unknown System' : sys.name }}</div>
            <div v-if="sys.status !== 'undiscovered'" class="text-zinc-400">
              {{ sys.stars.length }} star{{ sys.stars.length > 1 ? 's' : '' }}
              <span v-if="sys.planetSlots.length > 0"> · {{ sys.planetSlots.length }} planet{{ sys.planetSlots.length > 1 ? 's' : '' }}</span>
            </div>
            <div v-if="sys.status === 'claimed'" class="text-emerald-400">Claimed</div>
            <div v-else-if="sys.status === 'surveyed'" class="text-amber-400">Surveyed — click to claim</div>
            <div v-else class="text-indigo-400">Frontier — click to survey</div>
          </div>
        </LTooltip>
      </LCircleMarker>
    </LMap>
  </div>
</template>
