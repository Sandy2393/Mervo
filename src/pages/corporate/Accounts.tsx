/**
 * Corporate Accounts Page
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { financeService } from '../../services/financeService';
import { billingService } from '../../services/billingService';
import { Card, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { formatCurrency, centsToDecimal } from '../../lib/currency';
import { Link } from 'react-router-dom';

export default function Accounts() {
  const { activeCompanyId } = useAuth();
  const [company, setCompany] = useState<any | null>(null);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<any | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [range, setRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCompanyId) return;

    const load = async () => {
      setLoading(true);
      try {
        const comp = await companyService.getCompanyById(activeCompanyId);
        if (comp.success) setCompany(comp.data);

        const rev = await financeService.getRevenue(activeCompanyId, range);
        if (rev.success && rev.data) setRevenue(rev.data);

        const pending = await financeService.getPendingPayments(activeCompanyId);
        if (pending.success && pending.data) setPendingPayments(pending.data || []);

        const invoices = await billingService.listInvoices(activeCompanyId);
        if (invoices.success && invoices.data) setRecentInvoices(invoices.data.slice(0, 10));

        // Balance = total revenue - pending payouts total (cents)
        const totalRevenue = rev.success && rev.data ? rev.data.total_revenue_cents : 0;
        const totalPending = (pending.success && pending.data ? pending.data.reduce((s: any, p: any) => s + (p.amount_cents || 0), 0) : 0);
        setBalanceCents((totalRevenue || 0) - (totalPending || 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeCompanyId, range]);

  const handleRunPayroll = async () => {
    // Placeholder; should trigger server-side payout batch
    alert('Run Payroll is a placeholder — implement server-side payout via payments provider');
  };

  const handleExportCSV = async () => {
    if (!activeCompanyId) return;
    const res = await billingService.generateInvoiceCSV(activeCompanyId);
    if (res.success && res.data) {
      // For now show CSV in new tab
      const blob = new Blob([res.data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleGenerateMonthlyInvoices = async () => {
    // TODO: Implement server-side invoicing generation (createInvoice for each contractor/company)
    alert('Generate Monthly Invoices is a placeholder — implement server-side');
  };

  if (loading) return <div className="p-6">Loading accounts...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <div className="text-sm text-gray-500">{company?.name} — {company?.company_tag}</div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRunPayroll} className="bg-blue-600">Run Payroll</Button>
          <Button onClick={handleExportCSV} className="bg-gray-600">Export CSV</Button>
          <Button onClick={handleGenerateMonthlyInvoices} className="bg-green-600">Generate Monthly Invoices</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="text-sm text-gray-600">Current Balance</div>
            <div className="text-3xl font-bold mt-2">{formatCurrency(centsToDecimal(balanceCents || 0))}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Total Revenue ({range})</div>
                <div className="text-2xl font-bold mt-1">{revenue ? formatCurrency(revenue.total_revenue_cents / 100) : '-'}</div>
              </div>
              <div>
                <select value={range} onChange={(e) => setRange(e.target.value as any)} className="border rounded p-2 text-sm">
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm text-gray-600">Pending Contractor Payouts</div>
            <div className="mt-2">
              {pendingPayments.length === 0 ? (
                <div className="text-sm text-gray-500">No pending payouts</div>
              ) : (
                pendingPayments.map(p => (
                  <div key={p.contractor_alias} className="flex justify-between text-sm py-2 border-b">
                    <div>{p.contractor_alias}</div>
                    <div className="font-semibold">{formatCurrency((p.amount_cents || 0) / 100)}</div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold">Recent Invoices</div>
            <Link to="/corporate/invoices" className="text-sm text-blue-600">View all</Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-sm text-gray-500">No invoices yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Invoice #</th>
                    <th className="px-4 py-2 text-left">Period</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-blue-600"><Link to={`/corporate/invoices/${inv.id}`}>{inv.invoice_number}</Link></td>
                      <td className="px-4 py-2">{inv.period_start || '-'} — {inv.period_end || '-'}</td>
                      <td className="px-4 py-2">{formatCurrency((inv.total_cents || 0) / 100)}</td>
                      <td className="px-4 py-2 capitalize">{inv.status}</td>
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
