// Tax helpers (placeholders). All amounts are integer cents.
// TODO: implement jurisdiction-specific tax rules and validate with accountants.

type Invoice = {
  company_id: string;
  total_cents: number;
  tax_cents?: number;
  line_items?: Array<{ description: string; amount_cents: number; tax_rate?: number }>;
  tax_rate_percent?: number; // e.g., 13 for 13%
};

type TaxReport = {
  company_id: string;
  period: { start: string; end: string };
  totals: Array<{ jurisdiction: string; taxable_cents: number; tax_cents: number }>;
};

export function calculateTaxForInvoice(invoice: Invoice) {
  const rate = invoice.tax_rate_percent ?? 0;
  const tax_cents = Math.round((invoice.total_cents * rate) / 100);
  return { ...invoice, tax_cents };
}

export async function generateTaxReport(company_id: string, period: { start: string; end: string }): Promise<TaxReport> {
  // TODO: aggregate invoices by jurisdiction; currently placeholder
  return {
    company_id,
    period,
    totals: [
      {
        jurisdiction: "placeholder",
        taxable_cents: 0,
        tax_cents: 0,
      },
    ],
  };
}
