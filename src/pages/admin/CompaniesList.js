import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchCompanies, createCompany } from "../../services/admin/companyClient";
export default function CompaniesList() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", slug: "" });
    const [filter, setFilter] = useState("");
    useEffect(() => {
        fetchCompanies()
            .then(setCompanies)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    const filtered = companies.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));
    const submit = async () => {
        try {
            const created = await createCompany(form);
            setCompanies([created, ...companies]);
            setShowModal(false);
            setForm({ name: "", slug: "" });
        }
        catch (e) {
            setError(e.message);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-6", children: "Loading..." });
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Companies" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: () => setShowModal(true), children: "New Company" })] }), _jsx("div", { children: _jsx("input", { className: "border px-3 py-2 rounded w-full max-w-md", placeholder: "Filter companies", value: filter, onChange: (e) => setFilter(e.target.value) }) }), error && _jsx("div", { className: "text-red-600", children: error }), _jsx("div", { className: "grid gap-3", children: filtered.map((c) => (_jsxs("div", { className: "border rounded p-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: c.name }), _jsx("div", { className: "text-sm text-gray-600", children: c.slug })] }), _jsx("a", { className: "text-blue-600 underline", href: `/admin/companies/${c.id}`, children: "View" })] }, c.id))) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded shadow max-w-md w-full space-y-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Create Company" }), _jsx("input", { className: "border px-3 py-2 rounded w-full", placeholder: "Name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsx("input", { className: "border px-3 py-2 rounded w-full", placeholder: "Slug (optional)", value: form.slug, onChange: (e) => setForm({ ...form, slug: e.target.value }) }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { className: "px-4 py-2 border rounded", onClick: () => setShowModal(false), children: "Cancel" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: submit, children: "Create" })] })] }) }))] }));
}
