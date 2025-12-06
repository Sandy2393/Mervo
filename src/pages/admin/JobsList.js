import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function JobsList() {
    const [jobs, setJobs] = useState([]);
    useEffect(() => {
        fetch("/api/jobs").then((r) => r.json()).then(setJobs);
    }, []);
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Jobs" }), _jsx("a", { className: "px-4 py-2 bg-blue-600 text-white rounded", href: "/admin/jobs/new", children: "New Job" })] }), _jsx("div", { className: "grid gap-3", children: jobs.map((j) => (_jsxs("div", { className: "border rounded p-4 flex justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: j.name }), _jsx("div", { className: "text-sm text-gray-600", children: j.status })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("a", { className: "text-blue-600 underline", href: `/admin/jobs/${j.id}`, children: "Edit" }), _jsx("button", { className: "px-3 py-1 border rounded", onClick: () => fetch(`/api/jobs/${j.id}/publish`, { method: "POST" }), children: "Publish" })] })] }, j.id))) })] }));
}
