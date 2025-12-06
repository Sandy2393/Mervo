/**
 * Currency helpers
 */

export function roundToCents(amount: number): number {
  // Avoid floating point issues by rounding to nearest cent
  return Math.round((amount || 0) * 100);
}

export function centsToDecimal(amountCents: number): number {
  return (amountCents || 0) / 100;
}

export function formatCurrency(amount: number | null | undefined, currencyCode: string = 'AUD'): string {
  const value = amount ?? 0;
  try {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: currencyCode }).format(value);
  } catch (e) {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

export default {
  roundToCents,
  centsToDecimal,
  formatCurrency
};
