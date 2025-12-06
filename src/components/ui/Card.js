import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
const Card = React.forwardRef(({ className, header, footer, children, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("rounded-xl border bg-card text-card-foreground shadow", className), ...props, children: [header && _jsx("div", { className: "px-6 py-4 border-b", children: header }), _jsx("div", { className: cn(header || footer ? "p-6" : "p-6"), children: children }), footer && _jsx("div", { className: "px-6 py-4 border-t", children: footer })] })));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("font-semibold leading-none tracking-tight", className), ...props })));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("text-sm text-muted-foreground", className), ...props })));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("p-6 pt-0", className), ...props })));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex items-center p-6 pt-0", className), ...props })));
CardFooter.displayName = "CardFooter";
// Backward compatibility alias
const CardBody = CardContent;
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardBody };
