import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { frontPaymentsService } from "../../services/frontPaymentsService";
export default function PayoutBatchCreate() {
    const [scheduledAt, setScheduledAt] = useState("");
    const [lines, setLines] = useState([]);
    const [contractorId, setContractorId] = useState("");
    const [amountCents, setAmountCents] = useState(0);
    const currency = "USD";
    const addLine = () => {
        if (!contractorId || amountCents <= 0)
            return;
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
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: "Create Payout Batch" }), _jsxs("label", { children: ["Scheduled Date:", _jsx("input", { value: scheduledAt, onChange: (e) => setScheduledAt(e.target.value), placeholder: "YYYY-MM-DD" })] }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("input", { placeholder: "Contractor ID", value: contractorId, onChange: (e) => setContractorId(e.target.value), style: { marginRight: 8 } }), _jsx("input", { placeholder: "Amount cents", type: "number", value: amountCents, onChange: (e) => setAmountCents(parseInt(e.target.value, 10) || 0), style: { marginRight: 8 } }), _jsx("button", { onClick: addLine, children: "Add" })] }), _jsxs("div", { style: { marginTop: 12 }, children: ["Total: ", total, " cents"] }), _jsx("pre", { children: JSON.stringify(lines, null, 2) }), _jsx("button", { onClick: submit, children: "Submit for approval" })] }));
}
