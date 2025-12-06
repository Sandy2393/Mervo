import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usersService } from '../../services/usersService';
import { CompanyUser } from '../../types';
import { CompanyOwner } from '../../types';

export default function CompanySettings() {
  const { activeCompanyId, companies } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(activeCompanyId || null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [companyTag, setCompanyTag] = useState('');
  const [status, setStatus] = useState<'active'|'suspended'|'pending'>('active');
  const [message, setMessage] = useState<string | null>(null);
  const [owners, setOwners] = useState<CompanyOwner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyUser[]>([]);
  const [searching, setSearching] = useState(false);

  const loadOwners = async (cid: string) => {
    const res = await companyService.getCompanyOwners(cid);
    if (res.success && res.data) setOwners(res.data);
  };

  useEffect(() => {
    let mounted = true;
    const runSearch = async () => {
      if (!companyId) return;
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const res = await usersService.searchUsersByAlias(companyId, searchTerm);
      if (!mounted) return;
      if (res.success && res.data) setSearchResults(res.data);
      else setSearchResults([]);
      setSearching(false);
    };

    const t = setTimeout(runSearch, 250);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [searchTerm, companyId]);

  useEffect(() => {
    if (!companyId && companies && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companyId, companies]);

  useEffect(() => {
    const load = async () => {
      if (!companyId) return;
      setLoading(true);
      const res = await companyService.getCompanyById(companyId);
      setLoading(false);
      if (res.success && res.data) {
        setName(res.data.name || '');
        setCompanyTag(res.data.company_tag || '');
        setStatus((res.data.status as any) || 'active');
        // load owners
        await loadOwners(companyId);
      } else {
        setMessage(res.error || 'Failed to load company');
      }
    };
    load();
  }, [companyId]);

  const onSave = async () => {
    if (!companyId) return setMessage('No active company selected');
    setLoading(true);
    setMessage(null);
    const updates: any = { name };
    // company_tag is usually immutable; only allow if changed and short
    if (companyTag && companyTag.length >= 2) updates.company_tag = companyTag.toLowerCase();
    const res = await companyService.updateCompany(companyId, updates);
    setLoading(false);
    if (res.success) {
      setMessage('Saved successfully');
    } else {
      setMessage(res.error || 'Save failed');
    }
  };

  const onAddOwner = async (userId: string) => {
    if (!companyId) return setMessage('No active company');
    setLoading(true);
    const res = await companyService.addCompanyOwner(companyId, userId);
    setLoading(false);
    if (res.success && res.data) {
      setSearchTerm('');
      setSearchResults([]);
      await loadOwners(companyId);
      setMessage('Owner added');
    } else {
      setMessage(res.error || 'Failed to add owner');
    }
  };

  const onRemoveOwner = async (ownerId: string) => {
    if (!companyId) return setMessage('No active company');
    setLoading(true);
    const res = await companyService.removeCompanyOwner(ownerId);
    setLoading(false);
    if (res.success) {
      await loadOwners(companyId);
      setMessage('Owner removed');
    } else {
      setMessage(res.error || 'Failed to remove owner');
    }
  };

  if (!companyId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Company Settings</h2>
        <p className="text-sm text-gray-600 mt-2">No active company. Switch to a company to edit settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Company Settings</h2>

      <div className="space-y-4">
        <div>
          <Input label="Company Name" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium">Owners</h3>
          <div className="mt-3 space-y-2">
            {owners.length === 0 && <p className="text-sm text-gray-500">No owners found.</p>}
            {owners.map(o => (
              <div key={o.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div>
                  <div className="font-medium text-sm">{o.user_id}</div>
                  <div className="text-xs text-gray-500">{o.is_primary ? 'Primary' : 'Owner'}</div>
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => onRemoveOwner(o.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Owner by Alias</label>
            <div className="flex gap-2">
              <Input placeholder="Search by alias (min 2 chars)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <Button onClick={() => { if (searchResults[0]) onAddOwner(searchResults[0].user_id); }} isLoading={loading || searching}>Add</Button>
            </div>

            {searching && <p className="text-sm text-gray-500 mt-2">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="mt-2 space-y-2">
                {searchResults.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div>
                      <div className="font-medium text-sm">{u.company_alias || u.user_id}</div>
                      <div className="text-xs text-gray-500">{u.user_id}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="primary" onClick={() => onAddOwner(u.user_id)} disabled={loading}>Add</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Input label="Company Tag" value={companyTag} onChange={e => setCompanyTag(e.target.value)} helperText="Short lowercase tag used in URLs. Changing this may affect links." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="w-full px-3 py-2 border rounded-lg" value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {message && (
          <div className="text-sm text-gray-700">{message}</div>
        )}

        <div className="flex items-center space-x-3">
          <Button variant="primary" onClick={onSave} isLoading={loading}>Save</Button>
          <Button variant="ghost" onClick={() => {
            // reload
            setCompanyId(prev => prev ? prev + '' : prev);
          }}>Reload</Button>
          <Button variant="danger" onClick={async () => {
            if (!companyId) return setMessage('No active company');
            if (!confirm('Suspend this company? This action will disable access.')) return;
            setLoading(true);
            const res = await companyService.suspendCompany(companyId);
            setLoading(false);
            if (res.success) {
              setStatus('suspended');
              setMessage('Company suspended');
            } else {
              setMessage(res.error || 'Failed to suspend company');
            }
          }}>Suspend Company</Button>
        </div>
      </div>
    </div>
  );
}
