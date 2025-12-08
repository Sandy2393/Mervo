/**
 * Contractor Today Dashboard — Shows contractor's jobs for today
 * Main interface for contractors to see assigned work
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { JobInstance, Job } from '../../types';
import { jobsService } from '../../services/jobsService';
import { Link } from 'react-router-dom';

export default function ContractorTodayDashboard() {
  const { activeCompanyId, user } = useAuth();
  const [todayJobs, setTodayJobs] = useState<(JobInstance & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompanyId || !user) return;

    const fetchTodayJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await jobsService.listTodayJobInstances(activeCompanyId, user.id);

        if (result.success) {
          setTodayJobs(result.data || []);
        } else {
          setError(result.error || 'Failed to load jobs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayJobs();
  }, [activeCompanyId, user]);

  const completedCount = todayJobs.filter(j => j.status === 'completed').length;
  const inProgressCount = todayJobs.filter(j => j.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading today's jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Today's Jobs</h1>
        <p className="text-gray-600 mt-2">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">{todayJobs.length}</div>
            <p className="text-gray-600 mt-2">Total Jobs</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{inProgressCount}</div>
            <p className="text-gray-600 mt-2">In Progress</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">{completedCount}</div>
            <p className="text-gray-600 mt-2">Completed</p>
          </div>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Assigned Jobs</h2>
        </CardHeader>
        <CardBody>
          {todayJobs.length === 0 ? (
            <p className="text-gray-500 py-8">No jobs assigned for today.</p>
          ) : (
            <div className="space-y-4">
              {todayJobs.map(instance => (
                <div
                  key={instance.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {instance.job?.job_name || 'Unnamed Job'}
                      </h3>
                      {instance.job?.description && (
                        <p className="text-gray-600 mt-1 text-sm">
                          {instance.job.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Scheduled: {instance.scheduled_for
                          ? new Date(instance.scheduled_for).toLocaleTimeString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${instance.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${instance.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : ''}
                        ${instance.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {instance.status}
                      </span>
                      <Link to={`/contractor/job/${instance.id}`}>
                        <Button size="sm">
                          {instance.status === 'completed' ? 'View' : 'Start'}
                        </Button>
                      </Link>
                    </div>
                  </div>
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

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link to="/contractor/earnings">
          <Button variant="secondary">My Earnings</Button>
        </Link>
        <Link to="/contractor/timesheets">
          <Button variant="ghost">Timesheets</Button>
        </Link>
      </div>
    </div>
  );
}
