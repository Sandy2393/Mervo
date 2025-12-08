/**
 * Invoice Details
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import { formatCurrency } from '../../lib/currency';
import { Card, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function InvoiceDetails() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const { activeCompanyId } = useAuth();
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCompanyId || !instanceId) return;

    const load = async () => {
      setLoading(true);
      const res = await billingService.getInvoiceById(activeCompanyId, instanceId);
      if (res.success && res.data) setInvoice(res.data);
      setLoading(false);
    };

    load();
  }, [activeCompanyId, instanceId]);

  const handleDownloadCSV = () => {
    if (!invoice) return;
    // For now build CSV on client
    const rows = invoice.line_items.map((li: any) => `${li.id},${li.description},${li.qty},${li.unit_price_cents},${li.amount_cents}`);
    const csv = ['line_id,description,qty,unit_price_cents,amount_cents', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-6">Loading invoice...</div>;
  if (!invoice) return <div className="p-6">Invoice not found</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Invoice {invoice.invoice_number}</h2>
          <div className="text-sm text-gray-500">{invoice.period_start || '-'} — {invoice.period_end || '-'}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadCSV} className="bg-gray-600">Download CSV</Button>
          <Button onClick={() => alert('Export PDF - placeholder') } className="bg-blue-600">Export PDF</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((li: any) => (
                  <tr key={li.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{li.description}</td>
                    <td className="px-4 py-2">{li.qty}</td>
                    <td className="px-4 py-2">{(li.unit_price_cents/100).toFixed(2)}</td>
                    <td className="px-4 py-2">{formatCurrency(li.amount_cents/100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end space-y-2 flex-col items-end">
              <div className="text-sm">Subtotal: {formatCurrency((invoice.subtotal_cents || 0) / 100)}</div>
              <div className="text-sm">Tax: {formatCurrency((invoice.tax_cents || 0) / 100)}</div>
              <div className="text-lg font-bold">Total: {formatCurrency((invoice.total_cents || 0) / 100)}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="font-bold mb-2">Payment History</h3>
          {invoice.payment_history && invoice.payment_history.length > 0 ? (
            invoice.payment_history.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between py-2 border-b text-sm">
                <div>{p.processed_by || 'system'}</div>
                <div>{p.paid_at || p.timestamp || '-'}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No payment records</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
