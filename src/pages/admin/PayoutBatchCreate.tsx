import { useState } from "react";
import { frontPaymentsService } from "../../services/frontPaymentsService";

interface Line {
  contractor_id: string;
  amount_cents: number;
  currency: string;
}

export default function PayoutBatchCreate() {
  const [scheduledAt, setScheduledAt] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [contractorId, setContractorId] = useState("");
  const [amountCents, setAmountCents] = useState(0);
  const currency = "USD";

  const addLine = () => {
    if (!contractorId || amountCents <= 0) return;
    setLines([...lines, { contractor_id: contractorId, amount_cents: amountCents, currency }]);
    setContractorId("");
    setAmountCents(0);
  };

  const total = lines.reduce((sum, l) => sum + l.amount_cents, 0);

  const submit = async () => {
    const batch = await frontPaymentsService.createPayoutBatch({
      company_id: "company-placeholder",
      scheduled_at: scheduledAt,
      created_by: "user-placeholder",
    });
    for (const line of lines) {
      await frontPaymentsService.addPayoutLine({ batch_id: batch.id, ...line });
    }
    alert("Batch created");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Create Payout Batch</h1>
      <label>
        Scheduled Date:
        <input value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} placeholder="YYYY-MM-DD" />
      </label>
      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Contractor ID"
          value={contractorId}
          onChange={(e) => setContractorId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Amount cents"
          type="number"
          value={amountCents}
          onChange={(e) => setAmountCents(parseInt(e.target.value, 10) || 0)}
          style={{ marginRight: 8 }}
        />
        <button onClick={addLine}>Add</button>
      </div>
      <div style={{ marginTop: 12 }}>Total: {total} cents</div>
      <pre>{JSON.stringify(lines, null, 2)}</pre>
      <button onClick={submit}>Submit for approval</button>
    </div>
  );
}
