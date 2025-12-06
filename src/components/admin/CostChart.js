import { jsx as _jsx } from "react/jsx-runtime";
// Minimal SVG sparkline-style chart; replace with real chart lib if available.
export default function CostChart({ series }) {
    if (!series || series.length === 0)
        return _jsx("p", { className: "text-sm text-gray-600", children: "No data available" });
    const max = Math.max(...series.map((p) => p.cost));
    const min = Math.min(...series.map((p) => p.cost));
    const range = max - min || 1;
    const points = series.map((p, i) => {
        const x = (i / Math.max(series.length - 1, 1)) * 100;
        const y = 100 - ((p.cost - min) / range) * 100;
        return `${x},${y}`;
    });
    return (_jsx("svg", { viewBox: "0 0 100 100", className: "w-full h-32 border rounded bg-white", children: _jsx("polyline", { fill: "none", stroke: "#2563eb", strokeWidth: "2", points: points.join(" ") }) }));
}
