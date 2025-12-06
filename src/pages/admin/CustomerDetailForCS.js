import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const mock = {
    company: "Acme",
    onboarding: "Post first job",
    progress: 55,
    tickets: [
        { id: "zd_1", subject: "Login issue", status: "open" },
        { id: "zd_2", subject: "Billing question", status: "pending" },
    ],
    health: { score: 72, alerts: ["No jobs in 10d", "Overdue approvals"] },
};
export default function CustomerDetailForCS() {
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: mock.company }), _jsxs("div", { children: ["Onboarding step: ", mock.onboarding, " (", mock.progress, "%)"] }), _jsxs("div", { children: ["Health score: ", mock.health.score] }), _jsx("h3", { children: "Health alerts" }), _jsx("ul", { children: mock.health.alerts.map((a) => (_jsx("li", { children: a }, a))) }), _jsx("h3", { children: "Tickets" }), _jsx("ul", { children: mock.tickets.map((t) => (_jsxs("li", { children: [t.subject, " \u2014 ", t.status] }, t.id))) }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("button", { children: "Resend invite" }), _jsx("button", { style: { marginLeft: 8 }, children: "Trigger training" }), _jsx("button", { style: { marginLeft: 8 }, children: "Create ticket" })] })] }));
}
