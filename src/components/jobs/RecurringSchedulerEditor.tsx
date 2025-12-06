import { useState } from "react";

export function RecurringSchedulerEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [days, setDays] = useState<string[]>(value?.days || []);
  const [time, setTime] = useState(value?.time || "09:00");

  const toggleDay = (day: string) => {
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setDays(next);
    onChange({ ...value, days: next, time });
  };

  const updateTime = (t: string) => {
    setTime(t);
    onChange({ ...value, days, time: t });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {"SMTWTFS".split("").map((d) => (
          <button
            key={d}
            className={`px-3 py-2 border rounded ${days.includes(d) ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => toggleDay(d)}
            type="button"
          >
            {d}
          </button>
        ))}
      </div>
      <div>
        <label className="text-sm text-gray-700">Time</label>
        <input type="time" className="border rounded px-3 py-2" value={time} onChange={(e) => updateTime(e.target.value)} />
      </div>
    </div>
  );
}
