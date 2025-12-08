import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobsService';
import { jobInstancesService } from '../../services/jobInstancesService';
import { financeService } from '../../services/financeService';
import { companyUserService } from '../../services/companyUserService';
import { Card, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import PermissionsAwareButton from '../../components/PermissionsAwareButton';
import CompanySelector from '../../components/selectors/CompanySelector';
import Toast from '../../components/ui/toast';

export default function JobsOverview() {
  const { activeCompanyId } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [contractorsCount, setContractorsCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<string>(() => localStorage.getItem('jobs_filter') || 'all');

  useEffect(() => {
    if (!activeCompanyId) return;
    (async () => {
      try {
        const jobsRes = await jobsService.listJobsByCompany(activeCompanyId);
        if (jobsRes.success) setJobs(jobsRes.data || []);

        const instancesRes = await jobInstancesService.listInstancesFiltered(activeCompanyId, { start_date: new Date().toISOString(), recurring_only: false });
        if (instancesRes.success) setInstances(instancesRes.data || []);

        const rev = await financeService.getRevenue(activeCompanyId, 'week');
        if (rev.success) setRevenue(Math.round((rev.data?.total_revenue_cents || 0) / 100));

        const contractors = await companyUserService.listCompanyUsers(activeCompanyId, { role: 'contractor', status: 'active' });
        if (contractors.success) setContractorsCount(contractors.data?.length || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      }
    })();
  }, [activeCompanyId]);

  const activeJobsToday = useMemo(() => instances.filter(i => new Date(i.scheduled_for).toDateString() === new Date().toDateString()).length, [instances]);
  const upcomingJobs = useMemo(() => instances.filter(i => new Date(i.scheduled_for) > new Date()).length, [instances]);
  const overdueJobs = useMemo(() => instances.filter(i => new Date(i.scheduled_for) < new Date() && i.status !== 'completed').length, [instances]);

  const saveFilter = (f: string) => {
    localStorage.setItem('jobs_filter', f);
    setFilter(f);
  };

  if (!activeCompanyId) return <div className="p-4">Select a company</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <CompanySelector />
          <h1 className="text-2xl font-bold">Jobs Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <PermissionsAwareButton onClick={() => window.location.assign('/corporate/jobs/create')}>Create Job</PermissionsAwareButton>
        </div>
      </div>

      {error && <Toast message={error} type="error" />}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <div className="text-sm text-gray-500">Active Jobs Today</div>
            <div className="text-2xl font-semibold">{activeJobsToday}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-gray-500">Upcoming Jobs</div>
            <div className="text-2xl font-semibold">{upcomingJobs}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-gray-500">Overdue Jobs</div>
            <div className="text-2xl font-semibold">{overdueJobs}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-gray-500">Contractors Active</div>
            <div className="text-2xl font-semibold">{contractorsCount}</div>
            <div className="text-sm text-gray-500 mt-1">Revenue (week): ${revenue ?? '—'}</div>
          </CardBody>
        </Card>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Button onClick={() => saveFilter('all')} className={filter === 'all' ? 'font-semibold' : ''}>All</Button>
        <Button onClick={() => saveFilter('active')} className={filter === 'active' ? 'font-semibold' : ''}>Active</Button>
        <Button onClick={() => saveFilter('upcoming')} className={filter === 'upcoming' ? 'font-semibold' : ''}>Upcoming</Button>
        <Button onClick={() => saveFilter('overdue')} className={filter === 'overdue' ? 'font-semibold' : ''}>Overdue</Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Jobs</h2>
        <div className="space-y-3">
          {jobs.filter(j => {
            if (filter === 'all') return true;
            if (filter === 'active') return j.status === 'active';
            if (filter === 'upcoming') return j.status === 'active' && j.recurring === true;
            if (filter === 'overdue') return false; // overdue logic uses instances
            return true;
          }).map(j => (
            <Card key={j.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{j.job_name}</div>
                    <div className="text-sm text-gray-500">{j.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{j.priority}</div>
                    <div className="mt-2 flex gap-2">
                      <Button onClick={() => window.location.assign(`/corporate/jobs/${j.id}`)}>View</Button>
                      <PermissionsAwareButton onClick={() => window.location.assign(`/corporate/jobs/${j.id}/edit`)}>Edit</PermissionsAwareButton>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
