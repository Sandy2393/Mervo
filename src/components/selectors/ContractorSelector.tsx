import { useEffect, useMemo, useState } from 'react';
import { companyUserService } from '../../services/companyUserService';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/input';

export default function ContractorSelector({ onSelect, companyId }: { onSelect: (companyUserId: string) => void; companyId?: string }) {
  const { activeCompanyId } = useAuth();
  const cid = companyId || activeCompanyId;
  const [list, setList] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!cid) return;
    (async () => {
      // fetch company_users contractors in this company via service
      try {
        const res = await companyUserService.listCompanyUsers(cid, { role: 'contractor', status: 'active' });
        if (res.success && res.data) setList(res.data);
      } catch (e) {
        // swallow — UI shows empty list
      }
    })();
  }, [cid]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return list.filter(l => (!q) || ((l.company_alias || '').toLowerCase().includes(q) || (l.display_name || '').toLowerCase().includes(q)));
  }, [list, query]);

  return (
    <div>
      <Input placeholder="Search contractors" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="max-h-48 overflow-auto mt-2 border rounded p-1 bg-white">
        {filtered.map(c => (
          <div key={c.id} className="p-2 hover:bg-gray-50 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.company_alias}</div>
              <div className="text-xs text-gray-500">{c.display_name || 'Contractor'}</div>
            </div>
            <button className="text-sm text-blue-600" onClick={() => onSelect(c.id)}>Select</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-gray-400 p-2">No contractors found</div>}
      </div>
    </div>
  );
}
