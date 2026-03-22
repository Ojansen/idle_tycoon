import type { StockCompany } from '~/types/game'

const companies: StockCompany[] = [
  { id: 'lunar_mining', name: 'Lunar Mining Co.', sector: 'Mining', icon: 'i-lucide-pickaxe', basePrice: 50, volatility: 0.02, dividendRate: 0.5, totalShares: 100 },
  { id: 'nebula_logistics', name: 'Nebula Logistics', sector: 'Transport', icon: 'i-lucide-truck', basePrice: 120, volatility: 0.02, dividendRate: 1, totalShares: 100 },
  { id: 'void_refineries', name: 'Void Refineries', sector: 'Manufacturing', icon: 'i-lucide-factory', basePrice: 300, volatility: 0.05, dividendRate: 2.5, totalShares: 100 },
  { id: 'starlight_power', name: 'Starlight Power', sector: 'Energy', icon: 'i-lucide-sun', basePrice: 500, volatility: 0.05, dividendRate: 4, totalShares: 100 },
  { id: 'quantum_dynamics', name: 'Quantum Dynamics', sector: 'Research', icon: 'i-lucide-atom', basePrice: 1000, volatility: 0.05, dividendRate: 7, totalShares: 100 },
  { id: 'galactic_freight', name: 'Galactic Freight', sector: 'Transport', icon: 'i-lucide-ship', basePrice: 2500, volatility: 0.05, dividendRate: 15, totalShares: 100 },
  { id: 'nova_weapons', name: 'Nova Weapons Corp', sector: 'Military', icon: 'i-lucide-swords', basePrice: 8000, volatility: 0.10, dividendRate: 50, totalShares: 100 },
  { id: 'titan_megaworks', name: 'Titan Megaworks', sector: 'Construction', icon: 'i-lucide-building', basePrice: 25000, volatility: 0.10, dividendRate: 150, totalShares: 100 },
  { id: 'warp_drive', name: 'Warp Drive Inc.', sector: 'Tech', icon: 'i-lucide-rocket', basePrice: 100000, volatility: 0.10, dividendRate: 500, totalShares: 100 },
  { id: 'celestial_bank', name: 'Celestial Bank', sector: 'Finance', icon: 'i-lucide-landmark', basePrice: 500000, volatility: 0.02, dividendRate: 2000, totalShares: 100 },
  { id: 'dark_matter_labs', name: 'Dark Matter Labs', sector: 'Exotic', icon: 'i-lucide-flask-conical', basePrice: 2000000, volatility: 0.15, dividendRate: 10000, totalShares: 100 },
  { id: 'omega_holdings', name: 'Omega Holdings', sector: 'Conglomerate', icon: 'i-lucide-hexagon', basePrice: 20000000, volatility: 0.05, dividendRate: 100000, totalShares: 100 }
]

// Reactive prices and history (ephemeral, not saved)
const prices = reactive<Record<string, number>>({})
const priceHistory = reactive<Record<string, number[]>>({})
const prevPrices = reactive<Record<string, number>>({})

// Initialize prices
for (const c of companies) {
  prices[c.id] = c.basePrice
  prevPrices[c.id] = c.basePrice
  priceHistory[c.id] = [c.basePrice]
}

let tickCounter = 0

function simulatePrices() {
  tickCounter++
  // Update every ~1 second (10 ticks at 100ms)
  if (tickCounter % 10 !== 0) return

  for (const c of companies) {
    prevPrices[c.id] = prices[c.id]!
    const change = c.basePrice * c.volatility * 0.45 * (Math.random() - 0.48)
    const newPrice = Math.max(c.basePrice * 0.3, Math.min(c.basePrice * 3.0, prices[c.id]! + change))
    prices[c.id] = Math.floor(newPrice * 100) / 100

    // Keep last 60 data points (~5 minutes of history)
    const history = priceHistory[c.id]!
    history.push(prices[c.id]!)
    if (history.length > 60) history.shift()
  }
}

export function useStockMarket() {
  const { state } = useGameState()

  function buyShares(companyId: string, quantity: number): boolean {
    const company = companies.find(c => c.id === companyId)
    if (!company) return false

    const owned = state.value.stocks[companyId] || 0
    const maxBuyable = company.totalShares - owned
    const qty = Math.min(quantity, maxBuyable)
    if (qty <= 0) return false

    const cost = Math.floor((prices[companyId] ?? company.basePrice) * qty)
    if (state.value.credits < cost) return false

    state.value.credits -= cost
    state.value.stocks[companyId] = owned + qty
    return true
  }

  function sellShares(companyId: string, quantity: number): boolean {
    const owned = state.value.stocks[companyId] || 0
    const qty = Math.min(quantity, owned)
    if (qty <= 0) return false

    const revenue = Math.floor((prices[companyId] ?? 0) * qty)
    state.value.credits += revenue
    state.value.stocks[companyId] = owned - qty
    return true
  }

  const portfolioValue = computed(() => {
    let total = 0
    for (const c of companies) {
      const shares = state.value.stocks[c.id] || 0
      total += shares * (prices[c.id] ?? c.basePrice)
    }
    return total
  })

  return {
    companies: readonly(companies),
    prices: readonly(prices),
    prevPrices: readonly(prevPrices),
    priceHistory: readonly(priceHistory),
    simulatePrices,
    buyShares,
    sellShares,
    portfolioValue
  }
}
