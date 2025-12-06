
export interface CostPoint { date: string; cost: number; }
export interface CostChartProps { series: CostPoint[]; }

// Minimal SVG sparkline-style chart; replace with real chart lib if available.
export default function CostChart({ series }: CostChartProps) {
  if (!series || series.length === 0) return <p className="text-sm text-gray-600">No data available</p>;
  const max = Math.max(...series.map((p) => p.cost));
  const min = Math.min(...series.map((p) => p.cost));
  const range = max - min || 1;
  const points = series.map((p, i) => {
    const x = (i / Math.max(series.length - 1, 1)) * 100;
    const y = 100 - ((p.cost - min) / range) * 100;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-32 border rounded bg-white">
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}
