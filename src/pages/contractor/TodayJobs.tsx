/**
 * Today Jobs Page
 * Contractor view: Shows today's assigned jobs with quick actions
 * Sorted by scheduled time, earliest first
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { JobInstance, Job } from '../../types';

export default function TodayJobs() {
  const { user, activeCompanyId } = useAuth();
  const [jobs, setJobs] = useState<(JobInstance & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !activeCompanyId) return;

    const fetchTodayJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await jobInstancesService.listInstancesForUser(user.id, {
          company_id: activeCompanyId,
          status: 'assigned'
        });

        if (result.success) {
          // Filter to today only
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayJobs = (result.data || []).filter(j => {
            const scheduled = new Date(j.scheduled_for || '');
            return scheduled >= today && scheduled < tomorrow;
          });

          setJobs(todayJobs);
        } else {
          setError(result.error || 'Failed to load jobs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayJobs();
  }, [user?.id, activeCompanyId]);

  if (loading) {
    return <div className="p-4">Loading today's jobs...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-gray-600">No jobs assigned for today</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Today's Jobs</h1>

        <div className="space-y-4">
          {jobs.map(instance => (
            <Card key={instance.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{instance.job?.job_name || 'Unknown Job'}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Scheduled: {new Date(instance.scheduled_for || '').toLocaleTimeString()}
                    </p>
                    {instance.job?.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        Location: {typeof instance.job.location === 'object'
                          ? (instance.job.location as any).address || 'See details'
                          : 'See details'}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {instance.status || 'assigned'}
                      </span>
                      {instance.job?.priority && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          instance.job.priority === 'high' ? 'bg-red-100 text-red-800' :
                          instance.job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {instance.job.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/job/${instance.id}`}>
                    <Button className="ml-4">Start Job</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
