<script setup lang="ts">
const { state } = useGameState()
const { allAchievements } = useAchievements()

const categories = computed(() => {
  const cats: Record<string, typeof allAchievements[number][]> = {}
  for (const a of allAchievements) {
    if (!cats[a.category]) cats[a.category] = []
    cats[a.category]!.push(a)
  }
  return cats
})

const unlockedCount = computed(() => state.value.achievements.length)
const totalCount = allAchievements.length
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-trophy" class="text-xl text-amber-400" />
        <h3 class="text-xs font-semibold uppercase tracking-wider text-amber-400">Achievements</h3>
      </div>
      <span class="text-xs text-zinc-500">{{ unlockedCount }} / {{ totalCount }}</span>
    </div>

    <div v-for="(achievements, category) in categories" :key="category" class="space-y-2">
      <div class="text-xs font-medium text-zinc-500 uppercase tracking-wider">{{ category }}</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
          :class="state.achievements.includes(achievement.id)
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-white/[0.02] border-white/5 opacity-50'"
        >
          <UIcon
            :name="state.achievements.includes(achievement.id) ? achievement.icon : 'i-lucide-lock'"
            class="text-lg shrink-0"
            :class="state.achievements.includes(achievement.id) ? 'text-amber-400' : 'text-zinc-600'"
          />
          <div class="min-w-0">
            <div class="text-xs font-medium truncate" :class="state.achievements.includes(achievement.id) ? 'text-white' : 'text-zinc-600'">
              {{ state.achievements.includes(achievement.id) ? achievement.name : '???' }}
            </div>
            <div class="text-[10px] truncate" :class="state.achievements.includes(achievement.id) ? 'text-zinc-400' : 'text-zinc-700'">
              {{ achievement.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
