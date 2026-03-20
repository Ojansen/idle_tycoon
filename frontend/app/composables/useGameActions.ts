export function useGameActions() {
  const { state, effectiveClickPower, getBuildingCost } = useGameState()
  const { buildings, clickUpgrades, prestigeUpgrades, repeatablePrestigeUpgrades } = useGameConfig()

  function click() {
    const gain = effectiveClickPower.value
    state.value.credits += gain
    state.value.totalCreditsEarned += gain
    state.value.totalClicks++
  }

  function buyBuilding(buildingId: string, quantity = 1) {
    const cost = getBuildingCost(buildingId, quantity)
    if (state.value.credits < cost) return false

    state.value.credits -= cost
    state.value.buildings[buildingId] = (state.value.buildings[buildingId] || 0) + quantity
    return true
  }

  function buyClickUpgrade(upgradeId: string) {
    if (state.value.clickUpgradesBought.includes(upgradeId)) return false
    const upgrade = clickUpgrades.find(u => u.id === upgradeId)
    if (!upgrade || state.value.credits < upgrade.cost) return false

    state.value.credits -= upgrade.cost
    state.value.clickPower += upgrade.clickPowerAdd
    state.value.clickUpgradesBought.push(upgradeId)
    return true
  }

  function canPrestige(): boolean {
    return getPrestigeInfluenceGain() >= 1
  }

  function getPrestigeInfluenceGain(): number {
    return Math.floor(Math.sqrt(state.value.totalEnergyEarned / 10000))
  }

  function performPrestige() {
    if (!canPrestige()) return false

    const influenceGain = getPrestigeInfluenceGain()
    const kept = {
      influence: state.value.influence + influenceGain,
      prestigeCount: state.value.prestigeCount + 1,
      prestigeUpgradesBought: [...state.value.prestigeUpgradesBought],
      prestigeRepeatables: { ...state.value.prestigeRepeatables },
      kardashevHighWaterMark: state.value.kardashevHighWaterMark,
      ascensionPerks: [...state.value.ascensionPerks],
      achievements: [...state.value.achievements]
    }

    // Reset state
    const now = Date.now()
    state.value.credits = 0
    state.value.energy = 0
    state.value.totalCreditsEarned = 0
    state.value.totalEnergyEarned = 0
    state.value.totalClicks = 0
    state.value.clickPower = 1
    state.value.buildings = {}
    state.value.clickUpgradesBought = []
    state.value.lastSaveTimestamp = now

    // Restore kept values
    state.value.influence = kept.influence
    state.value.prestigeCount = kept.prestigeCount
    state.value.prestigeUpgradesBought = kept.prestigeUpgradesBought
    state.value.prestigeRepeatables = kept.prestigeRepeatables
    state.value.kardashevHighWaterMark = kept.kardashevHighWaterMark
    state.value.ascensionPerks = kept.ascensionPerks
    state.value.achievements = kept.achievements

    // Apply quick start if purchased
    applyQuickStart()

    return true
  }

  function buyPrestigeUpgrade(upgradeId: string) {
    if (state.value.prestigeUpgradesBought.includes(upgradeId)) return false
    const upgrade = prestigeUpgrades.find(u => u.id === upgradeId)
    if (!upgrade || state.value.influence < upgrade.cost) return false

    state.value.influence -= upgrade.cost
    state.value.prestigeUpgradesBought.push(upgradeId)
    return true
  }

  function getRepeatableCost(upgradeId: string): number {
    const upgrade = repeatablePrestigeUpgrades.find(u => u.id === upgradeId)
    if (!upgrade) return Infinity
    const level = state.value.prestigeRepeatables[upgradeId] || 0
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, level))
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
    if (state.value.kardashevHighWaterMark >= requiredLevel) return true

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
    canPrestige,
    getPrestigeInfluenceGain,
    performPrestige,
    buyPrestigeUpgrade,
    getRepeatableCost,
    buyRepeatableUpgrade,
    isBuildingUnlocked
  }
}
