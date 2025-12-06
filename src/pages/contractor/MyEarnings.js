import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timesheetService } from '../../services/timesheetService';
import { Card, CardBody } from '../../components/ui/Card';
export default function MyEarnings() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        const load = async () => {
            setLoading(true);
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 30);
            const res = await timesheetService.getEarningsSummary(user.id, start, end);
            if (res.success && res.data) {
                setSummary(res.data);
            }
            setLoading(false);
        };
        load();
    }, [user]);
    if (loading) {
        return _jsx("div", { className: "text-center py-8", children: "Loading earnings..." });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "My Earnings" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Summary of recent earnings" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Earnings" }), _jsxs("div", { className: "text-2xl font-bold mt-2", children: ["$", (0).toFixed(2)] })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Hours" }), _jsxs("div", { className: "text-2xl font-bold mt-2", children: [(summary?.total_hours || 0).toFixed(2), " hrs"] })] }) })] })] }));
}
