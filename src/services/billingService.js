/**
 * Billing Service
 * Handles invoice creation, listing, marking paid and CSV export placeholders.
 * NOTE: Sensitive operations / persistent invoice schema should be implemented server-side
 * (Edge Function / RPC) and/or via DB migrations. This client-facing service uses Supabase
 * and expects an `invoices` table to exist. If not present, see docs/FINANCE_README.md for SQL.
 */
import { supabase } from '../lib/supabase';
/**
 * Create an invoice record (requires invoices table)
 * TODO: Move this to secure server RPC (SERVICE_ROLE_KEY) to prevent client-side forgery.
 */
export async function createInvoice(company_id, payload) {
    try {
        const invoice = {
            ...payload,
            company_id,
            created_at: new Date().toISOString(),
            status: payload.status || 'issued'
        };
        const { data, error } = await supabase
            .from('invoices')
            .insert(invoice)
            .select()
            .single();
        if (error)
            return { success: false, error: error.message, code: 'DB_ERROR' };
        return { success: true, data };
    }
    catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'EXCEPTION' };
    }
}
export async function listInvoices(company_id, filters) {
    try {
        let query = supabase.from('invoices').select('*').eq('company_id', company_id);
        if (filters?.status)
            query = query.eq('status', filters.status);
        if (filters?.start)
            query = query.gte('period_start', filters.start);
        if (filters?.end)
            query = query.lte('period_end', filters.end);
        const { data, error } = await query.order('created_at', { ascending: false }).limit(200);
        if (error)
            return { success: false, error: error.message, code: 'DB_ERROR' };
        return { success: true, data: data || [] };
    }
    catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'EXCEPTION' };
    }
}
export async function getInvoiceById(company_id, invoiceId) {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('company_id', company_id)
            .eq('id', invoiceId)
            .single();
        if (error)
            return { success: false, error: error.message, code: 'DB_ERROR' };
        return { success: true, data };
    }
    catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'EXCEPTION' };
    }
}
export async function markInvoicePaid(company_id, invoiceId, paymentDetails) {
    try {
        // TODO: perform server-side verification and payment recording with service role key
        // We'll fetch the invoice, append to payment_history manually (client-side) then update.
        const { data: existing, error: fetchErr } = await supabase
            .from('invoices')
            .select('*')
            .eq('company_id', company_id)
            .eq('id', invoiceId)
            .single();
        if (fetchErr || !existing)
            return { success: false, error: 'Invoice not found', code: 'NOT_FOUND' };
        const history = Array.isArray(existing.payment_history) ? existing.payment_history.slice() : [];
        history.push(paymentDetails || { paid_at: new Date().toISOString() });
        const { data, error } = await supabase
            .from('invoices')
            .update({ status: 'paid', payment_history: history })
            .eq('company_id', company_id)
            .eq('id', invoiceId)
            .select()
            .single();
        if (error)
            return { success: false, error: error.message, code: 'DB_ERROR' };
        return { success: true, data };
    }
    catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'EXCEPTION' };
    }
}
export async function generateInvoiceCSV(company_id, start, end) {
    try {
        // TODO: For large exports, implement server-side streaming/export.
        let q = supabase.from('invoices').select('*').eq('company_id', company_id).order('created_at', { ascending: false });
        if (start)
            q = q.gte('period_start', start);
        if (end)
            q = q.lte('period_end', end);
        const { data: invoices, error } = await q;
        if (error)
            return { success: false, error: error.message, code: 'DB_ERROR' };
        // Simple CSV placeholder
        const rows = (invoices || []).map((inv) => {
            return `${inv.invoice_number},${inv.period_start || ''},${inv.period_end || ''},${inv.total_cents || 0},${inv.status}`;
        });
        const header = 'invoice_number,period_start,period_end,total_cents,status';
        const csv = [header, ...rows].join('\n');
        return { success: true, data: { csv } };
    }
    catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'EXCEPTION' };
    }
}
export const billingService = {
    createInvoice,
    listInvoices,
    getInvoiceById,
    markInvoicePaid,
    generateInvoiceCSV
};
