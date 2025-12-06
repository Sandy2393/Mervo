import { FlagDefinition, UserContext } from "../types/flags";
import { matchesCondition } from "../lib/flags/targeting";
import { chooseVariant } from "../lib/flags/rollout";

export function assignUserToVariant(flag: FlagDefinition, ctx: UserContext): string {
  if (!flag.enabled || flag.killSwitch) return flag.defaultVariant ?? "control";
  if (ctx.forceVariant) return ctx.forceVariant;
  if (flag.force && ctx.userId && flag.force[ctx.userId]) return flag.force[ctx.userId];

  if (flag.targetingRules && flag.targetingRules.length > 0) {
    const allowed = flag.targetingRules.some((rule) => matchesCondition(rule.condition, ctx));
    if (!allowed) return flag.defaultVariant ?? "control";
  }

  if (flag.type === "boolean") {
    const variantKey = chooseVariant(
      flag.key,
      ctx.userId,
      flag.variants ?? [{ key: "control", rolloutPercentage: 100 }],
      flag.salt
    );
    return variantKey === "control" ? "control" : "on";
  }

  const variants = flag.variants ?? [];
  return chooseVariant(flag.key, ctx.userId, variants, flag.salt);
}
