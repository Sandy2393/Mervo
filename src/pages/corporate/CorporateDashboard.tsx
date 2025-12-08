/**
 * Corporate Dashboard — Main dashboard for owners/managers
 * Shows job stats, recent jobs, contractor activity
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Job } from '../../types';
import { jobsService } from '../../services/jobsService';
import { Link } from 'react-router-dom';

export default function CorporateDashboard() {
  const { activeCompanyId, companyUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompanyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active jobs
        const jobsResult = await jobsService.listJobsByCompany(activeCompanyId, {
          status: 'active'
        });

        if (jobsResult.success) {
          setJobs(jobsResult.data || []);
        }

        // Fetch recent job instances
        // TODO: Implement service method for recent instances
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCompanyId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {companyUser?.company_alias}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{activeJobs}</div>
            <p className="text-gray-600 mt-2">Active Jobs</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">{draftJobs}</div>
            <p className="text-gray-600 mt-2">Draft Jobs</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">
              {jobs.length}
            </div>
            <p className="text-gray-600 mt-2">Total Jobs</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to="/corporate/jobs/create">
          <Button>Create Job</Button>
        </Link>
        <Link to="/corporate/contractors">
          <Button variant="secondary">Manage Contractors</Button>
        </Link>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Recent Jobs</h2>
        </CardHeader>
        <CardBody>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs yet. Create your first job to get started.</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div
                  key={job.id}
                  className="border-l-4 border-orange-500 pl-4 py-2"
                >
                  <h3 className="font-medium text-gray-900">{job.job_name}</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold">{job.status}</span>
                  </p>
                  {job.description && (
                    <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
