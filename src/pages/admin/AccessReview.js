import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const placeholderUsers = [
    {
        user_account_id: "u-1",
        email: "admin@example.com",
        company_id: "company-1",
        role: "admin",
        last_login: new Date().toISOString(),
        active: true,
    },
    {
        user_account_id: "u-2",
        email: "ops@example.com",
        company_id: "company-1",
        role: "ops",
        last_login: new Date(Date.now() - 86400000).toISOString(),
        active: true,
    },
];
export default function AccessReview() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        // TODO: Fetch from backend listing company_users with roles/last_login
        setUsers(placeholderUsers);
    }, []);
    const toggleReviewed = (id) => {
        setUsers((prev) => prev.map((u) => (u.user_account_id === id ? { ...u, reviewed: !u.reviewed } : u)));
    };
    const markRecertified = () => {
        // TODO: send recertification event to backend and audit logs
        alert("Recertified (placeholder)");
    };
    const exportCsv = () => {
        const header = "user_account_id,email,company_id,role,last_login,active,reviewed\n";
        const rows = users
            .map((u) => `${u.user_account_id},${u.email},${u.company_id},${u.role},${u.last_login},${u.active},${!!u.reviewed}`)
            .join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `access_review_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Access Review" }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { className: "px-3 py-1 border rounded", onClick: exportCsv, children: "Export CSV" }), _jsx("button", { className: "px-3 py-1 border rounded", onClick: markRecertified, children: "Mark Recertified" })] })] }), _jsxs("table", { className: "min-w-full text-sm border", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "p-2 text-left", children: "User" }), _jsx("th", { className: "p-2 text-left", children: "Company" }), _jsx("th", { className: "p-2 text-left", children: "Role" }), _jsx("th", { className: "p-2 text-left", children: "Last Login" }), _jsx("th", { className: "p-2 text-left", children: "Active" }), _jsx("th", { className: "p-2 text-left", children: "Reviewed" })] }) }), _jsxs("tbody", { children: [users.map((u) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2", children: u.email }), _jsx("td", { className: "p-2", children: u.company_id }), _jsx("td", { className: "p-2", children: u.role }), _jsx("td", { className: "p-2", children: u.last_login }), _jsx("td", { className: "p-2", children: u.active ? "Yes" : "No" }), _jsx("td", { className: "p-2", children: _jsx("input", { type: "checkbox", checked: !!u.reviewed, onChange: () => toggleReviewed(u.user_account_id) }) })] }, u.user_account_id))), users.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "p-2", colSpan: 6, children: "No users found." }) }))] })] })] }));
}
