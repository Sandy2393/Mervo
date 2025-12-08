/**
 * Job Execution Page
 * Main contractor work interface: Clock in/out, upload photos, submit report
 * Enforces geofence if job requires on-premise work
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { jobInstancesService } from '../../services/jobInstancesService';
import { timesheetService } from '../../services/timesheetService';
import { reportService } from '../../services/reportService';
import { geoService } from '../../services/geoService';
import { compressFile } from '../../lib/photo';
import { offlineJobsQueue } from '../../lib/offlineJobsQueue';
import { Card, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Timesheet, JobInstance, Job } from '../../types';

type JobStatus = 'not-started' | 'in-progress' | 'paused' | 'completed-pending-report';

export default function JobExecution() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const { user, activeCompanyId } = useAuth();

  const [instance, setInstance] = useState<JobInstance & { job?: Job } | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>('not-started');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [reportNotes, setReportNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Geofence
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showGeofenceOverride, setShowGeofenceOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    if (!instanceId || !activeCompanyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch instance
        const { data: inst, error: instError } = await supabase
          .from('job_instances')
          .select(`
            *,
            job:jobs(*)
          `)
          .eq('id', instanceId)
          .eq('company_id', activeCompanyId)
          .single();

        if (instError || !inst) {
          setError('Job instance not found');
          return;
        }

        setInstance(inst);

        // Fetch timesheet if started
        if (inst.status === 'in_progress') {
          const { data: ts } = await supabase
            .from('timesheets')
            .select('*')
            .eq('job_instance_id', instanceId)
            .eq('user_id', user?.id)
            .single();

          if (ts) {
            setTimesheet(ts);
            setJobStatus('in-progress');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [instanceId, activeCompanyId, user?.id]);

  const handleStartJob = async () => {
    if (!instance || !user?.id || !instanceId || !activeCompanyId) return;

    try {
      setGeoError(null);

      // Check geofence if required
      if (instance.job?.location) {
        const location = instance.job.location as any;
        const jobLat = location.lat;
        const jobLng = location.lng;
        const requiredRadius = (instance.job as any).clock_in_radius || 100;

        // Get current position
        const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            reject
          );
        });

        const isInRadius = geoService.isWithinRadius(
          { lat: position.latitude, lng: position.longitude },
          { lat: jobLat, lng: jobLng },
          requiredRadius
        );

        if (!isInRadius) {
          setGeoError(
            `You are outside the job location (${requiredRadius}m radius). Request an override?`
          );
          setShowGeofenceOverride(true);
          return;
        }
      }

      // Clock in
      const result = await timesheetService.clockIn(instanceId, user.id, {
        lat: 0,
        lng: 0
      });

        if (result.success && result.data) {
        setTimesheet(result.data);
        setJobStatus('in-progress');
        await jobInstancesService.updateInstanceStatus(activeCompanyId!, instanceId, 'in_progress', user?.id);
      } else {
        setError(result.error || 'Failed to clock in');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start job');
    }
  };

  const handleRequestOverride = async () => {
    if (!instanceId || !user?.id) return;

    try {
      const result = await geoService.handleGpsForgiveness(
        instanceId,
        user.id,
        overrideReason
      );

      if (result.success) {
        // Queue offline action
        offlineJobsQueue.queueOverrideRequest(instanceId, user.id, overrideReason);
        setOverrideReason('');
        setShowGeofenceOverride(false);
        // Note: Manager must approve before clock-in is allowed
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request override');
    }
  };

  const handlePhotoSelect = (files: FileList) => {
    setSelectedPhotos(Array.from(files));
  };

  const handleSubmitReport = async () => {
    if (!instanceId || !user?.id || !activeCompanyId) return;

    try {
      setSubmitting(true);

      // Compress photos
      const compressedPhotos: File[] = [];
      for (const photo of selectedPhotos) {
        const blob = await compressFile(photo);
        compressedPhotos.push(new File([blob], photo.name, { type: 'image/jpeg' }));
      }

      // Upload photos
      let photoIds: string[] = [];
      if (compressedPhotos.length > 0) {
        const photoResult = await reportService.uploadPhotos(
          instanceId,
          user.id,
          compressedPhotos
        );

        if (photoResult.success) {
          photoIds = (photoResult.data || []).map(p => p.id);
        }
      }

      // Submit report
      const reportResult = await reportService.submitReport(
        instanceId,
        user.id,
        {
          notes: reportNotes,
          duration_seconds: timesheet?.duration_seconds || 0
        },
        photoIds
      );

      if (reportResult.success) {
        setJobStatus('completed-pending-report');
        setReportNotes('');
        setSelectedPhotos([]);
      } else {
        setError(reportResult.error || 'Failed to submit report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading job details...</div>;
  }

  if (!instance) {
    return <div className="p-4 text-red-600">Job instance not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardBody>
            <h1 className="text-3xl font-bold">{instance.job?.job_name}</h1>
            <p className="text-gray-600 mt-2">{instance.job?.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="font-semibold">
                  {new Date(instance.scheduled_for || '').toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${
                  jobStatus === 'completed-pending-report' ? 'text-green-600' :
                  jobStatus === 'in-progress' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {jobStatus.replace('-', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        {geoError && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            {geoError}
          </div>
        )}

        {jobStatus === 'not-started' && !showGeofenceOverride && (
          <Button onClick={handleStartJob} className="w-full mb-4">
            Start Job
          </Button>
        )}

        {showGeofenceOverride && (
          <Card className="mb-4">
            <CardBody>
              <h3 className="font-semibold mb-3">Request Geofence Override</h3>
              <Input
                placeholder="Reason for override (optional)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleRequestOverride} className="flex-1">
                  Submit Request
                </Button>
                <Button
                  onClick={() => setShowGeofenceOverride(false)}
                  className="flex-1 bg-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {jobStatus === 'in-progress' && (
          <Card className="mb-4">
            <CardBody>
              <h3 className="font-semibold mb-4">Complete Job Report</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Photos</label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e.target.files || new FileList())}
                  className="mb-2"
                />
                {selectedPhotos.length > 0 && (
                  <p className="text-sm text-gray-600">{selectedPhotos.length} photo(s) selected</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  placeholder="Add any notes about the job..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmitReport}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </CardBody>
          </Card>
        )}

        {jobStatus === 'completed-pending-report' && (
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-4xl text-green-600 mb-2">✓</div>
                <p className="text-lg font-semibold">Report Submitted</p>
                <p className="text-gray-600 mt-2">Awaiting manager approval</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
