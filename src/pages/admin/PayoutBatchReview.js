import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { frontPaymentsService } from "../../services/frontPaymentsService";
export default function PayoutBatchReview() {
    const [batchId, setBatchId] = useState("");
    const [confirm, setConfirm] = useState(false);
    const [result, setResult] = useState(null);
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
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: "Payout Batch Review" }), _jsx("input", { placeholder: "Batch ID", value: batchId, onChange: (e) => setBatchId(e.target.value) }), _jsxs("div", { children: [_jsx("button", { onClick: approve, children: "Approve" }), _jsxs("label", { style: { marginLeft: 12 }, children: [_jsx("input", { type: "checkbox", checked: confirm, onChange: (e) => setConfirm(e.target.checked) }), " Confirm live payouts"] }), _jsx("button", { style: { marginLeft: 8 }, onClick: process, children: "Run Process" })] }), result && (_jsxs("div", { style: { marginTop: 12 }, children: [_jsx("h3", { children: "Result" }), _jsx("pre", { children: JSON.stringify(result, null, 2) })] }))] }));
}
