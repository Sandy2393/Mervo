import { useEffect, useState } from "react";
import { frontPaymentsService } from "../../services/frontPaymentsService";

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
}

interface Payout {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
}

interface Dispute {
  id: string;
  status: string;
  amount_cents: number;
}

const formatMoney = (cents: number, currency: string) => `${currency} ${(cents / 100).toFixed(2)}`;

export default function PaymentsDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [balanceCents, setBalanceCents] = useState(0);

  useEffect(() => {
    // TODO: company context
    frontPaymentsService.listPayments("company-placeholder").then((res) => {
      setPayments(res.payments || []);
      setPayouts(res.payouts || []);
      setDisputes(res.disputes || []);
      const paid = (res.payments || []).reduce((sum: number, p: Payment) => sum + p.amount_cents, 0);
      const owed = (res.payouts || []).reduce((sum: number, p: Payout) => sum + p.amount_cents, 0);
      setBalanceCents(paid - owed);
    });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Payments & Payouts</h1>
      <div>Current balance: {formatMoney(balanceCents, "USD")}</div>
      <div style={{ marginTop: 16 }}>
        <button>Create Payout Batch</button>
        <button style={{ marginLeft: 8 }}>Run Reconciliation</button>
        <button style={{ marginLeft: 8 }}>Export CSV</button>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2>Recent Payments</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{formatMoney(p.amount_cents, p.currency)}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Pending Payouts</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{formatMoney(p.amount_cents, p.currency)}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Disputes</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{formatMoney(d.amount_cents, "USD")}</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
