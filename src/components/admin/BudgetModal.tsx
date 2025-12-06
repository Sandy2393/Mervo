import { useState } from "react";
import { setBudget, getBudget } from "../../services/budgetService";

interface BudgetModalProps { triggerLabel?: string; }

export default function BudgetModal({ triggerLabel = "Set budget" }: BudgetModalProps) {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("company-1");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState(1000);
  const [message, setMessage] = useState("");

  const save = async () => {
    await setBudget(companyId, currency, amount);
    const budget = await getBudget(companyId);
    setMessage(`Saved budget: ${budget?.monthlyAmount || amount} ${budget?.currency || currency}`);
    setOpen(false);
  };

  return (
    <>
      <button className="px-3 py-1 border rounded" onClick={() => setOpen(true)}>{triggerLabel}</button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow w-80 space-y-3">
            <h3 className="font-semibold">Set Monthly Budget</h3>
            <label className="text-sm flex flex-col">
              Company ID
              <input className="border p-1" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
            </label>
            <label className="text-sm flex flex-col">
              Currency
              <input className="border p-1" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </label>
            <label className="text-sm flex flex-col">
              Amount (monthly)
              <input type="number" className="border p-1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </label>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 border rounded" onClick={() => setOpen(false)}>Cancel</button>
              <button className="px-3 py-1 border rounded bg-blue-600 text-white" onClick={() => void save()}>Save</button>
            </div>
            {message && <p className="text-xs text-green-700">{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}
