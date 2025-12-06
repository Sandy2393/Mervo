import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchMonitorStats } from "../../services/monitorService";
import { toggleFlag } from "../../services/flagsService";
export default function FlagsMonitor() {
    const [stats, setStats] = useState([]);
    const load = async () => {
        const data = await fetchMonitorStats();
        setStats(data);
    };
    useEffect(() => {
        load();
    }, []);
    const kill = async (flagKey) => {
        const first = window.confirm(`Kill flag ${flagKey}? This sets rollout to 0 and disables.`);
        if (!first)
            return;
        const second = window.confirm("Are you sure? This is a kill switch.");
        if (!second)
            return;
        await toggleFlag(flagKey, false);
        load();
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { children: "Flags Monitor" }), stats.map((stat) => (_jsxs("div", { style: { border: "1px solid #e5e7eb", padding: 12, marginBottom: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h4", { children: stat.flagKey }), _jsx("button", { style: { background: "#dc2626", color: "white" }, onClick: () => kill(stat.flagKey), children: "Kill Switch" })] }), _jsxs("table", { style: { width: "100%", marginTop: 8 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Variant" }), _jsx("th", { children: "Users" }), _jsx("th", { children: "Conversions" })] }) }), _jsx("tbody", { children: stat.variants.map((v) => (_jsxs("tr", { children: [_jsx("td", { children: v.key }), _jsx("td", { children: v.users }), _jsx("td", { children: v.conversions })] }, v.key))) })] })] }, stat.flagKey)))] }));
}
