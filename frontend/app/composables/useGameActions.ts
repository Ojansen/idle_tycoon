import { calcPrestigeInfluence, calcRepeatableCost } from '~/utils/gameMath'

export function useGameActions() {
  const { state, effectiveClickPower, getBuildingCost, kardashevLevel } = useGameState()
  const { buildings, clickUpgradeConfig, prestigeUpgrades, repeatablePrestigeUpgrades } = useGameConfig()

  function click() {
    const gain = effectiveClickPower.value
    state.value.credits += gain
    state.value.totalCreditsEarned += gain
    state.value.totalClicks++
    state.value.allTimeClicks++
  }

  function buyBuilding(buildingId: string, quantity = 1) {
    const cost = getBuildingCost(buildingId, quantity)
    if (state.value.credits < cost) return false

    state.value.credits -= cost
    state.value.buildings[buildingId] = (state.value.buildings[buildingId] || 0) + quantity
    return true
  }

  function getClickUpgradeCost(): number {
    return Math.floor(clickUpgradeConfig.baseCost * Math.pow(clickUpgradeConfig.costMultiplier, state.value.clickUpgradeLevel))
  }

  function buyClickUpgrade() {
    const cost = getClickUpgradeCost()
    if (state.value.credits < cost) return false

    state.value.credits -= cost
    state.value.clickPower += clickUpgradeConfig.clickPowerAdd
    state.value.clickUpgradeLevel++
    return true
  }

  function canPrestige(): boolean {
    return getPrestigeInfluenceGain() >= 1
  }

  function getPrestigeInfluenceGain(): number {
    return calcPrestigeInfluence(state.value.totalEnergyEarned)
  }

  function performPrestige() {
    if (!canPrestige()) return false

    const influenceGain = getPrestigeInfluenceGain()
    const now = Date.now()

    // Atomic replacement — ensures Vue detects the change and all computeds recompute
    state.value = {
      setupComplete: state.value.setupComplete,
      companyName: state.value.companyName,
      companyDescription: state.value.companyDescription,
      companyTraits: [...state.value.companyTraits],
      // Reset
      credits: 0,
      energy: 0,
      totalCreditsEarned: 0,
      totalEnergyEarned: 0,
      totalClicks: 0,
      clickPower: 1,
      buildings: {},
      clickUpgradeLevel: 0,
      // Kept
      influence: state.value.influence + influenceGain,
      prestigeCount: state.value.prestigeCount + 1,
      prestigeUpgradesBought: [...state.value.prestigeUpgradesBought],
      prestigeRepeatables: { ...state.value.prestigeRepeatables },
      kardashevHighWaterMark: state.value.kardashevHighWaterMark,
      ascensionPerks: [],
      achievements: [...state.value.achievements],
      casinoStats: { ...state.value.casinoStats },
      completedResearch: [],
      activeResearch: null,
      megastructures: {},
      victoryAchieved: state.value.victoryAchieved,
      repeatableResearch: {},
      productionHistory: [],
      tradePolicy: 'wealth_creation' as const,
      totalPlayTime: state.value.totalPlayTime,
      runPlayTime: 0,
      allTimeClicks: state.value.allTimeClicks,
      lastSaveTimestamp: now,
      createdAt: state.value.createdAt
    }

    // Apply quick start if purchased
    applyQuickStart()

    return true
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

  function applyQuickStart() {
    for (const upgradeId of state.value.prestigeUpgradesBought) {
      const upgrade = prestigeUpgrades.find(u => u.id === upgradeId)
      if (upgrade && upgrade.effect.type === 'quickStart') {
        for (const [buildingId, count] of Object.entries(upgrade.effect.buildings)) {
          state.value.buildings[buildingId] = (state.value.buildings[buildingId] || 0) + count
        }
      }
    }
  }

  function isBuildingUnlocked(buildingId: string): boolean {
    const def = buildings.find(b => b.id === buildingId)
    if (!def) return false

    const requiredLevel = def.unlockKardashev
    // Check if player has reached this Kardashev level naturally or via prestige unlock
    if (kardashevLevel.value >= requiredLevel) return true

    // Check prestige shop unlocks
    for (const upgradeId of state.value.prestigeUpgradesBought) {
      const upgrade = prestigeUpgrades.find(u => u.id === upgradeId)
      if (upgrade && upgrade.effect.type === 'unlockKardashev' && upgrade.effect.level >= requiredLevel) {
        return true
      }
    }

    return false
  }

  return {
    click,
    buyBuilding,
    buyClickUpgrade,
    getClickUpgradeCost,
    canPrestige,
    getPrestigeInfluenceGain,
    performPrestige,
    buyPrestigeUpgrade,
    getRepeatableCost,
    buyRepeatableUpgrade,
    isBuildingUnlocked
  }
}
