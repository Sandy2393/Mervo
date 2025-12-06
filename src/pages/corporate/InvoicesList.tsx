/**
 * Invoices List
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/currency';
import { Link } from 'react-router-dom';

export default function InvoicesList() {
  const { activeCompanyId } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!activeCompanyId) return;

    const load = async () => {
      setLoading(true);
      const res = await billingService.listInvoices(activeCompanyId, statusFilter ? { status: statusFilter } : undefined);
      if (res.success && res.data) setInvoices(res.data);
      setLoading(false);
    };

    load();
  }, [activeCompanyId, statusFilter]);

  const handleDownloadCSV = async () => {
    if (!activeCompanyId) return;
    const res = await billingService.generateInvoiceCSV(activeCompanyId);
    if (res.success && res.data) {
      const blob = new Blob([res.data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleMarkPaid = async (invId: string) => {
    if (!activeCompanyId) return;
    await billingService.markInvoicePaid(activeCompanyId, invId, { processed_by: 'cli', paid_at: new Date().toISOString() });
    // Refresh
    const res = await billingService.listInvoices(activeCompanyId, statusFilter ? { status: statusFilter } : undefined);
    if (res.success && res.data) setInvoices(res.data);
  };

  if (loading) return <div className="p-6">Loading invoices...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadCSV} className="bg-gray-600">Export CSV</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex gap-2 items-center mb-3">
            <label className="text-sm text-gray-600">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
              <option value="">All</option>
              <option value="issued">Issued</option>
              <option value="paid">Paid</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {invoices.length === 0 ? (
            <div className="text-sm text-gray-500">No invoices found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Invoice #</th>
                    <th className="px-4 py-2 text-left">Period</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2"><Link to={`/corporate/invoices/${inv.id}`}>{inv.invoice_number}</Link></td>
                      <td className="px-4 py-2">{inv.period_start || '-'} — {inv.period_end || '-'}</td>
                      <td className="px-4 py-2">{formatCurrency((inv.total_cents || 0) / 100)}</td>
                      <td className="px-4 py-2 capitalize">{inv.status}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Link to={`/corporate/invoices/${inv.id}`} className="text-sm text-blue-600">View</Link>
                          <button onClick={() => handleMarkPaid(inv.id)} className="text-sm text-green-600">Mark Paid</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
