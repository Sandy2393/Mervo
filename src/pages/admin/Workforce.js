import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { listWorkforce, inviteUser, importCsvPreview, importCsvCommit } from "../../services/admin/workforceClient";
import { UserCard } from "../../components/workforce/UserCard";
import InviteModal from "./InviteModal";
import CsvImportPreview from "./CsvImportPreview";
export default function Workforce({ companyId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showInvite, setShowInvite] = useState(false);
    const [showCsv, setShowCsv] = useState(false);
    useEffect(() => {
        listWorkforce(companyId)
            .then(setUsers)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [companyId]);
    const filtered = users.filter((u) => {
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        const matchesSearch = (u.company_alias || "").includes(search.toLowerCase()) || (u.email || "").includes(search.toLowerCase());
        return matchesRole && matchesSearch;
    });
    if (loading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-3 items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "border px-3 py-2 rounded", placeholder: "Search workforce", value: search, onChange: (e) => setSearch(e.target.value) }), _jsxs("select", { className: "border px-3 py-2 rounded", value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All roles" }), _jsx("option", { value: "owner", children: "Owners" }), _jsx("option", { value: "admin", children: "Admins" }), _jsx("option", { value: "manager", children: "Managers" }), _jsx("option", { value: "employee", children: "Employees" }), _jsx("option", { value: "contractor", children: "Contractors" }), _jsx("option", { value: "viewer", children: "Viewers" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "px-3 py-2 border rounded", onClick: () => setShowCsv(true), children: "Import CSV" }), _jsx("a", { className: "px-3 py-2 border rounded", href: `/api/companies/${companyId}/workforce?format=csv`, children: "Export CSV" }), _jsx("button", { className: "px-3 py-2 bg-blue-600 text-white rounded", onClick: () => setShowInvite(true), children: "Send Invite" })] })] }), error && _jsx("div", { className: "text-red-600", children: error }), _jsx("div", { className: "grid md:grid-cols-2 gap-3", children: filtered.map((u) => (_jsx(UserCard, { name: u.company_alias, email: u.email, role: u.role, status: u.status }, u.id))) }), showInvite && (_jsx(InviteModal, { onClose: () => setShowInvite(false), onSubmit: async (payload) => {
                    await inviteUser({ ...payload, company_id: companyId });
                    setShowInvite(false);
                } })), showCsv && (_jsx(CsvImportPreview, { onClose: () => setShowCsv(false), onPreview: (file) => importCsvPreview(companyId, file), onCommit: (file) => importCsvCommit(companyId, file) }))] }));
}
