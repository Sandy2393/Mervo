import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function ReportsReview() {
    const [reports, setReports] = useState([]);
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        fetch("/api/reports?status=submitted").then((r) => r.json()).then(setReports);
    }, []);
    const review = async (status) => {
        if (!selected)
            return;
        await fetch(`/api/reports/${selected.id}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        setSelected(null);
        setReports((prev) => prev.filter((r) => r.id !== selected.id));
    };
    const downloadPdf = async () => {
        if (!selected)
            return;
        const res = await fetch(`/api/reports/${selected.id}/pdf`);
        const data = await res.json();
        window.alert(`PDF at ${data.url}`);
    };
    return (_jsxs("div", { className: "p-6 grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "md:col-span-1 space-y-2", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Reports" }), reports.map((r) => (_jsxs("button", { onClick: () => setSelected(r), className: `w-full text-left border rounded p-3 ${selected?.id === r.id ? "border-blue-600" : ""}`, children: [_jsx("div", { className: "font-semibold", children: r.job_name || "Job" }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Status: ", r.status] })] }, r.id)))] }), _jsx("div", { className: "md:col-span-2 border rounded p-4 min-h-[300px]", children: selected ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-xl font-semibold", children: selected.job_name }), _jsx("div", { children: selected.description }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "px-4 py-2 bg-green-600 text-white rounded", onClick: () => review("approved"), children: "Approve" }), _jsx("button", { className: "px-4 py-2 bg-red-600 text-white rounded", onClick: () => review("rejected"), children: "Reject" }), _jsx("button", { className: "px-4 py-2 border rounded", onClick: downloadPdf, children: "PDF" })] })] })) : (_jsx("div", { children: "Select a report" })) })] }));
}
