/**
 * Add Member
 * Form to add employee or contractor
 * Enforces username normalization and role hierarchy
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyUserService } from '../../services/companyUserService';
import { usernameUtils } from '../../lib/validation/username';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/button';

const ROLE_OPTIONS = [
  'owner_primary',
  'owner_secondary',
  'executive',
  'gm',
  'dept_head',
  'manager',
  'supervisor',
  'staff',
  'contractor'
];

export default function AddMember() {
  const navigate = useNavigate();
  const { activeCompanyId } = useAuth();

  const [fullName, setFullName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [taxFileNumber, setTaxFileNumber] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [role, setRole] = useState('staff');
  const [permissionsJson, setPermissionsJson] = useState('{}');
  const [companyAlias, setCompanyAlias] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!activeCompanyId) return;

    setError(null);

    // Normalize and validate alias
    const normAlias = usernameUtils.normalize(companyAlias);
    if (!usernameUtils.isValid(normAlias)) {
      setError('Invalid company alias');
      return;
    }

    // Enforce unique alias
    const unique = await usernameUtils.enforceUniqueCompanyAlias(normAlias, activeCompanyId);
    if (!unique.unique) {
      setError(unique.error || 'Alias already in use');
      return;
    }

    // Permissions parsing
    let permissions: Record<string, any> = {};
    try {
      permissions = JSON.parse(permissionsJson);
    } catch (err) {
      setError('Permissions must be valid JSON');
      return;
    }

    // Create user if not existing (TODO: call auth service to create master account)
    setSaving(true);
    try {
      // TODO: Create or link user account server-side. For now assume user exists and account_id is personalEmail
      const accountId = `${usernameUtils.normalize(personalEmail.split('@')[0])}@app_tag`;

      // Create company alias record
      const result = await companyUserService.createCompanyAlias(
        activeCompanyId,
        accountId,
        normAlias,
        role,
        permissions
      );

      if (!result.success) {
        setError(result.error || 'Failed to add member');
      } else {
        navigate('/workforce');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4">Add New Member</h2>

          {error && <div className="text-red-600 mb-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
            <Input value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} placeholder="Personal Email" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <Input value={dob} onChange={(e) => setDob(e.target.value)} type="date" placeholder="DOB" />
            <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Emergency Contact" />
            <Input value={governmentId} onChange={(e) => setGovernmentId(e.target.value)} placeholder="Government ID" />
            <Input value={taxFileNumber} onChange={(e) => setTaxFileNumber(e.target.value)} placeholder="Tax File Number" />
            <Input value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} placeholder="Bank Details JSON" />

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS.map(r => ({ value: r, label: r }))} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Alias</label>
              <Input value={companyAlias} onChange={(e) => setCompanyAlias(e.target.value)} placeholder="alias" />
              <div className="text-xs text-gray-500 mt-1">alias will become `alias@company_tag`</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Permissions (JSON)</label>
              <Input value={permissionsJson} onChange={(e) => setPermissionsJson(e.target.value)} placeholder='{"jobs": "view"}' />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600" disabled={saving}>{saving ? 'Saving...' : 'Add Member'}</Button>
              <Button type="button" className="bg-gray-400" onClick={() => navigate('/workforce')}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
