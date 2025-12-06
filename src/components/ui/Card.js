import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
export const Card = ({ children, className = "", header, footer, ...props }) => {
    return (_jsxs("div", { className: clsx("bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-soft", className), ...props, children: [header && _jsx("div", { className: "px-4 py-3 border-b border-[var(--color-border)]", children: header }), _jsx("div", { className: "px-4 py-4", children: children }), footer && _jsx("div", { className: "px-4 py-3 border-t border-[var(--color-border)]", children: footer })] }));
};
export const CardHeader = ({ children, className = "", ...props }) => (_jsx("div", { className: clsx("border-b pb-4 mb-4", className), ...props, children: children }));
export const CardBody = ({ children, className = "", ...props }) => (_jsx("div", { className: className, ...props, children: children }));
export const CardFooter = ({ children, className = "", ...props }) => (_jsx("div", { className: clsx("border-t pt-4 mt-4 flex gap-2", className), ...props, children: children }));
export default Card;
