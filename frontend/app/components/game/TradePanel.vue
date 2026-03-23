<script setup lang="ts">
const { rawTradeValue, convertedTradeValue, tradeConversion, activePolicy, availablePolicies, tradeMultiplierStack, empireSizeBonus, isTradeDisabled, setTradePolicy } = useTrade()
const { formatNumber } = useNumberFormat()
</script>

<template>
  <div class="space-y-4">
    <!-- Trade Disabled -->
    <div v-if="isTradeDisabled" class="rounded-lg bg-white/[0.03] border border-white/10 p-8 text-center">
      <UIcon name="i-lucide-lock" class="text-3xl text-zinc-600 mb-2" />
      <p class="text-sm text-zinc-500">Trade is disabled by the Isolationist trait.</p>
      <p class="text-xs text-zinc-600 mt-1">Your corporation operates in total isolation.</p>
    </div>

    <template v-else>
      <!-- Trade Overview -->
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
        <div class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-handshake" class="text-lg text-violet-400" />
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Trade Overview</h3>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-3 text-center">
          <div>
            <div class="text-sm font-bold text-violet-300">{{ formatNumber(rawTradeValue) }}/s</div>
            <div class="text-xs text-zinc-500">Raw Trade Value</div>
          </div>
          <div>
            <div class="text-sm font-bold text-emerald-400">{{ formatNumber(convertedTradeValue) }}/s</div>
            <div class="text-xs text-zinc-500">Converted Value</div>
          </div>
        </div>

        <div class="text-xs text-zinc-500 space-y-0.5">
          <div>Trade multiplier: {{ tradeMultiplierStack.toFixed(2) }}x</div>
          <div>Empire size bonus: {{ empireSizeBonus.toFixed(2) }}x</div>
        </div>
      </div>

      <!-- Conversion Breakdown -->
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
        <div class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-split" class="text-lg text-zinc-400" />
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Conversion</h3>
        </div>

        <div class="space-y-2">
          <div v-if="tradeConversion.credits > 0" class="flex items-center justify-between text-sm">
            <span class="text-zinc-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-banknote" class="text-emerald-400" />
              Credits
            </span>
            <span class="text-emerald-400 font-semibold tabular-nums">+{{ formatNumber(tradeConversion.credits) }}/s</span>
          </div>
          <div v-if="tradeConversion.energy > 0" class="flex items-center justify-between text-sm">
            <span class="text-zinc-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-zap" class="text-amber-400" />
              Energy
            </span>
            <span class="text-amber-400 font-semibold tabular-nums">+{{ formatNumber(tradeConversion.energy) }}/s</span>
          </div>
          <div v-if="tradeConversion.consumerGoods > 0" class="flex items-center justify-between text-sm">
            <span class="text-zinc-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-package" class="text-amber-600" />
              Consumer Goods
            </span>
            <span class="text-amber-600 font-semibold tabular-nums">+{{ formatNumber(tradeConversion.consumerGoods) }}/s</span>
          </div>
        </div>
      </div>

      <!-- Trade Policy -->
      <div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
        <div class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-settings" class="text-lg text-zinc-400" />
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Trade Policy</h3>
        </div>

        <div class="space-y-2">
          <button
            v-for="policy in availablePolicies"
            :key="policy.id"
            class="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left"
            :class="activePolicy.id === policy.id
              ? 'border-violet-500/50 bg-violet-500/10'
              : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'"
            @click="setTradePolicy(policy.id)"
          >
            <UIcon :name="policy.icon" class="text-lg shrink-0" :class="activePolicy.id === policy.id ? 'text-violet-400' : 'text-zinc-500'" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium" :class="activePolicy.id === policy.id ? 'text-white' : 'text-zinc-300'">
                {{ policy.name }}
              </div>
              <div class="text-xs text-zinc-500 truncate">{{ policy.description }}</div>
            </div>
            <div v-if="activePolicy.id === policy.id" class="shrink-0">
              <UIcon name="i-lucide-check" class="text-violet-400" />
            </div>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
