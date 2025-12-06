import { useState } from "react";

type Props = {
  initialText: string;
  onSave: (text: string) => void;
  quotaRemaining?: number;
  usageEstimate?: number;
};

export default function ReportEditor({ initialText, onSave, quotaRemaining, usageEstimate }: Props) {
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(text);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    // TODO: call regenerate endpoint
    console.log("Regenerate not yet implemented");
  };

  return (
    <div style={{ padding: 12 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: "100%", fontFamily: "monospace" }}
      />
      {usageEstimate && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          Usage estimate: ~{usageEstimate} tokens
          {quotaRemaining !== undefined && ` (${quotaRemaining} remaining)`}
        </div>
      )}
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button onClick={handleRegenerate}>Regenerate</button>
      </div>
    </div>
  );
}
