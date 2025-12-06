import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Button Component — Reusable button with variants
 */
import React from 'react';
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
    return (_jsx("button", { ref: ref, className: classes, disabled: disabled || isLoading, ...props, children: isLoading ? '...' : children }));
});
Button.displayName = 'Button';
