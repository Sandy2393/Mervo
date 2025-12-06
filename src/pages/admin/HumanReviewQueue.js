import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function HumanReviewQueue() {
    const [items, setItems] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState({});
    const load = async () => {
        // TODO: fetch from /api/ai/human-review-queue
        setItems([]);
    };
    useEffect(() => {
        load();
    }, []);
    const approve = async (id) => {
        // TODO: call /api/ai/human-review-queue/approve
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
    };
    const reject = async (id) => {
        // TODO: call /api/ai/human-review-queue/reject
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "rejected" } : item)));
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { children: "Human Review Queue" }), items.length === 0 ? (_jsx("p", { children: "No items pending review." })) : (_jsx("div", { children: items.map((item) => (_jsxs("div", { style: { border: "1px solid #e5e7eb", padding: 12, marginBottom: 8 }, children: [_jsxs("p", { children: [_jsx("strong", { children: item.report_id }), " - ", item.reason] }), _jsxs("p", { style: { fontSize: 12, color: "#666" }, children: ["Preview: ", item.content_preview] }), _jsx("textarea", { value: selectedNotes[item.id] || "", onChange: (e) => setSelectedNotes({ ...selectedNotes, [item.id]: e.target.value }), placeholder: "Add review notes", rows: 2 }), _jsxs("div", { style: { marginTop: 8, display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => approve(item.id), children: "Approve" }), _jsx("button", { onClick: () => reject(item.id), children: "Reject" })] })] }, item.id))) }))] }));
}
