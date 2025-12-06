import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { listFeedback, markResolved, submitFeedback } from "../../services/feedbackService";
// Simple admin dashboard for feedback. Uses stubbed service until backend is wired.
const statuses = ["open", "resolved", "archived"];
const types = ["bug", "idea", "praise", "other"];
export default function FeedbackDashboard() {
    const [items, setItems] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const companyId = "company-1"; // TODO: replace with real company context
    const load = async () => {
        const data = await listFeedback(companyId, {
            status: statusFilter || undefined,
            type: typeFilter || undefined,
        });
        setItems(data);
    };
    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, typeFilter]);
    const resolve = async (id) => {
        await markResolved(id, "admin-1"); // TODO: use real resolver id
        await load();
    };
    const quickAdd = async () => {
        await submitFeedback(companyId, "admin-1", "idea", "Placeholder admin-created feedback", { source: "admin-ui" });
        await load();
    };
    return (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Feedback Dashboard" }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { className: "px-3 py-1 border rounded", onClick: quickAdd, children: "Add Test Feedback" }), _jsx("button", { className: "px-3 py-1 border rounded", onClick: load, children: "Refresh" })] })] }), _jsxs("section", { className: "flex space-x-3", children: [_jsxs("label", { className: "flex flex-col text-sm", children: ["Status", _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "", children: "All" }), statuses.map((s) => (_jsx("option", { value: s, children: s }, s)))] })] }), _jsxs("label", { className: "flex flex-col text-sm", children: ["Type", _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), children: [_jsx("option", { value: "", children: "All" }), types.map((t) => (_jsx("option", { value: t, children: t }, t)))] })] })] }), _jsxs("div", { className: "grid gap-3", children: [items.map((fb) => (_jsx("div", { className: "border rounded p-3", children: _jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [fb.type.toUpperCase(), " \u2014 ", fb.status] }), _jsx("p", { className: "text-sm text-gray-700", children: fb.message }), _jsx("p", { className: "text-xs text-gray-500", children: fb.created_at })] }), fb.status !== "resolved" && (_jsx("button", { className: "px-2 py-1 border rounded", onClick: () => void resolve(fb.id), children: "Resolve" }))] }) }, fb.id))), items.length === 0 && _jsx("p", { className: "text-sm text-gray-600", children: "No feedback yet." })] })] }));
}
