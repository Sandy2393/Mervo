import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { jobsService } from '../../services/jobsService';
import { usersService } from '../../services/usersService';
import { auditService } from '../../services/auditService';
import { Card, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Job, JobInstance, CompanyUser } from '../../types';
import Toast from '../../components/ui/toast';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const { activeCompanyId, user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [instances, setInstances] = useState<(JobInstance & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & form state
  const [showCreateInstance, setShowCreateInstance] = useState(false);
  const [showAssignInstance, setShowAssignInstance] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [newScheduledFor, setNewScheduledFor] = useState('');
  const [assignmentAlias, setAssignmentAlias] = useState('');
  const [contractors, setContractors] = useState<CompanyUser[]>([]);

  useEffect(() => {
    if (!jobId || !activeCompanyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const j = await jobsService.getJobById(activeCompanyId, jobId);
        if (j.success) setJob(j.data || null);

        const inst = await jobsService.listJobInstancesByJob(jobId, activeCompanyId);
        if (inst.success) setInstances(inst.data || []);

        const c = await usersService.listContractors(activeCompanyId);
        if (c.success) setContractors(c.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, activeCompanyId]);

  const handleCreateInstance = async () => {
    if (!jobId || !activeCompanyId || !newScheduledFor) return;
    try {
      const res = await jobInstancesService.createJobInstance(activeCompanyId, jobId, newScheduledFor);
      if (res.success && res.data) {
        setInstances(prev => [...prev, res.data!]);
        setNewScheduledFor('');
        setShowCreateInstance(false);
        await auditService.record(activeCompanyId, 'create_instance', res.data!.id, { createdBy: user?.id });
      } else {
        setError(res.error || 'Failed to create instance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown');
    }
  };

  const handleAssignInstance = async () => {
    if (!selectedInstanceId || !activeCompanyId || !assignmentAlias) return;
    try {
      const res = await jobInstancesService.assignJobInstance(activeCompanyId, selectedInstanceId, assignmentAlias, user?.id);
      if (res.success && res.data) {
        setInstances(prev => prev.map(i => i.id === selectedInstanceId ? res.data! : i));
        setAssignmentAlias('');
        setShowAssignInstance(false);
        setSelectedInstanceId(null);
        await auditService.record(activeCompanyId, 'assign_instance', selectedInstanceId, { assignedTo: assignmentAlias, actor: user?.id });
      } else {
        setError(res.error || 'Failed to assign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown');
    }
  };

  if (loading) return <div className="p-4">Loading job details...</div>;
  if (!job) return <div className="p-4 text-red-600">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {error && <Toast message={error} type="error" />}

        <Card className="mb-6">
          <CardBody>
            <h1 className="text-3xl font-bold">{job.job_name}</h1>
            <p className="text-gray-600 mt-2">{job.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-semibold">{job.priority || 'Normal'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{job.status}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Job Instances ({instances.length})</h2>
          <Button onClick={() => setShowCreateInstance(true)}>+ Create Instance</Button>
        </div>

        {instances.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600">No instances yet</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {instances.map(instance => (
              <Card key={instance.id}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Scheduled: {new Date(instance.scheduled_for || '').toLocaleString()}</p>
                      <p className="mt-1"><span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mr-2">{instance.status}</span></p>
                      {instance.assigned_to && <p className="text-sm mt-2">Assigned to: <strong>{instance.assigned_to}</strong></p>}
                    </div>
                    {!instance.assigned_to && (
                      <Button onClick={() => { setSelectedInstanceId(instance.id); setShowAssignInstance(true); }}>Assign</Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {showCreateInstance && (
          <Modal isOpen={showCreateInstance} title="Create Job Instance" onClose={() => setShowCreateInstance(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Date/Time</label>
                <Input type="datetime-local" value={newScheduledFor} onChange={(e) => setNewScheduledFor(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateInstance} className="flex-1">Create</Button>
                <Button onClick={() => setShowCreateInstance(false)} className="flex-1 bg-gray-500">Cancel</Button>
              </div>
            </div>
          </Modal>
        )}

        {showAssignInstance && (
          <Modal isOpen={showAssignInstance} title="Assign Job Instance" onClose={() => setShowAssignInstance(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contractor</label>
                <select value={assignmentAlias} onChange={(e) => setAssignmentAlias(e.target.value)} className="w-full border rounded p-2">
                  <option value="">-- Select Contractor --</option>
                  {contractors.map(c => <option key={c.id} value={c.company_alias}>{c.company_alias}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssignInstance} className="flex-1">Assign</Button>
                <Button onClick={() => setShowAssignInstance(false)} className="flex-1 bg-gray-500">Cancel</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
