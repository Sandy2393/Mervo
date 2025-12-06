/**
 * Overage Alerts Job
 * Runs at 9:00 AM AEST daily to check usage and send alerts
 * Schedule: 0 9 * * * (9 AM daily)
 * 
 * Alerts sent at: 50%, 75%, 90%, 100%, 125%, 150%+ of tier limits
 */

import { supabase } from '../db/supabase';
import { usageService } from '../billing/services/usageService';
import { tierService } from '../billing/services/tierService';

interface AlertThreshold {
  level: number;
  severity: 'info' | 'warning' | 'critical' | 'exceeded';
  label: string;
}

const ALERT_THRESHOLDS: AlertThreshold[] = [
  { level: 0.50, severity: 'info', label: '50%' },
  { level: 0.75, severity: 'warning', label: '75%' },
  { level: 0.90, severity: 'critical', label: '90%' },
  { level: 1.00, severity: 'exceeded', label: '100%' },
  { level: 1.25, severity: 'exceeded', label: '125%' },
  { level: 1.50, severity: 'exceeded', label: '150%' },
];

export async function runOverageAlerts() {
  console.log('[OverageAlerts] Starting overage alerts job...');
  const startTime = Date.now();

  try {
    // Get all active companies
    const { data: companies, error } = await supabase
      .from('company_plans')
      .select('companyId, tier, status')
      .in('status', ['active', 'trialing']);

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    if (!companies || companies.length === 0) {
      console.log('[OverageAlerts] No active companies found');
      return { success: true, alertsSent: 0 };
    }

    console.log(`[OverageAlerts] Checking ${companies.length} companies...`);

    let alertsSent = 0;
    const alerts: Array<{
      companyId: string;
      metric: string;
      percentage: number;
      severity: string;
    }> = [];

    for (const company of companies) {
      try {
        const usage = await usageService.getCurrentUsage(company.companyId);
        const tierDef = tierService.getTierDefinition(company.tier);

        // Check contractors
        const contractorPct = usage.contractors / tierDef.includedContractors;
        await checkThreshold(
          company.companyId,
          'contractors',
          contractorPct,
          usage.contractors,
          tierDef.includedContractors,
          alerts
        );

        // Check storage
        const storagePct = usage.storageGB / tierDef.includedStorageGB;
        await checkThreshold(
          company.companyId,
          'storage',
          storagePct,
          usage.storageGB,
          tierDef.includedStorageGB,
          alerts
        );

        // Check API calls
        const apiPct = usage.apiCalls / tierDef.includedAPICalls;
        await checkThreshold(
          company.companyId,
          'apiCalls',
          apiPct,
          usage.apiCalls,
          tierDef.includedAPICalls,
          alerts
        );
      } catch (err) {
        console.error(`[OverageAlerts] Error for company ${company.companyId}:`, err);
      }
    }

    alertsSent = alerts.length;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[OverageAlerts] Job completed in ${duration}s`);
    console.log(`[OverageAlerts] Alerts sent: ${alertsSent}`);

    // Log to billing_events
    await supabase.from('billing_events').insert({
      eventType: 'overage_alerts',
      description: `Overage alerts sent: ${alertsSent}`,
      metadata: {
        alertsSent,
        alerts: alerts.slice(0, 50), // Only store first 50 for brevity
        duration: `${duration}s`,
      },
    });

    return {
      success: true,
      alertsSent,
      alerts,
      duration: `${duration}s`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OverageAlerts] Critical error:', errorMsg);

    await supabase.from('billing_events').insert({
      eventType: 'overage_alerts_failed',
      description: `Overage alerts job failed: ${errorMsg}`,
      metadata: { error: errorMsg },
    });

    throw error;
  }
}

async function checkThreshold(
  companyId: string,
  metric: string,
  percentage: number,
  current: number,
  limit: number,
  alerts: Array<any>
) {
  // Find the highest threshold crossed
  const crossedThresholds = ALERT_THRESHOLDS.filter(t => percentage >= t.level);
  if (crossedThresholds.length === 0) return;

  const highestThreshold = crossedThresholds[crossedThresholds.length - 1];

  // Check if we've already sent this alert today
  const today = new Date().toISOString().split('T')[0];
  const { data: existingAlert } = await supabase
    .from('billing_events')
    .select('id')
    .eq('companyId', companyId)
    .eq('eventType', 'usage_alert')
    .gte('createdAt', today)
    .contains('metadata', { metric, threshold: highestThreshold.level })
    .single();

  if (existingAlert) {
    // Already sent this alert today
    return;
  }

  // Send alert (implement email/notification service)
  console.log(
    `[OverageAlerts] ALERT for ${companyId}: ${metric} at ${(percentage * 100).toFixed(0)}% (${current}/${limit})`
  );

  // Log the alert
  await supabase.from('billing_events').insert({
    companyId,
    eventType: 'usage_alert',
    description: `${metric} usage at ${highestThreshold.label} of limit`,
    metadata: {
      metric,
      threshold: highestThreshold.level,
      severity: highestThreshold.severity,
      current,
      limit,
      percentage: percentage.toFixed(2),
    },
  });

  alerts.push({
    companyId,
    metric,
    percentage: Math.round(percentage * 100),
    severity: highestThreshold.severity,
  });

  // TODO: Send actual email/SMS notification
  // await emailService.sendUsageAlert(companyId, metric, percentage, highestThreshold.severity);
}

// For manual execution
if (require.main === module) {
  runOverageAlerts()
    .then((result) => {
      console.log('Job result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
