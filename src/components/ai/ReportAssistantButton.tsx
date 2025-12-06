import { useState } from "react";
import { useAI } from "../../hooks/useAI";

type Props = {
  jobId: string;
  onReportGenerated?: (text: string) => void;
};

export default function ReportAssistantButton({ jobId, onReportGenerated }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [generated, setGenerated] = useState<string>("");
  const [includePii, setIncludePii] = useState(false);
  const { generateReport, loading } = useAI();

  const handleGenerate = async () => {
    try {
      const result = await generateReport(jobId, notes, photoUrls);
      setGenerated(result.generated_text);
      onReportGenerated?.(result.generated_text);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Generate Report with AI</button>
      {showModal && (
        <div style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, maxWidth: 640 }}>
          <h3>Generate Report from Photos & Notes</h3>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe work completed..."
              rows={4}
            />
          </label>
          <label>
            Photos (paste URLs, one per line)
            <textarea
              value={photoUrls.join("\n")}
              onChange={(e) => setPhotoUrls(e.target.value.split("\n").filter((u) => u.trim()))}
              rows={3}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={includePii}
              onChange={(e) => setIncludePii(e.target.checked)}
              disabled={true} // disabled by default unless company opt-in
            />
            Include personal information (disabled - company must opt-in)
          </label>
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </button>
          {generated && (
            <div style={{ marginTop: 12, padding: 8, backgroundColor: "#f0fdf4", borderRadius: 4 }}>
              <strong>Preview:</strong>
              <p>{generated.slice(0, 200)}…</p>
            </div>
          )}
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </>
  );
}
