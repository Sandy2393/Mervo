/**
 * Past Jobs Page
 * Contractor view: Completed jobs, weekly/fortnightly view, PDF download
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { exportsService } from '../../services/exportsService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { JobInstance, Job } from '../../types';

type ViewPeriod = 'week' | 'fortnight';

export default function PastJobs() {
  const { user, activeCompanyId } = useAuth();
  const [jobs, setJobs] = useState<(JobInstance & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('week');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !activeCompanyId) return;

    const fetchPastJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        if (viewPeriod === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else {
          startDate.setDate(startDate.getDate() - 14);
        }

        const result = await jobInstancesService.listInstancesForUser(user.id, {
          company_id: activeCompanyId,
          status: 'completed',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

        if (result.success) {
          setJobs(result.data || []);
        } else {
          setError(result.error || 'Failed to load jobs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPastJobs();
  }, [user?.id, activeCompanyId, viewPeriod]);

  const handleDownloadPDF = async (instanceId: string) => {
    try {
      setDownloading(instanceId);
      const result = await exportsService.generateInstancePDF(instanceId, activeCompanyId || '');

      if (result.success) {
        // In real implementation, trigger download
        // For now, show URL
        console.log('Download URL:', result.data?.dataUrl);
        alert(`PDF ready: ${result.data?.fileName}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <div className="p-4">Loading past jobs...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Past Jobs</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewPeriod('week')}
              className={viewPeriod === 'week' ? '' : 'bg-gray-500'}
            >
              This Week
            </Button>
            <Button
              onClick={() => setViewPeriod('fortnight')}
              className={viewPeriod === 'fortnight' ? '' : 'bg-gray-500'}
            >
              Fortnight
            </Button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600">No completed jobs in this period</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map(instance => (
              <Card key={instance.id}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{instance.job?.job_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Completed: {new Date(instance.completed_at || '').toLocaleDateString()}
                      </p>
                      <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDownloadPDF(instance.id)}
                      disabled={downloading === instance.id}
                      className="ml-4"
                    >
                      {downloading === instance.id ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
