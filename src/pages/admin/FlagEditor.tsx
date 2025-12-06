import { useState } from "react";
import { FlagDefinition, Variant, TargetRule } from "../../types/flags";

type Props = {
  initial?: FlagDefinition;
  onSave: (flag: FlagDefinition) => void;
  onCancel: () => void;
};

const emptyFlag: FlagDefinition = {
  key: "",
  description: "",
  enabled: true,
  type: "boolean",
  killSwitch: false,
  variants: [{ key: "control", rolloutPercentage: 100 }],
};

export default function FlagEditor({ initial, onSave, onCancel }: Props) {
  const [flag, setFlag] = useState<FlagDefinition>(initial ?? emptyFlag);

  const updateVariant = (idx: number, field: keyof Variant, value: any) => {
    const next = [...(flag.variants ?? [])];
    next[idx] = { ...next[idx], [field]: value } as Variant;
    setFlag({ ...flag, variants: next });
  };

  const addVariant = () => {
    const next = [ ...(flag.variants ?? []), { key: `variant_${(flag.variants?.length ?? 0) + 1}`, rolloutPercentage: 0 } ];
    setFlag({ ...flag, variants: next });
  };

  const updateRuleDesc = (idx: number, value: string) => {
    const rules = [...(flag.targetingRules ?? [])];
    rules[idx] = { ...rules[idx], description: value } as TargetRule;
    setFlag({ ...flag, targetingRules: rules });
  };

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <h3>Edit Flag</h3>
      <label>
        Key
        <input value={flag.key} onChange={(e) => setFlag({ ...flag, key: e.target.value })} />
      </label>
      <label>
        Description
        <input value={flag.description} onChange={(e) => setFlag({ ...flag, description: e.target.value })} />
      </label>
      <label>
        Type
        <select value={flag.type} onChange={(e) => setFlag({ ...flag, type: e.target.value as any })}>
          <option value="boolean">Boolean</option>
          <option value="multivariate">Multivariate</option>
        </select>
      </label>
      <label>
        Enabled
        <input type="checkbox" checked={flag.enabled} onChange={(e) => setFlag({ ...flag, enabled: e.target.checked })} />
      </label>
      <label>
        Kill switch
        <input type="checkbox" checked={!!flag.killSwitch} onChange={(e) => setFlag({ ...flag, killSwitch: e.target.checked })} />
      </label>

      <div style={{ marginTop: 12 }}>
        <h4>Variants</h4>
        {(flag.variants ?? []).map((v, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input value={v.key} onChange={(e) => updateVariant(idx, "key", e.target.value)} placeholder="key" />
            <input
              type="number"
              value={v.rolloutPercentage}
              onChange={(e) => updateVariant(idx, "rolloutPercentage", Number(e.target.value))}
              placeholder="rollout %"
            />
          </div>
        ))}
        <button onClick={addVariant}>Add variant</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>Targeting rules (simple)</h4>
        {(flag.targetingRules ?? []).map((r, idx) => (
          <input
            key={idx}
            value={r.description ?? ""}
            onChange={(e) => updateRuleDesc(idx, e.target.value)}
            placeholder="Description only (edit JSON manually for conditions)"
          />
        ))}
        <button
          onClick={() => setFlag({ ...flag, targetingRules: [ ...(flag.targetingRules ?? []), { id: `rule-${Date.now()}`, description: "", condition: { op: "eq", field: "country", value: "AU" } } ] })}
        >
          Add rule
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={() => onSave(flag)}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
