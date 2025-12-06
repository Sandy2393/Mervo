/**
 * Expire Old Coupons Job
 * Runs at 3:00 AM AEST daily to expire coupons past their expiration date
 * Schedule: 0 3 * * * (3 AM daily)
 */

import { supabase } from '../db/supabase';

export async function runExpireOldCoupons() {
  console.log('[ExpireCoupons] Starting expire old coupons job...');
  const startTime = Date.now();

  try {
    const today = new Date().toISOString();

    // Find all active coupons that have passed their expiration date
    const { data: expiredCoupons, error: fetchError } = await supabase
      .from('coupon_definitions')
      .select('id, couponCode, expiresAt')
      .eq('status', 'active')
      .not('expiresAt', 'is', null)
      .lt('expiresAt', today);

    if (fetchError) {
      throw new Error(`Failed to fetch expired coupons: ${fetchError.message}`);
    }

    if (!expiredCoupons || expiredCoupons.length === 0) {
      console.log('[ExpireCoupons] No coupons to expire');
      return { success: true, expired: 0 };
    }

    console.log(`[ExpireCoupons] Found ${expiredCoupons.length} coupons to expire`);

    // Expire all coupons
    const { error: updateError } = await supabase
      .from('coupon_definitions')
      .update({ status: 'expired' })
      .in('id', expiredCoupons.map(c => c.id));

    if (updateError) {
      throw new Error(`Failed to expire coupons: ${updateError.message}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[ExpireCoupons] Job completed in ${duration}s`);
    console.log(`[ExpireCoupons] Expired ${expiredCoupons.length} coupons`);

    // Log to billing_events
    await supabase.from('billing_events').insert({
      eventType: 'coupons_expired',
      description: `${expiredCoupons.length} coupons expired`,
      metadata: {
        expiredCount: expiredCoupons.length,
        couponCodes: expiredCoupons.map(c => c.couponCode),
        duration: `${duration}s`,
      },
    });

    return {
      success: true,
      expired: expiredCoupons.length,
      coupons: expiredCoupons.map(c => c.couponCode),
      duration: `${duration}s`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ExpireCoupons] Critical error:', errorMsg);

    await supabase.from('billing_events').insert({
      eventType: 'expire_coupons_failed',
      description: `Expire coupons job failed: ${errorMsg}`,
      metadata: { error: errorMsg },
    });

    throw error;
  }
}

// For manual execution
if (require.main === module) {
  runExpireOldCoupons()
    .then((result) => {
      console.log('Job result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
