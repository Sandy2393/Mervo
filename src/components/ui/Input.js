import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Input Component — Text input with validation support
 */
import React from 'react';
export const Input = React.forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsx("input", { ref: ref, className: `
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `, ...props }), error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: error })), helperText && !error && (_jsx("p", { className: "text-gray-500 text-sm mt-1", children: helperText }))] }));
});
Input.displayName = 'Input';
