import { useEffect, useState } from "react";

type ReviewItem = {
  id: string;
  report_id: string;
  reason: string;
  content_preview: string;
  status: string;
  flagged_at: string;
};

export default function HumanReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string>>({});

  const load = async () => {
    // TODO: fetch from /api/ai/human-review-queue
    setItems([]);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    // TODO: call /api/ai/human-review-queue/approve
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
  };

  const reject = async (id: string) => {
    // TODO: call /api/ai/human-review-queue/reject
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "rejected" } : item)));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Human Review Queue</h2>
      {items.length === 0 ? (
        <p>No items pending review.</p>
      ) : (
        <div>
          {items.map((item) => (
            <div key={item.id} style={{ border: "1px solid #e5e7eb", padding: 12, marginBottom: 8 }}>
              <p><strong>{item.report_id}</strong> - {item.reason}</p>
              <p style={{ fontSize: 12, color: "#666" }}>Preview: {item.content_preview}</p>
              <textarea
                value={selectedNotes[item.id] || ""}
                onChange={(e) => setSelectedNotes({ ...selectedNotes, [item.id]: e.target.value })}
                placeholder="Add review notes"
                rows={2}
              />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={() => approve(item.id)}>Approve</button>
                <button onClick={() => reject(item.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
