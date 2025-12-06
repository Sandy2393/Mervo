import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function CSDashboard() {
    const [pipeline, setPipeline] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [risks, setRisks] = useState([]);
    useEffect(() => {
        // TODO: fetch from backend endpoints
        setPipeline([
            { company: "Acme", stage: "Add employees", progress: 40 },
            { company: "Beta", stage: "Training", progress: 70 },
        ]);
        setTickets([
            { id: "zd_1", subject: "Login issue", status: "open" },
            { id: "zd_2", subject: "Billing question", status: "pending" },
        ]);
        setRisks([
            { company: "Acme", reason: "No jobs in 10d", severity: "high" },
            { company: "Beta", reason: "Overdue approvals", severity: "medium" },
        ]);
    }, []);
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: "Customer Success Dashboard" }), _jsxs("section", { children: [_jsx("h2", { children: "Onboarding Pipeline" }), pipeline.map((p) => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("strong", { children: p.company }), " \u2014 ", p.stage, _jsx("div", { style: { background: "#eee", height: 8, width: 200 }, children: _jsx("div", { style: { background: "#4caf50", width: `${p.progress}%`, height: 8 } }) })] }, p.company)))] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "Open Tickets" }), _jsx("ul", { children: tickets.map((t) => (_jsxs("li", { children: [t.subject, " \u2014 ", t.status, " (provider: ", t.providerId || "zendesk", ")"] }, t.id))) })] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "At-Risk Customers" }), _jsx("ul", { children: risks.map((r) => (_jsxs("li", { children: [r.company, ": ", r.reason, " (severity: ", r.severity, ")", _jsx("button", { style: { marginLeft: 8 }, children: "Resend invite" }), _jsx("button", { style: { marginLeft: 4 }, children: "Trigger training" }), _jsx("button", { style: { marginLeft: 4 }, children: "Create ticket" })] }, r.company))) })] })] }));
}
