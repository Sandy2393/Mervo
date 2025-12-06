import { Parser } from "json2csv";

// TODO: implement real PDF generation; ensure this runs server-side only.

type Invoice = {
  invoice_number: string;
  company_id: string;
  period_start: string;
  period_end: string;
  line_items: Array<{ description: string; amount_cents: number }>; // amounts in cents
  total_cents: number;
  tax_cents: number;
};

export function exportInvoiceCSV(invoice: Invoice) {
  const parser = new Parser();
  const rows = invoice.line_items.map((li, idx) => ({
    line: idx + 1,
    description: li.description,
    amount_cents: li.amount_cents,
    total_cents: invoice.total_cents,
    tax_cents: invoice.tax_cents,
    invoice_number: invoice.invoice_number,
    period_start: invoice.period_start,
    period_end: invoice.period_end,
  }));
  return parser.parse(rows);
}

export function exportInvoicePdfPlaceholder(invoice: Invoice) {
  // TODO: hook real PDF generator (e.g., pdfkit). Keep server-side.
  return `PDF for invoice ${invoice.invoice_number} (placeholder)`;
}
