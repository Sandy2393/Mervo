import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timesheetService } from '../../services/timesheetService';
import { Card, CardBody } from '../../components/ui/Card';
export default function TimesheetsPage() {
    const { user } = useAuth();
    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        const load = async () => {
            setLoading(true);
            const res = await timesheetService.listUserTimesheets(user.id);
            if (res.success && res.data)
                setTimesheets(res.data);
            setLoading(false);
        };
        load();
    }, [user]);
    if (loading)
        return _jsx("div", { className: "text-center py-8", children: "Loading timesheets..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Timesheets" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Your clock-in / clock-out history" })] }), _jsx(Card, { children: _jsx(CardBody, { children: timesheets.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No timesheets found." })) : (_jsx("div", { className: "space-y-2", children: timesheets.map(ts => (_jsxs("div", { className: "border rounded p-3", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Job Instance: ", ts.job_instance_id] }), _jsxs("div", { className: "text-sm", children: ["In: ", ts.clock_in || '-'] }), _jsxs("div", { className: "text-sm", children: ["Out: ", ts.clock_out || '-'] })] }, ts.id))) })) }) })] }));
}
