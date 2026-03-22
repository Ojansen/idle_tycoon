// DEPRECATED: Stock market has been replaced by Consumer Goods economy.
// This file will be removed when branch offices are implemented.

export function useStockMarket() {
  return {
    companies: [] as readonly never[],
    prices: {} as Readonly<Record<string, number>>,
    prevPrices: {} as Readonly<Record<string, number>>,
    priceHistory: {} as Readonly<Record<string, number[]>>,
    simulatePrices: () => {},
    buyShares: (_companyId: string, _quantity: number) => false,
    sellShares: (_companyId: string, _quantity: number) => false,
    portfolioValue: computed(() => 0),
    marketDisabled: computed(() => false)
  }
}
