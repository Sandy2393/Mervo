/**
 * Finance Service
 * Revenue tracking and profit calculations
 */
import { supabase } from '../lib/supabase';
/**
 * Get revenue for a date range
 * Sums completed job instances in the range
 */
export async function getRevenue(company_id, range) {
    try {
        let startDate = new Date();
        switch (range) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }
        // NOTE: Heavy aggregation should be moved server-side for scale; this is OK for small datasets
        const { data: instances, error } = await supabase
            .from('job_instances')
            .select('id, job:jobs(rate), completed_at')
            .eq('company_id', company_id)
            .eq('status', 'completed')
            .gte('completed_at', startDate.toISOString());
        if (error) {
            return { success: false, error: error.message, code: 'DB_ERROR' };
        }
        // Convert to cents and aggregate
        const byJob = (instances || []).map((inst) => {
            const rate = Number(inst.job?.rate || 0);
            const cents = Math.round(rate * 100);
            return { job_instance_id: inst.id, amount_cents: cents };
        });
        const totalRevenueCents = byJob.reduce((s, b) => s + b.amount_cents, 0);
        // breakdown by day
        const dayMap = new Map();
        (instances || []).forEach((inst, idx) => {
            const ts = inst.completed_at || new Date().toISOString();
            const d = new Date(ts).toISOString().slice(0, 10);
            const amountCents = byJob[idx]?.amount_cents || 0;
            dayMap.set(d, (dayMap.get(d) || 0) + amountCents);
        });
        const breakdownByDay = Array.from(dayMap.entries()).map(([date, total_cents]) => ({ date, total_cents }));
        return {
            success: true,
            data: {
                period: range,
                total_revenue_cents: totalRevenueCents,
                job_count: instances?.length || 0,
                average_per_job_cents: instances && instances.length > 0 ? Math.round(totalRevenueCents / instances.length) : 0,
                byJob,
                breakdownByDay
            }
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
/**
 * Get pending contractor payments
 * Sums completed jobs that have not yet been paid
 */
export async function getPendingPayments(company_id) {
    try {
        // Return detailed pending payouts as cents
        const { data: instances, error } = await supabase
            .from('job_instances')
            .select('id, assigned_to, job:jobs(rate)')
            .eq('company_id', company_id)
            .eq('status', 'completed')
            .is('paid_at', null);
        if (error) {
            return { success: false, error: error.message, code: 'DB_ERROR' };
        }
        // Group by contractor
        const paymentMap = new Map();
        (instances || []).forEach((inst) => {
            if (inst.assigned_to) {
                const key = inst.assigned_to;
                const current = paymentMap.get(key) || { amount_cents: 0, count: 0 };
                const rate = Number(inst.job?.rate || 0);
                current.amount_cents += Math.round(rate * 100);
                current.count += 1;
                paymentMap.set(key, current);
            }
        });
        const payments = Array.from(paymentMap.entries()).map(([alias, { amount_cents, count }]) => ({
            contractor_alias: alias,
            amount_cents,
            job_count: count
        }));
        return { success: true, data: payments };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
/**
 * Calculate profit for a single job instance
 * TODO: Should fetch cost data from job and report; for now returns a placeholder
 */
/**
 * Calculate profit for a single job instance by id
 * Returns revenue (cents), contractorCost (cents), platformFees (cents), profit (cents), marginPercent
 */
export async function calculateProfit(company_id, job_instance_id) {
    try {
        // Fetch instance + job + any timesheet or report data
        const { data: instance, error } = await supabase
            .from('job_instances')
            .select('*, job:jobs(*)')
            .eq('company_id', company_id)
            .eq('id', job_instance_id)
            .single();
        if (error || !instance)
            return { success: false, error: 'Instance not found', code: 'NOT_FOUND' };
        // Revenue assumed to be job.rate; convert to cents
        const revenue_cents = Math.round(Number(instance.job?.rate || 0) * 100);
        // Contractor cost — placeholder: assume 60% of revenue
        const contractorCost_cents = Math.round(revenue_cents * 0.6);
        // Platform fees placeholder — 5% of revenue
        const platformFees_cents = Math.round(revenue_cents * 0.05);
        const profit_cents = revenue_cents - contractorCost_cents - platformFees_cents;
        const marginPercent = revenue_cents > 0 ? Math.round((profit_cents / revenue_cents) * 10000) / 100 : 0;
        return {
            success: true,
            data: { revenue_cents, contractorCost_cents, platformFees_cents, profit_cents, marginPercent }
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
/**
 * Forecast revenue for next N days using simple moving average of past completed jobs
 * Note: For serious forecasting, do heavy lifting server-side or with time-series DB
 */
export async function forecastRevenue(company_id, nextNDays = 7) {
    try {
        // Pull last 90 days of completed instances
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        const { data: instances, error } = await supabase
            .from('job_instances')
            .select('completed_at, job:jobs(rate)')
            .eq('company_id', company_id)
            .eq('status', 'completed')
            .gte('completed_at', startDate.toISOString());
        if (error)
            return { success: false, error: error.message, code: 'DB_ERROR' };
        const totalsByDay = new Map();
        (instances || []).forEach((inst) => {
            const d = new Date(inst.completed_at || '').toISOString().slice(0, 10);
            const rateCents = Math.round(Number(inst.job?.rate || 0) * 100);
            totalsByDay.set(d, (totalsByDay.get(d) || 0) + rateCents);
        });
        // moving average: avg per existing day
        const days = Array.from(totalsByDay.values());
        const avg = days.length ? Math.round(days.reduce((s, v) => s + v, 0) / days.length) : 0;
        const result = [];
        for (let i = 1; i <= nextNDays; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            result.push({ date: d.toISOString().slice(0, 10), amount_cents: avg });
        }
        return { success: true, data: { dailyCents: result } };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
export const financeService = {
    getRevenue,
    getPendingPayments,
    calculateProfit,
    forecastRevenue
};
