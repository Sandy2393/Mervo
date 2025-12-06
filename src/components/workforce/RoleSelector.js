import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const permissions = {
    owner: ["manage billing", "manage roles", "edit settings"],
    admin: ["manage users", "manage roles", "view billing"],
    manager: ["edit users", "view billing"],
    employee: ["view own", "view team"],
    contractor: ["view own"],
    viewer: ["view only"],
};
export function RoleSelector({ value, onChange }) {
    const roles = ["owner", "admin", "manager", "employee", "contractor", "viewer"];
    return (_jsx("div", { className: "space-y-2", children: roles.map((role) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "role", value: role, checked: value === role, onChange: () => onChange(role) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium capitalize", children: role }), _jsx("div", { className: "text-xs text-gray-600", children: permissions[role].join(", ") })] })] }, role))) }));
}
