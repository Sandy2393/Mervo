import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function ReportEditor({ initialText, onSave, quotaRemaining, usageEstimate }) {
    const [text, setText] = useState(initialText);
    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => {
        setIsSaving(true);
        try {
            onSave(text);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleRegenerate = () => {
        // TODO: call regenerate endpoint
        console.log("Regenerate not yet implemented");
    };
    return (_jsxs("div", { style: { padding: 12 }, children: [_jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 10, style: { width: "100%", fontFamily: "monospace" } }), usageEstimate && (_jsxs("div", { style: { marginTop: 8, fontSize: 12, color: "#666" }, children: ["Usage estimate: ~", usageEstimate, " tokens", quotaRemaining !== undefined && ` (${quotaRemaining} remaining)`] })), _jsxs("div", { style: { marginTop: 8, display: "flex", gap: 8 }, children: [_jsx("button", { onClick: handleSave, disabled: isSaving, children: isSaving ? "Saving…" : "Save" }), _jsx("button", { onClick: handleRegenerate, children: "Regenerate" })] })] }));
}
