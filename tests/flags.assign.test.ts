import { assignUserToVariant } from "../src/experiments/assignments";
import { FlagDefinition } from "../src/types/flags";

const flag: FlagDefinition = {
  key: "test",
  enabled: true,
  type: "multivariate",
  defaultVariant: "control",
  variants: [
    { key: "control", rolloutPercentage: 50 },
    { key: "variant", rolloutPercentage: 50 }
  ],
};

describe("assignUserToVariant", () => {
  it("is deterministic", () => {
    const a1 = assignUserToVariant(flag, { userId: "u1" });
    const a2 = assignUserToVariant(flag, { userId: "u1" });
    expect(a1).toBe(a2);
  });

  it("respects overrides", () => {
    const f = { ...flag, force: { "u2": "variant" } };
    expect(assignUserToVariant(f, { userId: "u2" })).toBe("variant");
  });

  it("buckets at boundaries", () => {
    const f = { ...flag, variants: [{ key: "control", rolloutPercentage: 100 }] };
    expect(assignUserToVariant(f, { userId: "any" })).toBe("control");
  });
});
