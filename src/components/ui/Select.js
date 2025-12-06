import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Select Component — Dropdown select
 */
import React from 'react';
export const Select = React.forwardRef(({ label, options, error, placeholder, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsxs("select", { ref: ref, className: `
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `, ...props, children: [placeholder && (_jsx("option", { value: "", children: placeholder })), options.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] }), error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: error }))] }));
});
Select.displayName = 'Select';
