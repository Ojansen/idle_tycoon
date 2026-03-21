<script setup lang="ts">
const { state } = useGameState()
const { buyClickUpgrade, getClickUpgradeCost } = useGameActions()
const { formatNumber } = useNumberFormat()

const cost = computed(() => getClickUpgradeCost())
const canAfford = computed(() => state.value.credits >= cost.value)
</script>

<template>
  <div class="space-y-2">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-violet-400 px-1">Click Upgrade</h3>

    <div
      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
      :class="canAfford ? 'bg-white/5 hover:bg-white/10' : 'bg-white/[0.02] opacity-60'"
    >
      <UIcon name="i-lucide-mouse-pointer-click" class="text-xl shrink-0 text-violet-400" />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-white">
          Click Power
          <span class="text-xs text-zinc-500 ml-1">Lv {{ state.clickUpgradeLevel }}</span>
        </div>
        <div class="text-xs text-zinc-400">+1 base click power per level</div>
      </div>
      <UButton
        size="xs"
        :color="canAfford ? 'primary' : 'neutral'"
        :variant="canAfford ? 'solid' : 'outline'"
        :disabled="!canAfford"
        @click="buyClickUpgrade()"
      >
        ₢{{ formatNumber(cost) }}
      </UButton>
    </div>
  </div>
</template>
