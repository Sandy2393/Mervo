/**
 * Coupon Service
 * Manages discount codes, validation, and application
 */

import { supabase } from '../../db/supabaseClient';

export type CouponDiscountType = 'percentage' | 'fixed_amount' | 'trial_days';
export type CouponStatus = 'active' | 'expired' | 'used' | 'suspended';

export interface CouponDefinition {
  id: string;
  couponCode: string;
  discountType: CouponDiscountType;
  discountValue: number;
  recurring: boolean;
  activeFrom: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  status: CouponStatus;
  createdBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppliedCoupon {
  id: string;
  companyId: string;
  couponCode: string;
  discountType: CouponDiscountType;
  discountValue: number;
  recurring: boolean;
  appliedDate: string;
  expiresAt: string | null;
  status: CouponStatus;
  createdBy: string | null;
  notes: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discount?: {
    type: CouponDiscountType;
    value: number;
    recurring: boolean;
  };
}

class CouponService {
  /**
   * Create a new coupon definition
   */
  async createCoupon(params: {
    couponCode: string;
    discountType: CouponDiscountType;
    discountValue: number;
    recurring?: boolean;
    activeFrom?: Date;
    expiresAt?: Date | null;
    usageLimit?: number | null;
    createdBy?: string;
    notes?: string;
  }): Promise<CouponDefinition> {
    const {
      couponCode,
      discountType,
      discountValue,
      recurring = false,
      activeFrom = new Date(),
      expiresAt = null,
      usageLimit = null,
      createdBy = null,
      notes = null,
    } = params;

    const { data, error } = await supabase
      .from('coupon_definitions')
      .insert({
        coupon_code: couponCode.toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        recurring,
        active_from: activeFrom.toISOString(),
        expires_at: expiresAt?.toISOString() || null,
        usage_limit: usageLimit,
        usage_count: 0,
        status: 'active',
        created_by: createdBy,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCouponDefinition(data);
  }

  /**
   * Get coupon definition by code
   */
  async getCouponByCode(couponCode: string): Promise<CouponDefinition | null> {
    const { data, error } = await supabase
      .from('coupon_definitions')
      .select('*')
      .eq('coupon_code', couponCode.toUpperCase())
      .single();

    if (error || !data) return null;
    return this.mapCouponDefinition(data);
  }

  /**
   * Validate coupon for a company
   */
  async validateCoupon(couponCode: string, companyId: string): Promise<CouponValidationResult> {
    // Get coupon definition
    const coupon = await this.getCouponByCode(couponCode);

    if (!coupon) {
      return { valid: false, reason: 'Coupon code not found' };
    }

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return { valid: false, reason: `Coupon is ${coupon.status}` };
    }

    // Check if coupon has started
    const now = new Date();
    const activeFrom = new Date(coupon.activeFrom);
    if (now < activeFrom) {
      return { valid: false, reason: 'Coupon not yet active' };
    }

    // Check if coupon has expired
    if (coupon.expiresAt) {
      const expiresAt = new Date(coupon.expiresAt);
      if (now > expiresAt) {
        // Auto-expire the coupon
        await this.expireCoupon(coupon.id);
        return { valid: false, reason: 'Coupon has expired' };
      }
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, reason: 'Coupon usage limit reached' };
    }

    // Check if company already has an active coupon
    const existingCoupon = await this.getActiveCouponForCompany(companyId);
    if (existingCoupon) {
      return { valid: false, reason: 'Company already has an active coupon' };
    }

    return {
      valid: true,
      discount: {
        type: coupon.discountType,
        value: coupon.discountValue,
        recurring: coupon.recurring,
      },
    };
  }

  /**
   * Apply coupon to a company
   */
  async applyCoupon(companyId: string, couponCode: string, appliedBy?: string): Promise<AppliedCoupon> {
    // Validate first
    const validation = await this.validateCoupon(couponCode, companyId);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const coupon = await this.getCouponByCode(couponCode);
    if (!coupon) throw new Error('Coupon not found');

    // Apply coupon to company
    const { data, error } = await supabase
      .from('company_coupons')
      .insert({
        company_id: companyId,
        coupon_code: coupon.couponCode,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        recurring: coupon.recurring,
        applied_date: new Date().toISOString(),
        expires_at: coupon.expiresAt,
        status: 'active',
        created_by: appliedBy || null,
        notes: `Applied from coupon: ${coupon.couponCode}`,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment usage count
    await supabase
      .from('coupon_definitions')
      .update({ usage_count: coupon.usageCount + 1 })
      .eq('id', coupon.id);

    // Log billing event
    await this.logBillingEvent(companyId, 'coupon_applied', {
      couponCode: coupon.couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      appliedBy,
    });

    return this.mapAppliedCoupon(data);
  }

  /**
   * Remove coupon from a company
   */
  async removeCoupon(companyId: string, removedBy?: string): Promise<void> {
    const activeCoupon = await this.getActiveCouponForCompany(companyId);
    if (!activeCoupon) {
      throw new Error('No active coupon found for company');
    }

    await supabase
      .from('company_coupons')
      .update({ status: 'used' })
      .eq('id', activeCoupon.id);

    // Log billing event
    await this.logBillingEvent(companyId, 'coupon_removed', {
      couponCode: activeCoupon.couponCode,
      removedBy,
    });
  }

  /**
   * Get active coupon for a company
   */
  async getActiveCouponForCompany(companyId: string): Promise<AppliedCoupon | null> {
    const { data, error } = await supabase
      .from('company_coupons')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('applied_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.mapAppliedCoupon(data);
  }

  /**
   * Calculate discount amount for a billing amount
   */
  calculateDiscount(
    baseAmount: number,
    coupon: AppliedCoupon | null
  ): { discountAmount: number; finalAmount: number } {
    if (!coupon || coupon.status !== 'active') {
      return { discountAmount: 0, finalAmount: baseAmount };
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = baseAmount * (coupon.discountValue / 100);
    } else if (coupon.discountType === 'fixed_amount') {
      discountAmount = Math.min(coupon.discountValue, baseAmount);
    }
    // trial_days doesn't apply to ongoing billing (handled at subscription creation)

    discountAmount = parseFloat(discountAmount.toFixed(2));
    const finalAmount = parseFloat((baseAmount - discountAmount).toFixed(2));

    return { discountAmount, finalAmount };
  }

  /**
   * Expire a coupon
   */
  async expireCoupon(couponId: string): Promise<void> {
    await supabase
      .from('coupon_definitions')
      .update({ status: 'expired' })
      .eq('id', couponId);
  }

  /**
   * Get all coupon definitions
   */
  async getAllCoupons(activeOnly: boolean = false): Promise<CouponDefinition[]> {
    let query = supabase.from('coupon_definitions').select('*').order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(this.mapCouponDefinition);
  }

  /**
   * Get coupon usage statistics
   */
  async getCouponStats(couponCode?: string): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    totalDiscountGiven: number;
    topCoupons: Array<{ code: string; usage: number; discount: number }>;
  }> {
    let query = supabase.from('coupon_definitions').select('*');

    if (couponCode) {
      query = query.eq('coupon_code', couponCode.toUpperCase());
    }

    const { data: coupons } = await query;

    if (!coupons) {
      return {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUsage: 0,
        totalDiscountGiven: 0,
        topCoupons: [],
      };
    }

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const totalUsage = coupons.reduce((sum, c) => sum + c.usage_count, 0);

    // Get total discount given (would need to query invoices)
    const totalDiscountGiven = 0; // Placeholder

    // Top coupons by usage
    const topCoupons = coupons
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10)
      .map(c => ({
        code: c.coupon_code,
        usage: c.usage_count,
        discount: 0, // Would calculate from invoices
      }));

    return {
      totalCoupons,
      activeCoupons,
      totalUsage,
      totalDiscountGiven,
      topCoupons,
    };
  }

  /**
   * Check and expire old coupons (daily job)
   */
  async expireOldCoupons(): Promise<number> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('coupon_definitions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', now)
      .select();

    return data?.length || 0;
  }

  /**
   * Map database row to CouponDefinition
   */
  private mapCouponDefinition(data: any): CouponDefinition {
    return {
      id: data.id,
      couponCode: data.coupon_code,
      discountType: data.discount_type,
      discountValue: parseFloat(data.discount_value),
      recurring: data.recurring,
      activeFrom: data.active_from,
      expiresAt: data.expires_at,
      usageLimit: data.usage_limit,
      usageCount: data.usage_count,
      status: data.status,
      createdBy: data.created_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Map database row to AppliedCoupon
   */
  private mapAppliedCoupon(data: any): AppliedCoupon {
    return {
      id: data.id,
      companyId: data.company_id,
      couponCode: data.coupon_code,
      discountType: data.discount_type,
      discountValue: parseFloat(data.discount_value),
      recurring: data.recurring,
      appliedDate: data.applied_date,
      expiresAt: data.expires_at,
      status: data.status,
      createdBy: data.created_by,
      notes: data.notes,
    };
  }

  /**
   * Log billing event
   */
  private async logBillingEvent(companyId: string, eventType: string, eventData: any): Promise<void> {
    await supabase.from('billing_events').insert({
      company_id: companyId,
      event_type: eventType,
      event_data: eventData,
    });
  }
}

export const couponService = new CouponService();
