/**
 * Corporate Dashboard
 * KPIs, activity log, financial snapshot, company switcher
 * Auto-refreshes every 30 seconds
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { auditService } from '../../services/auditService';
import { financeService, type RevenueData, type PaymentData } from '../../services/financeService';
import { Card, CardBody } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/currency';
import type { AuditLog } from '../../types';

export default function Dashboard() {
  const { activeCompanyId } = useAuth();

  // KPI state
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [jobsNeedingAssignment, setJobsNeedingAssignment] = useState(0);
  const [jobsLate, setJobsLate] = useState(0);
  const [contractorsClocked, setContractorsClocked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activity log
  const [activityLog, setActivityLog] = useState<AuditLog[]>([]);

  // Finance
  const [weekRevenue, setWeekRevenue] = useState<RevenueData | null>(null);
  const [monthRevenue, setMonthRevenue] = useState<RevenueData | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PaymentData[]>([]);

  // Refresh interval
  useEffect(() => {
    if (!activeCompanyId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load instances
        const instResult = await jobInstancesService.listInstancesFiltered(
          activeCompanyId,
          {}
        );

        if (instResult.success && instResult.data) {
          const instances = instResult.data as any[];

          // Active jobs today
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);

          const activeToday = instances.filter(
            (inst: any) =>
              inst.status === 'in_progress' &&
              new Date(inst.scheduled_for || '') >= todayStart &&
              new Date(inst.scheduled_for || '') < todayEnd
          );
          setActiveJobsCount(activeToday.length);

          // Jobs needing assignment
          const needAssignment = instances.filter(
            (inst: any) => inst.status === 'upcoming' && !inst.assigned_to
          );
          setJobsNeedingAssignment(needAssignment.length);

          // Jobs running late (completed_at > scheduled_for + 1 day)
          const late = instances.filter((inst: any) => {
            if (inst.status !== 'completed' || !inst.completed_at || !inst.scheduled_for) {
              return false;
            }
            const scheduled = new Date(inst.scheduled_for);
            const completed = new Date(inst.completed_at);
            const oneDay = 24 * 60 * 60 * 1000;
            return completed.getTime() - scheduled.getTime() > oneDay;
          });
          setJobsLate(late.length);

          // Count unique contractors clocked in
          const clockedIn = new Set<string>();
          instances.forEach((inst: any) => {
            if (inst.status === 'in_progress' && inst.assigned_to) {
              clockedIn.add(inst.assigned_to);
            }
          });
          setContractorsClocked(clockedIn.size);
        }

        // Activity log
        const auditResult = await auditService.listRecent(activeCompanyId, 20);
        if (auditResult.success && auditResult.data) {
          setActivityLog(auditResult.data);
        }

        // Financial data
        const weekRevenueResult = await financeService.getRevenue(activeCompanyId, 'week');
        if (weekRevenueResult.success && weekRevenueResult.data) {
          setWeekRevenue(weekRevenueResult.data);
        }

        const monthRevenueResult = await financeService.getRevenue(
          activeCompanyId,
          'month'
        );
        if (monthRevenueResult.success && monthRevenueResult.data) {
          setMonthRevenue(monthRevenueResult.data);
        }

        const paymentsResult = await financeService.getPendingPayments(activeCompanyId);
        if (paymentsResult.success && paymentsResult.data) {
          setPendingPayments(paymentsResult.data);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [activeCompanyId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-sm font-medium text-gray-600">Active Jobs Today</div>
            <div className="text-3xl font-bold mt-2">{activeJobsCount}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm font-medium text-gray-600">Needing Assignment</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{jobsNeedingAssignment}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm font-medium text-gray-600">Running Late</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{jobsLate}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm font-medium text-gray-600">Clocked In Now</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{contractorsClocked}</div>
          </CardBody>
        </Card>
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardBody className="space-y-3">
            <h3 className="font-bold text-lg">This Week</h3>
            {weekRevenue && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold">{formatCurrency((weekRevenue.total_revenue_cents || 0) / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Completed:</span>
                  <span className="font-semibold">{weekRevenue.job_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average per Job:</span>
                  <span className="font-semibold">{formatCurrency((weekRevenue.average_per_job_cents || 0) / 100)}</span>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h3 className="font-bold text-lg">This Month</h3>
            {monthRevenue && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold">{formatCurrency((monthRevenue.total_revenue_cents || 0) / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Completed:</span>
                  <span className="font-semibold">{monthRevenue.job_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average per Job:</span>
                  <span className="font-semibold">{formatCurrency((monthRevenue.average_per_job_cents || 0) / 100)}</span>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardBody className="space-y-3">
          <h3 className="font-bold text-lg">Recent Activity</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {activityLog.length === 0 ? (
              <div className="text-gray-500 text-sm">No recent activity</div>
            ) : (
              activityLog.map(log => (
                  <div className="flex justify-between items-start text-sm py-2 border-b">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-gray-600 text-xs">{String(log.target)}</div>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardBody className="space-y-3">
            <h3 className="font-bold text-lg">Pending Contractor Payments</h3>
            <div className="space-y-2">
              {pendingPayments.map(payment => (
                <div key={payment.contractor_alias} className="flex justify-between items-center text-sm py-2 border-b">
                  <div>
                    <div className="font-medium">{payment.contractor_alias}</div>
                    <div className="text-gray-600 text-xs">{payment.job_count} job(s)</div>
                  </div>
                  <div className="font-semibold">{formatCurrency((payment.amount_cents || 0) / 100)}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
