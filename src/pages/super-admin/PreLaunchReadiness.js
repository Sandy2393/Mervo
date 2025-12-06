import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";
export default function PreLaunchReadiness() {
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState("");
    async function run() {
        setStatus("Running suite...");
        const resp = await authedFetch("/api/tests/prelaunch");
        if (resp.ok) {
            setResult(await resp.json());
            setStatus("Done");
        }
        else {
            setStatus("Run failed");
        }
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Pre-Launch Readiness" }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", onClick: run, children: "Run checks" })] }), status && _jsx("div", { className: "text-sm text-gray-700", children: status }), result && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "border rounded p-3", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Overall" }), _jsx("div", { className: `text-xl font-semibold ${color(result.status)}`, children: result.status }), _jsxs("div", { className: "text-xs text-gray-600", children: ["Generated ", new Date(result.generated_at).toLocaleString()] })] }), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-3 font-medium", children: "Checks" }), _jsx("ul", { className: "divide-y", children: result.checks.map((c) => (_jsxs("li", { className: "p-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: c.name }), c.details && _jsx("div", { className: "text-xs text-gray-600", children: c.details })] }), _jsx("span", { className: `text-sm font-semibold ${color(c.status)}`, children: c.status })] }, c.name))) })] })] }))] }));
}
function color(status) {
    if (status === "PASS")
        return "text-green-600";
    if (status === "WARN")
        return "text-yellow-600";
    return "text-red-600";
}
