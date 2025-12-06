/**
 * Suspend Overdue Accounts Job
 * Runs at 10:00 AM AEST daily to check and suspend accounts with overdue invoices
 * Schedule: 0 10 * * * (10 AM daily)
 * 
 * Suspension policy: Accounts with invoices 7+ days overdue are suspended
 */

import { supabase } from '../db/supabase';
import { billingService } from '../billing/services/billingService';

const SUSPENSION_GRACE_DAYS = 7;

export async function runSuspendOverdueAccounts() {
  console.log('[SuspendOverdue] Starting suspend overdue accounts job...');
  const startTime = Date.now();

  try {
    // Get all overdue invoices (unpaid, past due date)
    const today = new Date();
    const suspensionDate = new Date(today);
    suspensionDate.setDate(suspensionDate.getDate() - SUSPENSION_GRACE_DAYS);

    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .select('id, companyId, invoiceNumber, totalAmount, dueDate')
      .eq('status', 'unpaid')
      .lt('dueDate', suspensionDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch overdue invoices: ${error.message}`);
    }

    if (!overdueInvoices || overdueInvoices.length === 0) {
      console.log('[SuspendOverdue] No overdue invoices found');
      return { success: true, suspended: 0 };
    }

    // Group by company (a company may have multiple overdue invoices)
    const companiesMap = new Map<string, typeof overdueInvoices>();
    overdueInvoices.forEach(invoice => {
      const existing = companiesMap.get(invoice.companyId) || [];
      existing.push(invoice);
      companiesMap.set(invoice.companyId, existing);
    });

    console.log(
      `[SuspendOverdue] Found ${overdueInvoices.length} overdue invoices from ${companiesMap.size} companies`
    );

    let suspendedCount = 0;
    let alreadySuspended = 0;
    let errors: Array<{ companyId: string; error: string }> = [];

    for (const [companyId, invoices] of companiesMap.entries()) {
      try {
        // Check current status
        const { data: plan } = await supabase
          .from('company_plans')
          .select('status')
          .eq('companyId', companyId)
          .single();

        if (!plan) {
          console.log(`[SuspendOverdue] Company ${companyId} has no active plan`);
          continue;
        }

        if (plan.status === 'suspended') {
          alreadySuspended++;
          console.log(`[SuspendOverdue] Company ${companyId} already suspended`);
          continue;
        }

        // Calculate total overdue amount
        const totalOverdue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

        // Suspend the account
        const { error: updateError } = await supabase
          .from('company_plans')
          .update({ status: 'suspended' })
          .eq('companyId', companyId);

        if (updateError) {
          throw new Error(`Failed to suspend: ${updateError.message}`);
        }

        // Log the suspension
        await supabase.from('billing_events').insert({
          companyId,
          eventType: 'account_suspended',
          description: `Account suspended due to ${invoices.length} overdue invoice(s) totaling $${totalOverdue.toFixed(2)}`,
          metadata: {
            overdueInvoices: invoices.length,
            totalOverdue,
            invoiceNumbers: invoices.map(i => i.invoiceNumber),
            oldestDueDate: invoices.sort((a, b) => 
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )[0].dueDate,
          },
        });

        suspendedCount++;
        console.log(
          `[SuspendOverdue] Suspended ${companyId}: ${invoices.length} invoices, $${totalOverdue.toFixed(2)}`
        );

        // TODO: Send suspension notification email
        // await emailService.sendSuspensionNotice(companyId, totalOverdue, invoices);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ companyId, error: errorMsg });
        console.error(`[SuspendOverdue] Error suspending ${companyId}:`, errorMsg);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[SuspendOverdue] Job completed in ${duration}s`);
    console.log(`[SuspendOverdue] Suspended: ${suspendedCount}, Already suspended: ${alreadySuspended}, Errors: ${errors.length}`);

    // Log to billing_events
    await supabase.from('billing_events').insert({
      eventType: 'suspend_overdue_job',
      description: `Suspend overdue job: ${suspendedCount} suspended, ${alreadySuspended} already suspended`,
      metadata: {
        suspendedCount,
        alreadySuspended,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        duration: `${duration}s`,
      },
    });

    return {
      success: errors.length === 0,
      suspended: suspendedCount,
      alreadySuspended,
      errors,
      duration: `${duration}s`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SuspendOverdue] Critical error:', errorMsg);

    await supabase.from('billing_events').insert({
      eventType: 'suspend_overdue_failed',
      description: `Suspend overdue job failed: ${errorMsg}`,
      metadata: { error: errorMsg },
    });

    throw error;
  }
}

// For manual execution
if (require.main === module) {
  runSuspendOverdueAccounts()
    .then((result) => {
      console.log('Job result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
