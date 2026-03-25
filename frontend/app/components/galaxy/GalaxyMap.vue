<script setup lang="ts">
import L from 'leaflet'

const emit = defineEmits<{ selectSystem: [systemIndex: number] }>()

const { state } = useGameState()
const { frontierIds } = useGalaxy()
const { getStarType } = useGalaxyConfig()

// Map center: home system position
const mapCenter = computed<[number, number]>(() => {
  const systems = state.value.systems ?? []
  const home = systems.find(s => s.status === 'claimed')
  if (home) return [home.y, home.x]
  return [0, 0]
})

// Color by status
function getSystemColor(sys: { id: string; status: string }): string {
  if (sys.status === 'claimed') return '#4ade80'
  if (sys.status === 'surveyed') return '#fbbf24'
  if (frontierIds.value.includes(sys.id)) return '#818cf8'
  return '#3f3f46'
}

function getSystemRadius(sys: { status: string }): number {
  if (sys.status === 'claimed') return 12
  if (sys.status === 'surveyed') return 10
  return 7
}

function getSystemOpacity(sys: { id: string; status: string }): number {
  if (sys.status === 'claimed') return 1
  if (sys.status === 'surveyed') return 0.9
  if (frontierIds.value.includes(sys.id)) return 0.7
  return 0.15
}

function getEdgeColor(sys1: { status: string }, sys2: { status: string }): string {
  if (sys1.status === 'claimed' && sys2.status === 'claimed') return 'rgba(74, 222, 128, 0.25)'
  if (sys1.status === 'claimed' || sys2.status === 'claimed') return 'rgba(129, 140, 248, 0.12)'
  return 'rgba(63, 63, 70, 0.06)'
}

function handleSystemClick(systemIndex: number) {
  emit('selectSystem', systemIndex)
}
</script>

<template>
  <div class="w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-white/10">
    <LMap
      style="height: 100%; background: #09090b;"
      :zoom="0"
      :center="mapCenter"
      :min-zoom="-2"
      :max-zoom="4"
      :crs="L.CRS.Simple"
      :options="{ attributionControl: false }"
    >
      <!-- Edges between systems -->
      <template v-for="(sys, si) in (state.systems ?? [])" :key="'edges_' + sys.id">
        <LPolyline
          v-for="neighborId in sys.edges.filter(nid => nid > sys.id)"
          :key="'e_' + sys.id + '_' + neighborId"
          :lat-lngs="(() => {
            const neighbor = (state.systems ?? []).find(s => s.id === neighborId)
            return neighbor ? [[sys.y, sys.x], [neighbor.y, neighbor.x]] : [[0,0],[0,0]]
          })()"
          :color="getEdgeColor(sys, (state.systems ?? []).find(s => s.id === neighborId) ?? sys)"
          :weight="1"
        />
      </template>

      <!-- Black hole center -->
      <LCircleMarker
        :lat-lng="[0, 0]"
        :radius="15"
        color="rgba(124, 58, 237, 0.3)"
        :fill="true"
        fill-color="rgba(124, 58, 237, 0.1)"
        :fill-opacity="0.3"
      />

      <!-- System markers -->
      <LCircleMarker
        v-for="(sys, si) in (state.systems ?? [])"
        :key="sys.id"
        :lat-lng="[sys.y, sys.x]"
        :radius="getSystemRadius(sys)"
        :color="getSystemColor(sys)"
        :fill="true"
        :fill-color="getSystemColor(sys)"
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
            </div>
          </div>
        </LTooltip>
      </LCircleMarker>
    </LMap>
  </div>
</template>
