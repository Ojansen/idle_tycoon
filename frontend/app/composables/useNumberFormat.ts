const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

export function useNumberFormat() {
  function formatNumber(n: number): string {
    if (!Number.isFinite(n)) return '0'
    if (n < 0) return '-' + formatNumber(-n)
    if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString()

    const tier = Math.min(Math.floor(Math.log10(n) / 3), suffixes.length - 1)
    const scaled = n / Math.pow(10, tier * 3)
    const formatted = scaled < 10 ? scaled.toFixed(2) : scaled < 100 ? scaled.toFixed(1) : Math.floor(scaled).toString()
    return formatted + suffixes[tier]
  }

  return { formatNumber }
}
