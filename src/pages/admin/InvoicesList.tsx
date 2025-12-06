
const mockInvoices = [
  { id: "inv_1", number: "2024-001", status: "draft", total_cents: 120000 },
  { id: "inv_2", number: "2024-002", status: "paid", total_cents: 9900 },
];

export default function InvoicesList() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Invoices</h1>
      <button>Issue Invoice</button>
      <button style={{ marginLeft: 8 }}>Download CSV</button>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Number</th>
            <th>Status</th>
            <th>Total (cents)</th>
          </tr>
        </thead>
        <tbody>
          {mockInvoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.number}</td>
              <td>{inv.status}</td>
              <td>{inv.total_cents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
