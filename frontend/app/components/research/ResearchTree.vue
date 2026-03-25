<script setup lang="ts">
import type { ResearchBranch } from '~/types/game'

const { researchTree } = useResearchConfig()

interface BranchConfig {
  id: ResearchBranch
  label: string
  icon: string
  color: string
  headerColor: string
}

const branches: BranchConfig[] = [
  { id: 'industry', label: 'Industry', icon: 'i-lucide-factory', color: 'border-violet-500/20', headerColor: 'text-violet-400' },
  { id: 'energy', label: 'Energy', icon: 'i-lucide-zap', color: 'border-amber-500/20', headerColor: 'text-amber-400' },
  { id: 'society', label: 'Society', icon: 'i-lucide-users', color: 'border-cyan-500/20', headerColor: 'text-cyan-400' },
  { id: 'exotic', label: 'Exotic', icon: 'i-lucide-sparkles', color: 'border-purple-500/20', headerColor: 'text-purple-400' },
]

function techsForBranch(branch: ResearchBranch) {
  return researchTree
    .filter(t => t.branch === branch)
    .sort((a, b) => a.tier - b.tier)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <div
      v-for="branch in branches"
      :key="branch.id"
      class="rounded-lg bg-white/[0.03] border border-white/10 overflow-hidden"
    >
      <!-- Branch header -->
      <div
        class="flex items-center gap-2 px-3 py-2.5 border-b"
        :class="branch.color"
      >
        <UIcon :name="branch.icon" class="text-base" :class="branch.headerColor" />
        <span class="text-xs font-semibold uppercase tracking-wider" :class="branch.headerColor">
          {{ branch.label }}
        </span>
      </div>

      <!-- Tech nodes -->
      <div class="p-2 space-y-2">
        <template v-if="techsForBranch(branch.id).length > 0">
          <ResearchNode
            v-for="tech in techsForBranch(branch.id)"
            :key="tech.id"
            :tech="tech"
          />
        </template>
        <div v-else class="py-4 text-center text-xs text-zinc-600 italic">
          No research available yet
        </div>
      </div>
    </div>
  </div>
</template>
