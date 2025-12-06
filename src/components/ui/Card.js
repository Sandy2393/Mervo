import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className = '', ...props }) => {
    return (_jsx("div", { className: `bg-white rounded-lg shadow p-6 ${className}`, ...props, children: children }));
};
export const CardHeader = ({ children, className = '', ...props }) => {
    return (_jsx("div", { className: `border-b pb-4 mb-4 ${className}`, ...props, children: children }));
};
export const CardBody = ({ children, className = '', ...props }) => {
    return (_jsx("div", { className: className, ...props, children: children }));
};
export const CardFooter = ({ children, className = '', ...props }) => {
    return (_jsx("div", { className: `border-t pt-4 mt-4 flex gap-2 ${className}`, ...props, children: children }));
};
