import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function RecurringSchedulerEditor({ value, onChange }) {
    const [days, setDays] = useState(value?.days || []);
    const [time, setTime] = useState(value?.time || "09:00");
    const toggleDay = (day) => {
        const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
        setDays(next);
        onChange({ ...value, days: next, time });
    };
    const updateTime = (t) => {
        setTime(t);
        onChange({ ...value, days, time: t });
    };
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex gap-2 flex-wrap", children: "SMTWTFS".split("").map((d) => (_jsx("button", { className: `px-3 py-2 border rounded ${days.includes(d) ? "bg-blue-600 text-white" : "bg-white"}`, onClick: () => toggleDay(d), type: "button", children: d }, d))) }), _jsxs("div", { children: [_jsx("label", { className: "text-sm text-gray-700", children: "Time" }), _jsx("input", { type: "time", className: "border rounded px-3 py-2", value: time, onChange: (e) => updateTime(e.target.value) })] })] }));
}
