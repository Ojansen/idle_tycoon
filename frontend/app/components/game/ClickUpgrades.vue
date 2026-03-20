<script setup lang="ts">
const { state } = useGameState()
const { clickUpgrades } = useGameConfig()
const { buyClickUpgrade } = useGameActions()
const { formatNumber } = useNumberFormat()

const availableUpgrades = computed(() =>
  clickUpgrades.filter(u => !state.value.clickUpgradesBought.includes(u.id))
)

const boughtUpgrades = computed(() =>
  clickUpgrades.filter(u => state.value.clickUpgradesBought.includes(u.id))
)
</script>

<template>
  <div v-if="availableUpgrades.length || boughtUpgrades.length" class="space-y-2">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400 px-1">Click Upgrades</h3>

    <div
      v-for="upgrade in availableUpgrades"
      :key="upgrade.id"
      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
      :class="state.credits >= upgrade.cost ? 'bg-white/5 hover:bg-white/10' : 'bg-white/[0.02] opacity-60'"
    >
      <UIcon name="i-lucide-mouse-pointer-click" class="text-xl shrink-0 text-violet-400" />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-white truncate">{{ upgrade.name }}</div>
        <div class="text-xs text-zinc-400">{{ upgrade.description }} (+{{ upgrade.clickPowerAdd }} ₢/click)</div>
      </div>
      <UButton
        size="xs"
        :color="state.credits >= upgrade.cost ? 'primary' : 'neutral'"
        :variant="state.credits >= upgrade.cost ? 'solid' : 'outline'"
        :disabled="state.credits < upgrade.cost"
        @click="buyClickUpgrade(upgrade.id)"
      >
        ₢{{ formatNumber(upgrade.cost) }}
      </UButton>
    </div>

    <div
      v-for="upgrade in boughtUpgrades"
      :key="upgrade.id"
      class="flex items-center gap-3 px-3 py-2 rounded-lg bg-violet-500/10"
    >
      <UIcon name="i-lucide-mouse-pointer-click" class="text-xl shrink-0 text-violet-400" />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-white truncate">{{ upgrade.name }}</div>
        <div class="text-xs text-zinc-400">+{{ upgrade.clickPowerAdd }} ₢/click</div>
      </div>
      <UBadge color="success" variant="subtle" size="xs">Owned</UBadge>
    </div>
  </div>
</template>
