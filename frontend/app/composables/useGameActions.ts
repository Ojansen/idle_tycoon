import type { TradePolicy } from '~/types/game'
import { calcPrestigeInfluence, calcRepeatableCost } from '~/utils/gameMath'
import { createGalaxy } from '~/composables/useGalaxyGenSystem'

export function useGameActions() {
  const { state, kardashevLevel } = useGameState()
  const { prestigeUpgrades, repeatablePrestigeUpgrades } = useGameConfig()

  function canPrestige(): boolean {
    return getPrestigeInfluenceGain() >= 1
  }

  function getPrestigeInfluenceGain(): number {
    return calcPrestigeInfluence(state.value.totalCreditsEarned)
  }

  function performPrestige() {
    if (!canPrestige()) return false

    const influenceGain = getPrestigeInfluenceGain()
    const now = Date.now()

    // Generate new galaxy with seed from current time — unique per prestige run
    const newSeed = now

    // Atomic replacement
    state.value = {
      setupComplete: state.value.setupComplete,
      companyName: state.value.companyName,
      companyDescription: state.value.companyDescription,
      companyTraits: [...state.value.companyTraits],
      homeworldType: state.value.homeworldType,
      // Reset
      credits: 0,
      totalCreditsEarned: 0,
      researchPoints: 0,
      systems: createGalaxy(newSeed),
      lastDiscoveryTime: now,
      // Kept
      influence: state.value.influence + influenceGain,
      prestigeCount: state.value.prestigeCount + 1,
      prestigeUpgradesBought: [...state.value.prestigeUpgradesBought],
      prestigeRepeatables: { ...state.value.prestigeRepeatables },
      kardashevHighWaterMark: state.value.kardashevHighWaterMark,
      ascensionPerks: [],
      achievements: [...state.value.achievements],
      completedResearch: [],
      activeResearch: null,
      megastructures: {},
      victoryAchieved: state.value.victoryAchieved,
      repeatableResearch: {},
      productionHistory: [],
      tradePolicy: 'wealth_creation' as TradePolicy,
      totalPlayTime: state.value.totalPlayTime,
      runPlayTime: 0,
      lastSaveTimestamp: now,
      createdAt: state.value.createdAt
    }

    // Apply quick start if purchased
    applyQuickStart()

    return true
  }

  function applyQuickStart() {
    for (const upgradeId of state.value.prestigeUpgradesBought) {
      const upgrade = prestigeUpgrades.find(u => u.id === upgradeId)
      if (upgrade && upgrade.effect.type === 'quickStart') {
        // Boost homeworld division levels
        const homeworld = state.value.systems[0]?.planets[0]
        if (homeworld) {
          for (const div of homeworld.divisions) {
            if (div) {
              div.level = Math.max(div.level, upgrade.effect.divisionLevels)
            }
          }
        }
      }
    }
  }

  function buyPrestigeUpgrade(upgradeId: string) {
    if (state.value.prestigeUpgradesBought.includes(upgradeId)) return false
    const upgrade = prestigeUpgrades.find(u => u.id === upgradeId)
    if (!upgrade || state.value.influence < upgrade.cost) return false
    if (upgrade.requiredKardashev != null && state.value.kardashevHighWaterMark < upgrade.requiredKardashev) return false

    state.value.influence -= upgrade.cost
    state.value.prestigeUpgradesBought.push(upgradeId)
    return true
  }

  function getRepeatableCost(upgradeId: string): number {
    const upgrade = repeatablePrestigeUpgrades.find(u => u.id === upgradeId)
    if (!upgrade) return Infinity
    const level = state.value.prestigeRepeatables[upgradeId] || 0
    return calcRepeatableCost(upgrade.baseCost, upgrade.costScale, level)
  }

  function buyRepeatableUpgrade(upgradeId: string): boolean {
    const upgrade = repeatablePrestigeUpgrades.find(u => u.id === upgradeId)
    if (!upgrade) return false
    const level = state.value.prestigeRepeatables[upgradeId] || 0
    if (level >= upgrade.maxLevel) return false
    const cost = getRepeatableCost(upgradeId)
    if (state.value.influence < cost) return false

    state.value.influence -= cost
    state.value.prestigeRepeatables[upgradeId] = level + 1
    return true
  }

  return {
    canPrestige,
    getPrestigeInfluenceGain,
    performPrestige,
    buyPrestigeUpgrade,
    getRepeatableCost,
    buyRepeatableUpgrade,
  }
}
