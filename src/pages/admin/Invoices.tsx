import { useEffect, useState } from "react";

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "open" | "void">("all");

  useEffect(() => {
    // TODO: Fetch from /api/billing/invoices
    const mockInvoices: Invoice[] = [
      {
        id: "in_001",
        number: "INV-2024-12-001",
        status: "paid",
        amount_due: 9900,
        amount_paid: 9900,
        currency: "USD",
        created: Date.now() - 15 * 24 * 60 * 60 * 1000,
        hosted_invoice_url: "https://invoice.stripe.com/placeholder",
        invoice_pdf: "https://invoice.stripe.com/placeholder.pdf",
      },
      {
        id: "in_002",
        number: "INV-2024-11-001",
        status: "paid",
        amount_due: 9900,
        amount_paid: 9900,
        currency: "USD",
        created: Date.now() - 45 * 24 * 60 * 60 * 1000,
        hosted_invoice_url: "https://invoice.stripe.com/placeholder",
        invoice_pdf: "https://invoice.stripe.com/placeholder.pdf",
      },
      {
        id: "in_003",
        number: "INV-2024-10-001",
        status: "paid",
        amount_due: 9900,
        amount_paid: 9900,
        currency: "USD",
        created: Date.now() - 75 * 24 * 60 * 60 * 1000,
        hosted_invoice_url: "https://invoice.stripe.com/placeholder",
        invoice_pdf: "https://invoice.stripe.com/placeholder.pdf",
      },
    ];

    setInvoices(mockInvoices);
    setLoading(false);
  }, []);

  const formatMoney = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const filteredInvoices = invoices.filter((inv) => filter === "all" || inv.status === filter);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded ${filter === "paid" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-4 py-2 rounded ${filter === "open" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Open
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.created)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatMoney(invoice.amount_due, invoice.currency)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {invoice.hosted_invoice_url && (
                    <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      View
                    </a>
                  )}
                  {invoice.invoice_pdf && (
                    <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      Download PDF
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-gray-500">No invoices found for the selected filter.</div>
        )}
      </div>
    </div>
  );
}
