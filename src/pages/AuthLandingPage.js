import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
export default function AuthLandingPage() {
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-4", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardBody, { children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Mervo Ops" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Choose a login type" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Link, { to: "/login/corporate", children: _jsx(Button, { className: "w-full", children: "Corporate Login" }) }), _jsx(Link, { to: "/contractor/login", children: _jsx(Button, { variant: "secondary", className: "w-full", children: "Contractor Login" }) })] })] }) }) }));
}
