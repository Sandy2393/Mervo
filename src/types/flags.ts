export type TargetCondition =
  | { op: "eq"; field: string; value: string | number | boolean }
  | { op: "in"; field: string; values: Array<string | number> }
  | { op: "not"; condition: TargetCondition }
  | { op: "and"; conditions: TargetCondition[] }
  | { op: "or"; conditions: TargetCondition[] };

export type TargetRule = {
  id: string;
  description?: string;
  condition: TargetCondition;
};

export type Variant = {
  key: string;
  rolloutPercentage: number;
  payload?: Record<string, unknown>;
};

export type FlagDefinition = {
  key: string;
  description?: string;
  enabled: boolean;
  type: "boolean" | "multivariate";
  killSwitch?: boolean;
  variants?: Variant[];
  defaultVariant?: string;
  targetingRules?: TargetRule[];
  force?: Record<string, string>; // userId->variant override
  salt?: string;
};

export type EvaluationResult = {
  flagKey: string;
  enabled: boolean;
  variantKey: string;
  payload?: Record<string, unknown>;
  reason?: string;
};

export type UserContext = {
  userId?: string;
  companyId?: string;
  role?: string;
  country?: string;
  tags?: string[];
  forceVariant?: string;
};
