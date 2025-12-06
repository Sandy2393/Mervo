/**
 * Job Execution Page — Contractor interface during job
 * Clock in/out, photo upload, notes, signature
 * TODO: Implement offline sync with Dexie
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { JobInstance, Timesheet, Job } from '../../types';
import { jobsService } from '../../services/jobsService';
import { timesheetService } from '../../services/timesheetService';

export default function JobExecutionPage() {
  const { jobInstanceId } = useParams<{ jobInstanceId: string }>();
  const navigate = useNavigate();
  const { activeCompanyId, user } = useAuth();

  const [jobInstance, setJobInstance] = useState<(JobInstance & { job?: Job }) | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clockedIn, setClockedIn] = useState(false);

  useEffect(() => {
    if (!activeCompanyId || !jobInstanceId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch job instance
        const jobResult = await jobsService.getJobInstanceById(jobInstanceId, activeCompanyId);
        if (jobResult.success && jobResult.data) {
          setJobInstance(jobResult.data);
        }

        // Fetch timesheet
        const timesheetResult = await timesheetService.getTimesheetByJobInstance(jobInstanceId);
        if (timesheetResult.success && timesheetResult.data) {
          setTimesheet(timesheetResult.data);
          setClockedIn(!!timesheetResult.data.clock_in && !timesheetResult.data.clock_out);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCompanyId, jobInstanceId]);

  const handleClockIn = async () => {
    if (!jobInstanceId || !user) return;

    try {
      setLoading(true);

      // Get current location if available
      let geoData: Record<string, number> | undefined;
      if (navigator.geolocation) {
        geoData = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              });
            },
            () => resolve(undefined)
          );
        });
      }

      const result = await timesheetService.clockIn(jobInstanceId, user.id, geoData);

      if (result.success && result.data) {
        setTimesheet(result.data);
        setClockedIn(true);
      } else {
        setError(result.error || 'Failed to clock in');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!jobInstanceId || !user) return;

    try {
      setLoading(true);

      let geoData: Record<string, number> | undefined;
      if (navigator.geolocation) {
        geoData = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              });
            },
            () => resolve(undefined)
          );
        });
      }

      const result = await timesheetService.clockOut(jobInstanceId, user.id, geoData);

      if (result.success && result.data) {
        setTimesheet(result.data);
        setClockedIn(false);
      } else {
        setError(result.error || 'Failed to clock out');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !jobInstance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading job...</p>
      </div>
    );
  }

  if (!jobInstance) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Job not found</p>
        <Button onClick={() => navigate('/contractor')}>Back to Jobs</Button>
      </div>
    );
  }

  const formatTime = (isoTime?: string) => {
    if (!isoTime) return '-';
    return new Date(isoTime).toLocaleTimeString();
  };

  const duration = timesheet?.duration_seconds
    ? `${Math.floor(timesheet.duration_seconds / 3600)}h ${Math.floor((timesheet.duration_seconds % 3600) / 60)}m`
    : '-';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {jobInstance.job?.job_name || 'Job Execution'}
        </h1>
        {jobInstance.job?.description && (
          <p className="text-gray-600 mt-2">{jobInstance.job.description}</p>
        )}
      </div>

      {/* Time Tracking Card */}
      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Clocked In</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(timesheet?.clock_in)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Clocked Out</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(timesheet?.clock_out)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{duration}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {!clockedIn ? (
              <Button
                onClick={handleClockIn}
                isLoading={loading}
                className="px-8"
              >
                Clock In
              </Button>
            ) : (
              <Button
                onClick={handleClockOut}
                isLoading={loading}
                variant="danger"
                className="px-8"
              >
                Clock Out
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Job Details */}
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-semibold text-lg">Job Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{jobInstance.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled For</p>
              <p className="font-medium">
                {jobInstance.scheduled_for
                  ? new Date(jobInstance.scheduled_for).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* TODO: Photo Upload Section */}
      <Card>
        <CardBody>
          <h2 className="font-semibold text-lg mb-4">Photos</h2>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded">
            📸 Photo upload coming soon
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/contractor')}
        >
          Back to Jobs
        </Button>
        <Button>Save Notes (TODO)</Button>
      </div>
    </div>
  );
}
