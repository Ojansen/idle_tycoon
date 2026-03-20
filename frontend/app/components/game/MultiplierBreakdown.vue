<script setup lang="ts">
const { breakdowns } = useMultiplierBreakdown()

function formatMultiplier(value: number, stat: string): string {
  if (stat === 'buildingCostMultiplier') {
    const pct = Math.round((1 - value) * 100)
    return pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`
  }
  return `×${value.toFixed(2)}`
}

function formatSource(value: number, stat: string): string {
  if (stat === 'buildingCostMultiplier') {
    const pct = Math.round((1 - value) * 100)
    return pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`
  }
  return `×${value.toFixed(2)}`
}

function multiplierColor(value: number, stat: string): string {
  if (stat === 'buildingCostMultiplier') {
    return value < 1 ? 'text-green-400' : 'text-red-400'
  }
  return value > 1 ? 'text-green-400' : 'text-red-400'
}
</script>

<template>
  <div v-if="breakdowns.length > 0" class="space-y-3">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-bar-chart-3" class="text-xl text-violet-400" />
      <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400">Active Bonuses</h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="b in breakdowns"
        :key="b.stat"
        class="rounded-lg bg-white/5 border border-white/5 px-3 py-2.5"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <UIcon :name="b.icon" class="text-base text-zinc-400" />
            <span class="text-sm font-medium text-white">{{ b.label }}</span>
          </div>
          <span class="text-sm font-bold" :class="multiplierColor(b.total, b.stat)">
            {{ formatMultiplier(b.total, b.stat) }}
          </span>
        </div>
        <div class="flex flex-wrap gap-x-2 gap-y-0.5">
          <span
            v-for="(source, i) in b.sources"
            :key="source.label"
            class="text-[11px] text-zinc-500"
          >
            <span class="text-zinc-400">{{ source.label }}</span>
            <span class="ml-0.5" :class="multiplierColor(source.value, b.stat)">{{ formatSource(source.value, b.stat) }}</span>
            <span v-if="i < b.sources.length - 1" class="ml-1 text-zinc-600">·</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
