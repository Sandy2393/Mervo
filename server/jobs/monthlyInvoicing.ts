/**
 * Monthly Invoicing Job
 * Runs at 2:00 AM AEST on the 1st of each month
 * Schedule: 0 2 1 * * (2 AM on 1st day of month)
 */

import { supabase } from '../db/supabase';
import { billingService } from '../billing/services/billingService';

export async function runMonthlyInvoicing() {
  console.log('[MonthlyInvoicing] Starting monthly invoicing job...');
  const startTime = Date.now();

  try {
    // Get the billing month (previous month)
    const now = new Date();
    const billingMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStr = billingMonth.toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });

    console.log(`[MonthlyInvoicing] Generating invoices for ${monthStr}...`);

    // Run the monthly billing process
    const result = await billingService.processMonthlyBilling();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[MonthlyInvoicing] Job completed in ${duration}s`);
    console.log(`[MonthlyInvoicing] Invoices generated: ${result.invoicesGenerated}`);
    console.log(`[MonthlyInvoicing] Total revenue: $${result.totalRevenue.toFixed(2)}`);
    console.log(`[MonthlyInvoicing] Errors: ${result.errors.length}`);

    // Log to billing_events
    await supabase.from('billing_events').insert({
      eventType: 'monthly_invoicing',
      description: `Monthly invoicing for ${monthStr}: ${result.invoicesGenerated} invoices, $${result.totalRevenue.toFixed(2)} revenue`,
      metadata: {
        month: monthStr,
        invoicesGenerated: result.invoicesGenerated,
        totalRevenue: result.totalRevenue,
        errorCount: result.errors.length,
        errors: result.errors.length > 0 ? result.errors : undefined,
        duration: `${duration}s`,
      },
    });

    // Send notification to super-admin (implement email service)
    console.log(`[MonthlyInvoicing] TODO: Send summary email to admin`);

    return {
      success: result.errors.length === 0,
      month: monthStr,
      invoicesGenerated: result.invoicesGenerated,
      totalRevenue: result.totalRevenue,
      errors: result.errors,
      duration: `${duration}s`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MonthlyInvoicing] Critical error:', errorMsg);

    // Log critical failure
    await supabase.from('billing_events').insert({
      eventType: 'monthly_invoicing_failed',
      description: `Monthly invoicing job failed: ${errorMsg}`,
      metadata: { error: errorMsg },
    });

    throw error;
  }
}

// For manual execution
if (require.main === module) {
  runMonthlyInvoicing()
    .then((result) => {
      console.log('Job result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
