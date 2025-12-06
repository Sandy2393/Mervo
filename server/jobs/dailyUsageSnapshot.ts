/**
 * Daily Usage Snapshot Job
 * Runs at 11:00 PM AEST daily to capture usage for all active companies
 * Schedule: 0 23 * * * (11 PM daily)
 */

import { supabase } from '../db/supabase';
import { usageService } from '../billing/services/usageService';

export async function runDailyUsageSnapshot() {
  console.log('[DailySnapshot] Starting daily usage snapshot job...');
  const startTime = Date.now();

  try {
    // Get all active companies (not cancelled)
    const { data: companies, error } = await supabase
      .from('company_plans')
      .select('companyId, tier')
      .neq('status', 'cancelled');

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    if (!companies || companies.length === 0) {
      console.log('[DailySnapshot] No active companies found');
      return { success: true, processed: 0 };
    }

    console.log(`[DailySnapshot] Processing ${companies.length} companies...`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ companyId: string; error: string }> = [];

    // Process each company
    for (const company of companies) {
      try {
        await usageService.captureSnapshot(company.companyId);
        successCount++;
        
        // Log every 10 companies
        if (successCount % 10 === 0) {
          console.log(`[DailySnapshot] Processed ${successCount}/${companies.length} companies...`);
        }
      } catch (err) {
        errorCount++;
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ companyId: company.companyId, error: errorMsg });
        console.error(`[DailySnapshot] Error for company ${company.companyId}:`, errorMsg);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`[DailySnapshot] Job completed in ${duration}s`);
    console.log(`[DailySnapshot] Success: ${successCount}, Errors: ${errorCount}`);

    // Log to billing_events
    await supabase.from('billing_events').insert({
      eventType: 'daily_snapshot',
      description: `Daily snapshot completed: ${successCount} success, ${errorCount} errors`,
      metadata: {
        successCount,
        errorCount,
        duration: `${duration}s`,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

    return {
      success: errorCount === 0,
      processed: companies.length,
      successCount,
      errorCount,
      errors,
      duration: `${duration}s`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DailySnapshot] Critical error:', errorMsg);

    // Log critical failure
    await supabase.from('billing_events').insert({
      eventType: 'daily_snapshot_failed',
      description: `Daily snapshot job failed: ${errorMsg}`,
      metadata: { error: errorMsg },
    });

    throw error;
  }
}

// For manual execution
if (require.main === module) {
  runDailyUsageSnapshot()
    .then((result) => {
      console.log('Job result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
