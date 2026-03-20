<script setup lang="ts">
const { state } = useGameState()

const activeTab = defineModel<string>('tab', { default: 'empire' })
const { pendingAscensionLevels } = useAscensionPerks()
const hasPendingPerks = computed(() => pendingAscensionLevels.value.length > 0)
</script>

<template>
  <header class="flex items-center justify-between px-4 py-3 border-b border-white/10">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-hexagon" class="text-2xl text-violet-500" />
        <h1 class="text-xl font-bold text-white tracking-tight">{{ state.companyName || 'MEGACORP' }}</h1>
      </div>

      <!-- Tab navigation -->
      <div class="flex gap-1 ml-4">
        <UButton
          size="xs"
          :color="activeTab === 'empire' ? 'primary' : 'neutral'"
          :variant="activeTab === 'empire' ? 'solid' : 'ghost'"
          @click="activeTab = 'empire'"
        >
          <UIcon name="i-lucide-building-2" class="mr-1" />
          Empire
        </UButton>
        <UButton
          size="xs"
          :color="activeTab === 'prestige' ? 'primary' : 'neutral'"
          :variant="activeTab === 'prestige' ? 'solid' : 'ghost'"
          @click="activeTab = 'prestige'"
        >
          <span class="relative">
            <UIcon name="i-lucide-star" class="mr-1" />
            <span v-if="hasPendingPerks" class="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          </span>
          Prestige
        </UButton>
        <UButton
          size="xs"
          :color="activeTab === 'research' ? 'primary' : 'neutral'"
          :variant="activeTab === 'research' ? 'solid' : 'ghost'"
          @click="activeTab = 'research'"
        >
          <UIcon name="i-lucide-flask-conical" class="mr-1" />
          Research
        </UButton>
        <UButton
          size="xs"
          :color="activeTab === 'market' ? 'primary' : 'neutral'"
          :variant="activeTab === 'market' ? 'solid' : 'ghost'"
          @click="activeTab = 'market'"
        >
          <UIcon name="i-lucide-trending-up" class="mr-1" />
          Market
        </UButton>
        <UButton
          size="xs"
          :color="activeTab === 'casino' ? 'primary' : 'neutral'"
          :variant="activeTab === 'casino' ? 'solid' : 'ghost'"
          @click="activeTab = 'casino'"
        >
          <UIcon name="i-lucide-dices" class="mr-1" />
          Casino
        </UButton>
        <UButton
          size="xs"
          :color="activeTab === 'profile' ? 'primary' : 'neutral'"
          :variant="activeTab === 'profile' ? 'solid' : 'ghost'"
          @click="activeTab = 'profile'"
        >
          <UIcon name="i-lucide-user-circle" class="mr-1" />
          Profile
        </UButton>
      </div>
    </div>

    <div class="flex items-center gap-4 text-sm text-zinc-400">
      <span v-if="state.prestigeCount > 0">
        <UIcon name="i-lucide-star" class="text-amber-400 align-middle" />
        {{ state.influence }} Influence
      </span>
      <span>Clicks: {{ state.totalClicks }}</span>
    </div>
  </header>
</template>
