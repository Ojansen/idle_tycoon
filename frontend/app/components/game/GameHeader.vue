<script setup lang="ts">
const { state } = useGameState()

const activeTab = defineModel<string>('tab', { default: 'galaxy' })
const { pendingAscensionLevels } = useAscensionPerks()
const hasPendingPerks = computed(() => pendingAscensionLevels.value.length > 0)

const mobileMenuOpen = ref(false)

const tabs = [
  { key: 'galaxy', label: 'Galaxy', icon: 'i-lucide-orbit' },
  { key: 'overview', label: 'Overview', icon: 'i-lucide-gauge' },
  { key: 'prestige', label: 'Prestige', icon: 'i-lucide-star' },
  { key: 'research', label: 'Research', icon: 'i-lucide-flask-conical' },
  { key: 'trade', label: 'Trade', icon: 'i-lucide-handshake' },
  { key: 'stats', label: 'Stats', icon: 'i-lucide-bar-chart-3' },
  { key: 'profile', label: 'Profile', icon: 'i-lucide-user-circle' },
]

function selectTab(key: string) {
  activeTab.value = key
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="bg-zinc-950/95 backdrop-blur-sm flex items-center px-4 py-3 border-b border-white/10">
    <div class="flex items-center gap-4">
      <!-- Hamburger button (mobile only) -->
      <UButton
        class="md:hidden"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="mobileMenuOpen = true"
      >
        <UIcon name="i-lucide-menu" class="text-lg" />
      </UButton>

      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-hexagon" class="text-2xl text-violet-500" />
        <h1 class="text-xl font-bold text-white tracking-tight">{{ state.companyName || 'MEGACORP' }}</h1>
      </div>

      <!-- Tab navigation (desktop only) -->
      <div class="hidden md:flex gap-1 ml-4">
        <UButton
          v-for="tab in tabs"
          :key="tab.key"
          size="xs"
          :color="activeTab === tab.key ? 'primary' : 'neutral'"
          :variant="activeTab === tab.key ? 'solid' : 'ghost'"
          @click="activeTab = tab.key"
        >
          <span v-if="tab.key === 'prestige'" class="relative">
            <UIcon :name="tab.icon" class="mr-1" />
            <span v-if="hasPendingPerks" class="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          </span>
          <UIcon v-else :name="tab.icon" class="mr-1" />
          {{ tab.label }}
        </UButton>
      </div>
    </div>

  </header>

  <!-- Mobile slide-over menu -->
  <USlideover v-model:open="mobileMenuOpen" side="left" class="md:hidden">
    <template #content>
      <div class="flex flex-col h-full bg-zinc-950 p-4">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-hexagon" class="text-2xl text-violet-500" />
            <span class="text-lg font-bold text-white">{{ state.companyName || 'MEGACORP' }}</span>
          </div>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            @click="mobileMenuOpen = false"
          >
            <UIcon name="i-lucide-x" class="text-lg" />
          </UButton>
        </div>

        <!-- Nav items -->
        <nav class="flex flex-col gap-1">
          <UButton
            v-for="tab in tabs"
            :key="tab.key"
            size="lg"
            :color="activeTab === tab.key ? 'primary' : 'neutral'"
            :variant="activeTab === tab.key ? 'solid' : 'ghost'"
            block
            class="justify-start"
            @click="selectTab(tab.key)"
          >
            <span v-if="tab.key === 'prestige'" class="relative">
              <UIcon :name="tab.icon" class="mr-2" />
              <span v-if="hasPendingPerks" class="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            </span>
            <UIcon v-else :name="tab.icon" class="mr-2" />
            {{ tab.label }}
          </UButton>
        </nav>

        <!-- Stats at bottom -->
        <div v-if="state.prestigeCount > 0" class="mt-auto pt-6 border-t border-white/10 text-sm text-zinc-400">
          <div>
            <UIcon name="i-lucide-star" class="text-amber-400 align-middle" />
            {{ state.influence }} Influence
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
