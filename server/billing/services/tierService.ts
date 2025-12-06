/**
 * Tier Service
 * Manages subscription tier definitions, limits, and validation
 */

export type PlanTier = 'starter' | 'professional' | 'enterprise' | 'custom';

export interface TierLimits {
  contractors: number;
  storageGB: number;
  apiCallsPerMonth: number;
  concurrentConnections: number;
}

export interface TierDefinition {
  tier: PlanTier;
  name: string;
  monthlyPrice: number; // AUD
  limits: TierLimits;
  features: string[];
  recommended?: boolean;
}

export interface OveragePricing {
  storagePerGB: number; // AUD per GB
  apiCallsPer1000: number; // AUD per 1000 calls
  contractorPerSeat: number; // AUD per extra contractor
}

export interface UsageMetrics {
  contractors: number;
  storageGB: number;
  apiCalls: number;
  concurrentConnections: number;
}

export interface OverageCalculation {
  storageOverageGB: number;
  storageOverageCost: number;
  apiOverageCalls: number;
  apiOverageCost: number;
  contractorOverageCount: number;
  contractorOverageCost: number;
  totalOverageCost: number;
}

// Tier Definitions - Centralized pricing configuration
export const TIER_DEFINITIONS: Record<PlanTier, TierDefinition> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    monthlyPrice: 199,
    limits: {
      contractors: 5,
      storageGB: 5,
      apiCallsPerMonth: 50000,
      concurrentConnections: 2,
    },
    features: [
      'Up to 5 contractors',
      '5 GB storage',
      '50,000 API calls/month',
      'Basic job management',
      'Mobile app access',
      'Email support',
    ],
  },
  professional: {
    tier: 'professional',
    name: 'Professional',
    monthlyPrice: 499,
    limits: {
      contractors: 50,
      storageGB: 25,
      apiCallsPerMonth: 500000,
      concurrentConnections: 10,
    },
    features: [
      'Up to 50 contractors',
      '25 GB storage',
      '500,000 API calls/month',
      'Advanced job workflows',
      'Custom branding',
      'Priority support',
      'Offline mode',
      'Multi-company switching',
    ],
    recommended: true,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 2999,
    limits: {
      contractors: 500,
      storageGB: 100,
      apiCallsPerMonth: 5000000,
      concurrentConnections: 50,
    },
    features: [
      'Up to 500 contractors',
      '100 GB storage',
      '5,000,000 API calls/month',
      'White-label solution',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantee',
      'Advanced analytics',
    ],
  },
  custom: {
    tier: 'custom',
    name: 'Custom',
    monthlyPrice: 0, // Negotiated
    limits: {
      contractors: Infinity,
      storageGB: Infinity,
      apiCallsPerMonth: Infinity,
      concurrentConnections: Infinity,
    },
    features: [
      'Unlimited contractors',
      'Unlimited storage',
      'Unlimited API calls',
      'Custom feature development',
      'On-premise deployment options',
      'Enterprise security',
      'Volume discounts',
    ],
  },
};

// Overage pricing (when limits exceeded)
export const OVERAGE_PRICING: OveragePricing = {
  storagePerGB: 0.75, // $0.75 AUD per GB over limit
  apiCallsPer1000: 0.10, // $0.10 AUD per 1000 calls over limit
  contractorPerSeat: 5.00, // $5.00 AUD per contractor over limit
};

// GST rate for Australia
export const GST_RATE = 0.10; // 10%

class TierService {
  /**
   * Get tier definition by tier name
   */
  getTierDefinition(tier: PlanTier): TierDefinition {
    return TIER_DEFINITIONS[tier];
  }

  /**
   * Get all available tiers
   */
  getAllTiers(): TierDefinition[] {
    return Object.values(TIER_DEFINITIONS);
  }

  /**
   * Get public-facing tier list (excludes custom)
   */
  getPublicTiers(): TierDefinition[] {
    return Object.values(TIER_DEFINITIONS).filter(t => t.tier !== 'custom');
  }

  /**
   * Get tier limits
   */
  getTierLimits(tier: PlanTier): TierLimits {
    return TIER_DEFINITIONS[tier].limits;
  }

  /**
   * Validate if usage is within tier limits
   */
  validateUsageAgainstTier(usage: UsageMetrics, tier: PlanTier): {
    withinLimits: boolean;
    exceeded: Partial<Record<keyof TierLimits, boolean>>;
  } {
    const limits = this.getTierLimits(tier);
    
    const exceeded: Partial<Record<keyof TierLimits, boolean>> = {};
    
    if (usage.contractors > limits.contractors) {
      exceeded.contractors = true;
    }
    if (usage.storageGB > limits.storageGB) {
      exceeded.storageGB = true;
    }
    if (usage.apiCalls > limits.apiCallsPerMonth) {
      exceeded.apiCallsPerMonth = true;
    }
    if (usage.concurrentConnections > limits.concurrentConnections) {
      exceeded.concurrentConnections = true;
    }

    return {
      withinLimits: Object.keys(exceeded).length === 0,
      exceeded,
    };
  }

  /**
   * Calculate overage costs based on usage
   */
  calculateOverageCost(usage: UsageMetrics, tier: PlanTier): OverageCalculation {
    const limits = this.getTierLimits(tier);
    
    // Storage overage
    const storageOverageGB = Math.max(0, usage.storageGB - limits.storageGB);
    const storageOverageCost = storageOverageGB * OVERAGE_PRICING.storagePerGB;

    // API calls overage
    const apiOverageCalls = Math.max(0, usage.apiCalls - limits.apiCallsPerMonth);
    const apiOverageCost = (apiOverageCalls / 1000) * OVERAGE_PRICING.apiCallsPer1000;

    // Contractor overage
    const contractorOverageCount = Math.max(0, usage.contractors - limits.contractors);
    const contractorOverageCost = contractorOverageCount * OVERAGE_PRICING.contractorPerSeat;

    const totalOverageCost = storageOverageCost + apiOverageCost + contractorOverageCost;

    return {
      storageOverageGB: parseFloat(storageOverageGB.toFixed(3)),
      storageOverageCost: parseFloat(storageOverageCost.toFixed(2)),
      apiOverageCalls,
      apiOverageCost: parseFloat(apiOverageCost.toFixed(2)),
      contractorOverageCount,
      contractorOverageCost: parseFloat(contractorOverageCost.toFixed(2)),
      totalOverageCost: parseFloat(totalOverageCost.toFixed(2)),
    };
  }

  /**
   * Calculate total monthly cost (base + overages)
   */
  calculateTotalMonthlyCost(
    tier: PlanTier,
    usage: UsageMetrics,
    couponDiscount: number = 0
  ): {
    baseCost: number;
    overageCost: number;
    subtotal: number;
    discount: number;
    subtotalAfterDiscount: number;
    gst: number;
    total: number;
  } {
    const tierDef = this.getTierDefinition(tier);
    const baseCost = tierDef.monthlyPrice;
    const overage = this.calculateOverageCost(usage, tier);
    const overageCost = overage.totalOverageCost;
    const subtotal = baseCost + overageCost;
    const discount = Math.min(couponDiscount, subtotal);
    const subtotalAfterDiscount = subtotal - discount;
    const gst = subtotalAfterDiscount * GST_RATE;
    const total = subtotalAfterDiscount + gst;

    return {
      baseCost: parseFloat(baseCost.toFixed(2)),
      overageCost: parseFloat(overageCost.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      subtotalAfterDiscount: parseFloat(subtotalAfterDiscount.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  /**
   * Get recommended tier based on usage
   */
  getRecommendedTier(usage: UsageMetrics): PlanTier {
    const tiers: PlanTier[] = ['starter', 'professional', 'enterprise'];
    
    for (const tier of tiers) {
      const limits = this.getTierLimits(tier);
      
      // Check if usage fits comfortably (with 20% buffer)
      const fitsContractors = usage.contractors <= limits.contractors * 0.8;
      const fitsStorage = usage.storageGB <= limits.storageGB * 0.8;
      const fitsApiCalls = usage.apiCalls <= limits.apiCallsPerMonth * 0.8;
      
      if (fitsContractors && fitsStorage && fitsApiCalls) {
        return tier;
      }
    }
    
    return 'enterprise';
  }

  /**
   * Calculate savings for annual prepayment
   */
  calculateAnnualSavings(tier: PlanTier, annualDiscountPercent: number = 40): {
    monthlyTotal: number;
    annualTotal: number;
    savings: number;
    effectiveMonthlyRate: number;
  } {
    const tierDef = this.getTierDefinition(tier);
    const monthlyTotal = tierDef.monthlyPrice * 12;
    const annualTotal = monthlyTotal * (1 - annualDiscountPercent / 100);
    const savings = monthlyTotal - annualTotal;
    const effectiveMonthlyRate = annualTotal / 12;

    return {
      monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
      annualTotal: parseFloat(annualTotal.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      effectiveMonthlyRate: parseFloat(effectiveMonthlyRate.toFixed(2)),
    };
  }

  /**
   * Get usage percentage for a specific metric
   */
  getUsagePercentage(current: number, limit: number): number {
    if (limit === Infinity || limit === 0) return 0;
    return Math.min(100, (current / limit) * 100);
  }

  /**
   * Determine alert level based on usage percentage
   */
  getUsageAlertLevel(percentage: number): 'normal' | 'warning' | 'critical' | 'exceeded' {
    if (percentage < 50) return 'normal';
    if (percentage < 75) return 'warning';
    if (percentage < 100) return 'critical';
    return 'exceeded';
  }
}

export const tierService = new TierService();
