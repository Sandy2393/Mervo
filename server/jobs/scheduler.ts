/**
 * Job Scheduler
 * Sets up cron schedules for all billing automation jobs
 * 
 * Schedule times (AEST/Australia/Sydney):
 * - Daily snapshots: 11:00 PM (capture end-of-day usage)
 * - Monthly invoicing: 2:00 AM on 1st (low-traffic time)
 * - Overage alerts: 9:00 AM (business hours start)
 * - Suspend overdue: 10:00 AM (after alerts, business hours)
 * - Expire coupons: 3:00 AM (low-traffic time)
 */

import cron from 'node-cron';
import { runDailyUsageSnapshot } from './dailyUsageSnapshot';
import { runMonthlyInvoicing } from './monthlyInvoicing';
import { runOverageAlerts } from './overageAlerts';
import { runSuspendOverdueAccounts } from './suspendOverdueAccounts';
import { runExpireOldCoupons } from './expireOldCoupons';

export function startBillingScheduler() {
  console.log('[Scheduler] Starting billing automation scheduler...');

  // Daily Usage Snapshots - 11:00 PM AEST daily
  cron.schedule('0 23 * * *', async () => {
    console.log('[Scheduler] Triggering daily usage snapshot job');
    try {
      await runDailyUsageSnapshot();
    } catch (error) {
      console.error('[Scheduler] Daily snapshot job failed:', error);
    }
  }, {
    timezone: 'Australia/Sydney'
  });

  // Monthly Invoicing - 2:00 AM AEST on 1st of month
  cron.schedule('0 2 1 * *', async () => {
    console.log('[Scheduler] Triggering monthly invoicing job');
    try {
      await runMonthlyInvoicing();
    } catch (error) {
      console.error('[Scheduler] Monthly invoicing job failed:', error);
    }
  }, {
    timezone: 'Australia/Sydney'
  });

  // Overage Alerts - 9:00 AM AEST daily
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Triggering overage alerts job');
    try {
      await runOverageAlerts();
    } catch (error) {
      console.error('[Scheduler] Overage alerts job failed:', error);
    }
  }, {
    timezone: 'Australia/Sydney'
  });

  // Suspend Overdue Accounts - 10:00 AM AEST daily
  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] Triggering suspend overdue accounts job');
    try {
      await runSuspendOverdueAccounts();
    } catch (error) {
      console.error('[Scheduler] Suspend overdue job failed:', error);
    }
  }, {
    timezone: 'Australia/Sydney'
  });

  // Expire Old Coupons - 3:00 AM AEST daily
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Triggering expire old coupons job');
    try {
      await runExpireOldCoupons();
    } catch (error) {
      console.error('[Scheduler] Expire coupons job failed:', error);
    }
  }, {
    timezone: 'Australia/Sydney'
  });

  console.log('[Scheduler] All billing jobs scheduled successfully');
  console.log('[Scheduler] Schedule summary:');
  console.log('  - Daily snapshots:    11:00 PM AEST');
  console.log('  - Monthly invoicing:   2:00 AM AEST (1st of month)');
  console.log('  - Overage alerts:      9:00 AM AEST');
  console.log('  - Suspend overdue:    10:00 AM AEST');
  console.log('  - Expire coupons:      3:00 AM AEST');
}

// For testing individual jobs manually
export async function runJobManually(jobName: string) {
  console.log(`[Scheduler] Running job manually: ${jobName}`);
  
  switch (jobName) {
    case 'snapshot':
      return await runDailyUsageSnapshot();
    case 'invoicing':
      return await runMonthlyInvoicing();
    case 'alerts':
      return await runOverageAlerts();
    case 'suspend':
      return await runSuspendOverdueAccounts();
    case 'expire-coupons':
      return await runExpireOldCoupons();
    default:
      throw new Error(`Unknown job: ${jobName}`);
  }
}

// Start scheduler if run directly
if (require.main === module) {
  startBillingScheduler();
  console.log('[Scheduler] Press Ctrl+C to stop');
}
