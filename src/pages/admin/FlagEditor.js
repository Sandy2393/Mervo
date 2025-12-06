import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const emptyFlag = {
    key: "",
    description: "",
    enabled: true,
    type: "boolean",
    killSwitch: false,
    variants: [{ key: "control", rolloutPercentage: 100 }],
};
export default function FlagEditor({ initial, onSave, onCancel }) {
    const [flag, setFlag] = useState(initial ?? emptyFlag);
    const updateVariant = (idx, field, value) => {
        const next = [...(flag.variants ?? [])];
        next[idx] = { ...next[idx], [field]: value };
        setFlag({ ...flag, variants: next });
    };
    const addVariant = () => {
        const next = [...(flag.variants ?? []), { key: `variant_${(flag.variants?.length ?? 0) + 1}`, rolloutPercentage: 0 }];
        setFlag({ ...flag, variants: next });
    };
    const updateRuleDesc = (idx, value) => {
        const rules = [...(flag.targetingRules ?? [])];
        rules[idx] = { ...rules[idx], description: value };
        setFlag({ ...flag, targetingRules: rules });
    };
    return (_jsxs("div", { style: { padding: 16, maxWidth: 640 }, children: [_jsx("h3", { children: "Edit Flag" }), _jsxs("label", { children: ["Key", _jsx("input", { value: flag.key, onChange: (e) => setFlag({ ...flag, key: e.target.value }) })] }), _jsxs("label", { children: ["Description", _jsx("input", { value: flag.description, onChange: (e) => setFlag({ ...flag, description: e.target.value }) })] }), _jsxs("label", { children: ["Type", _jsxs("select", { value: flag.type, onChange: (e) => setFlag({ ...flag, type: e.target.value }), children: [_jsx("option", { value: "boolean", children: "Boolean" }), _jsx("option", { value: "multivariate", children: "Multivariate" })] })] }), _jsxs("label", { children: ["Enabled", _jsx("input", { type: "checkbox", checked: flag.enabled, onChange: (e) => setFlag({ ...flag, enabled: e.target.checked }) })] }), _jsxs("label", { children: ["Kill switch", _jsx("input", { type: "checkbox", checked: !!flag.killSwitch, onChange: (e) => setFlag({ ...flag, killSwitch: e.target.checked }) })] }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("h4", { children: "Variants" }), (flag.variants ?? []).map((v, idx) => (_jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }, children: [_jsx("input", { value: v.key, onChange: (e) => updateVariant(idx, "key", e.target.value), placeholder: "key" }), _jsx("input", { type: "number", value: v.rolloutPercentage, onChange: (e) => updateVariant(idx, "rolloutPercentage", Number(e.target.value)), placeholder: "rollout %" })] }, idx))), _jsx("button", { onClick: addVariant, children: "Add variant" })] }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("h4", { children: "Targeting rules (simple)" }), (flag.targetingRules ?? []).map((r, idx) => (_jsx("input", { value: r.description ?? "", onChange: (e) => updateRuleDesc(idx, e.target.value), placeholder: "Description only (edit JSON manually for conditions)" }, idx))), _jsx("button", { onClick: () => setFlag({ ...flag, targetingRules: [...(flag.targetingRules ?? []), { id: `rule-${Date.now()}`, description: "", condition: { op: "eq", field: "country", value: "AU" } }] }), children: "Add rule" })] }), _jsxs("div", { style: { marginTop: 16, display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => onSave(flag), children: "Save" }), _jsx("button", { onClick: onCancel, children: "Cancel" })] })] }));
}
