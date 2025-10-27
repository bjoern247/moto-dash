const intlNumber = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })
const intlCurrency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
const intlDate = new Intl.DateTimeFormat('de-DE')

export function formatNumber(value, fractionDigits = 1) {
  if (value == null || Number.isNaN(Number(value))) return '-'
  const numeric = Number(Number(value).toFixed(fractionDigits))
  return intlNumber.format(numeric)
}

export function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '-'
  return intlCurrency.format(Number(value))
}

export function formatDate(value) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return intlDate.format(date)
}

export function kmPerLiter(liters, kilometers) {
  if (!liters || !kilometers) return 0
  return kilometers / liters
}

export function litersPer100km(liters, kilometers) {
  if (!liters || !kilometers) return 0
  return (liters / kilometers) * 100
}

export function costPerKilometer(cost, kilometers) {
  if (!cost || !kilometers) return 0
  return cost / kilometers
}

