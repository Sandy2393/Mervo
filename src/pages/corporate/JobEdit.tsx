import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobsService';
import { auditService } from '../../services/auditService';
import { Card, CardBody } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import Toast from '../../components/ui/toast';

export default function JobEdit() {
  const { jobId } = useParams<{ jobId: string }>();
  const { activeCompanyId, user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !activeCompanyId) return;
    (async () => {
      setLoading(true);
      const resp = await jobsService.getJobById(activeCompanyId, jobId);
      if (resp.success) setJob(resp.data);
      else setError(resp.error || 'Failed to load job');
      setLoading(false);
    })();
  }, [jobId, activeCompanyId]);

  const onSave = async () => {
    if (!job || !activeCompanyId || !user) return setError('Missing context');
    setSaving(true);
    setError(null);

    // optimistic snapshot
    const snapshot = { ...job };
    try {
      const resp = await jobsService.updateJob(activeCompanyId, job.id, { job_name: job.job_name, description: job.description }, user.id);
      if (!resp.success) throw new Error(resp.error || 'Update failed');
      // record audit
      await auditService.record(activeCompanyId, 'update_job', job.id, { updatedBy: user.id });
      navigate(`/corporate/jobs/${job.id}`);
    } catch (err) {
      setJob(snapshot); // rollback
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!job) return <div className="p-4 text-red-600">Job not found</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Job</h1>
        <div>
          <Button onClick={() => navigate(`/corporate/jobs/${job.id}`)}>Cancel</Button>
          <Button onClick={onSave} isLoading={saving} className="ml-2">Save</Button>
        </div>
      </div>
      {error && <Toast message={error} type="error" />}
      <Card>
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Job name</label>
              <Input value={job.job_name} onChange={(e) => setJob({ ...job, job_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <Input value={job.description || ''} onChange={(e) => setJob({ ...job, description: e.target.value })} />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
