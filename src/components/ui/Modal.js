import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './button';
export const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg max-w-md w-full mx-4", children: [title && (_jsx("div", { className: "border-b px-6 py-4", children: _jsx("h2", { className: "text-lg font-semibold", children: title }) })), _jsx("div", { className: "px-6 py-4", children: children }), _jsxs("div", { className: "border-t px-6 py-4 flex gap-3 justify-end", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: cancelText }), onConfirm && (_jsx(Button, { variant: isDangerous ? 'danger' : 'primary', onClick: onConfirm, children: confirmText }))] })] }) }));
};
