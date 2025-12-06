import { TargetCondition, UserContext } from "../../types/flags";

export function matchesCondition(condition: TargetCondition, ctx: UserContext): boolean {
  switch (condition.op) {
    case "eq":
      return getField(ctx, condition.field) === condition.value;
    case "in": {
      const val = getField(ctx, condition.field);
      if (Array.isArray(val)) {
        return val.some((v) => condition.values.includes(v as any));
      }
      return condition.values.includes(val as any);
    }
    case "not":
      return !matchesCondition(condition.condition, ctx);
    case "and":
      return condition.conditions.every((c) => matchesCondition(c, ctx));
    case "or":
      return condition.conditions.some((c) => matchesCondition(c, ctx));
    default:
      return false;
  }
}

function getField(ctx: UserContext, field: string): any {
  return (ctx as any)[field];
}
