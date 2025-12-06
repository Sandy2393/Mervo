import React, { useEffect, useState } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';

interface CompanyRow {
  id: string;
  name: string;
  status: string;
  owner_email?: string;
  created_at?: string;
  storage_bytes?: number;
  workforce_count?: number;
}

export default function CompaniesList() {
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (status) params.append('status', status);
      const res = await superAdminFetch(`/api/super-admin/companies?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRows(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function act(companyId: string, action: 'suspend' | 'reactivate') {
    await superAdminFetch(`/api/super-admin/company/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    load();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-gray-600">Search and manage all companies</p>
        </div>
        <div className="flex gap-2">
          <input className="border p-2 rounded" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={load}>Apply</button>
        </div>
      </div>

      {loading && <div>Loading companies...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!loading && rows.length === 0 && <div className="text-gray-500">No companies found</div>}

      {rows.length > 0 && (
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Owner</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium"><a className="text-blue-600" href={`/super-admin/company/${c.id}`}>{c.name}</a></td>
                  <td className="p-2">{c.owner_email || 'masked'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-2">{c.created_at ? new Date(c.created_at).toLocaleString() : '—'}</td>
                  <td className="p-2 space-x-2">
                    {c.status === 'active' ? (
                      <button className="text-red-600" onClick={() => act(c.id, 'suspend')}>Suspend</button>
                    ) : (
                      <button className="text-green-600" onClick={() => act(c.id, 'reactivate')}>Reactivate</button>
                    )}
                    <a className="text-blue-600" href={`/super-admin/company/${c.id}`}>View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
