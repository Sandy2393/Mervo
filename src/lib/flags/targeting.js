export function matchesCondition(condition, ctx) {
    switch (condition.op) {
        case "eq":
            return getField(ctx, condition.field) === condition.value;
        case "in": {
            const val = getField(ctx, condition.field);
            if (Array.isArray(val)) {
                return val.some((v) => condition.values.includes(v));
            }
            return condition.values.includes(val);
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
function getField(ctx, field) {
    return ctx[field];
}
