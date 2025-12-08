/**
 * Contractor List
 * Display company contractors with search and filtering
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import type { CompanyUser } from '../../types';

export default function ContractorList() {
  const { activeCompanyId } = useAuth();
  const [contractors, setContractors] = useState<(CompanyUser & { full_name?: string; phone?: string })[]>([]);
  const [filtered, setFiltered] = useState<(CompanyUser & { full_name?: string; phone?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!activeCompanyId) return;

    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('company_users')
          .select('*, user:users(*)')
          .eq('company_id', activeCompanyId)
          .eq('role', 'contractor');

        if (error) {
          console.error('Failed to load contractors:', error);
          return;
        }

        const list = (data || []).map((cu: any) => ({
          ...cu,
          full_name: cu.user?.full_name,
          phone: cu.user?.phone
        }));

        setContractors(list);
        setFiltered(list);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeCompanyId]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFiltered(
      contractors.filter(c => c.full_name?.toLowerCase().includes(q) || c.company_alias?.toLowerCase().includes(q) || (c as any).phone?.toLowerCase().includes(q))
    );
  }, [searchQuery, contractors]);

  if (loading) return <div className="text-gray-500">Loading contractors...</div>;

  return (
    <Card>
      <CardBody className="space-y-4">
        <Input
          type="text"
          placeholder="Search by name, alias, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No contractors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Alias</th>
                  <th className="px-4 py-2 text-left font-medium">Phone</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{c.full_name || '—'}</td>
                    <td className="px-4 py-2 text-blue-600">{c.company_alias}</td>
                    <td className="px-4 py-2">{c.phone || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
