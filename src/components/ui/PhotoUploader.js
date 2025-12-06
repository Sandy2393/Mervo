import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TimePicker = ({ label, value, onChange, error }) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsx("input", { type: "time", value: value || '', onChange: (e) => onChange(e.target.value), className: `
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-orange-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        ` }), error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: error }))] }));
};
