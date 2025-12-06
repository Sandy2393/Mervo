import { useState } from "react";
import { frontPaymentsService } from "../../services/frontPaymentsService";

export default function PayoutBatchReview() {
  const [batchId, setBatchId] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<any>(null);

  const approve = async () => {
    await frontPaymentsService.approveBatch({ batch_id: batchId, approverId: "approver-placeholder" });
    alert("Approved");
  };

  const process = async () => {
    const res = await fetch(`/api/payments/payout-batches/${batchId}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const json = await res.json();
    setResult(json);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Payout Batch Review</h1>
      <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
      <div>
        <button onClick={approve}>Approve</button>
        <label style={{ marginLeft: 12 }}>
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> Confirm live payouts
        </label>
        <button style={{ marginLeft: 8 }} onClick={process}>
          Run Process
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
