import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function UserCard({ name, email, role, status, onClick }) {
    return (_jsxs("button", { onClick: onClick, className: "w-full text-left border rounded-lg p-4 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: name }), email && _jsx("div", { className: "text-sm text-gray-600", children: email })] }), _jsx("div", { className: "text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 uppercase", children: role })] }), status && _jsx("div", { className: "mt-2 text-xs text-gray-500", children: status })] }));
}
