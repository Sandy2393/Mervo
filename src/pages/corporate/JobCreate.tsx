import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobsService';
import ContractorSelector from '../../components/selectors/ContractorSelector';
import { validateJobPayload } from '../../services/validationService';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

export default function JobCreate() {
  const { user, activeCompanyId } = useAuth();
  const navigate = useNavigate();

  const [jobName, setJobName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [assignedContractorId, setAssignedContractorId] = useState<string | null>(null);
  // assignment handled post-create via instances/assign flow
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSelectContractor = (id: string) => setAssignedContractorId(id);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setError(null);
    if (!activeCompanyId || !user?.id) return setError('Missing company or user');

    const payload = {
      job_name: jobName,
      description,
      priority,
      recurring: false,
      created_by: user.id
    } as any;

    const validation = validateJobPayload(payload);
    if (!validation.valid) return setError(validation.errors.join(', '));

    setLoading(true);

    // Optimistic UI: navigate to job list and show temporary state
    try {
      const resp = await jobsService.createJob(activeCompanyId, payload, user.id);
      if (!resp.success) throw new Error(resp.error || 'Failed to create job');
      navigate(`/corporate/jobs/${resp.data!.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create Job</h1>
      </div>

      {error && <Toast message={error} type="error" />}

      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Job name</label>
              <Input value={jobName} onChange={(e) => setJobName(e.target.value)} aria-label="Job name" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Description" />
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="mt-1 block w-full border rounded px-2 py-1">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assign contractor (optional)</label>
              <ContractorSelector onSelect={onSelectContractor} />
              {assignedContractorId && (
                <p className="text-sm text-gray-500 mt-2">Selected contractor id: <strong>{assignedContractorId}</strong></p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" isLoading={loading}>Create</Button>
              <Button type="button" onClick={() => navigate('/corporate/jobs')}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
