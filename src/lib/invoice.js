/**
 * Invoice helper utilities
 */
import { supabase } from './supabase';
import { roundToCents } from './currency';
/**
 * Build an invoice object from job instance IDs
 * NOTE: For scale and security, this logic should run server-side and write DB rows using SERVICE_ROLE_KEY.
 */
export async function buildInvoiceFromInstances(company_id, instanceIds, meta = {}) {
    // Fetch instances and related jobs
    const { data, error } = await supabase
        .from('job_instances')
        .select('id, job:jobs(*)')
        .in('id', instanceIds)
        .eq('company_id', company_id);
    if (error)
        throw new Error(error.message);
    const instances = data || [];
    const lineItems = instances.map((inst) => {
        const desc = inst.job?.job_name || `Job ${inst.id}`;
        const qty = 1;
        const unit_price_cents = roundToCents(Number(inst.job?.rate || 0));
        const amount_cents = unit_price_cents * qty;
        return {
            id: `li_${inst.id}`,
            description: desc,
            qty,
            unit_price_cents,
            amount_cents
        };
    });
    const subtotal = lineItems.reduce((s, l) => s + l.amount_cents, 0);
    // Placeholder tax calculation: 10% GST-like
    const tax_cents = Math.round(subtotal * 0.1);
    const total_cents = subtotal + tax_cents;
    const invoice = {
        id: `inv_${Date.now()}`,
        company_id,
        invoice_number: 'TEMP',
        period_start: meta.periodStart,
        period_end: meta.periodEnd,
        line_items: lineItems,
        subtotal_cents: subtotal,
        tax_cents,
        total_cents,
        currency: meta.currency || 'AUD',
        created_at: new Date().toISOString(),
        status: 'issued'
    };
    return invoice;
}
/**
 * Convert invoice to CSV
 */
export function invoiceToCSV(invoice) {
    const header = ['invoice_id', 'invoice_number', 'line_id', 'description', 'qty', 'unit_price_cents', 'amount_cents'];
    const rows = [];
    invoice.line_items.forEach(li => {
        rows.push([invoice.id, invoice.invoice_number, li.id, li.description, String(li.qty), String(li.unit_price_cents), String(li.amount_cents)].join(','));
    });
    // Totals row
    rows.push([invoice.id, invoice.invoice_number, 'TOTAL', '', '', '', String(invoice.total_cents)].join(','));
    return [header.join(','), ...rows].join('\n');
}
/**
 * Generate a human-readable invoice number for a company
 * Example: INV-<company_tag>-202512-0001
 */
export function invoiceNumberGenerator(companyTag, date = new Date(), seq = 1) {
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const seqStr = String(seq).padStart(4, '0');
    return `INV-${companyTag.toUpperCase()}-${yearMonth}-${seqStr}`;
}
