import { jsx as _jsx } from "react/jsx-runtime";
export const Toast = ({ message, type = 'info' }) => {
    const bg = type === 'error' ? 'bg-red-100 text-red-800' : type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800';
    return (_jsx("div", { role: "alert", "aria-live": "polite", className: `${bg} px-3 py-2 rounded shadow-sm`, children: message }));
};
export default Toast;
