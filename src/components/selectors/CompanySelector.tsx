import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { setActiveCompany as persistActiveCompany } from '../../services/auth/companySwitch';
import { Button } from '../ui/button';

export default function CompanySelector({ className }: { className?: string }) {
  const { companies, activeCompanyId, switchCompany } = useAuth();
  const [open, setOpen] = useState(false);

  const handleChoose = (companyId: string) => {
    persistActiveCompany(companyId);
    switchCompany(companyId);
    setOpen(false);
  };

  return (
    <div className={className}>
      <div className="inline-block">
        <Button onClick={() => setOpen(!open)}>{companies.find(c => c.id === activeCompanyId)?.company_tag || 'Select company'}</Button>
      </div>

      {open && (
        <div className="mt-2 w-64 bg-white border rounded shadow p-2 z-50">
          {companies.map(c => (
            <div key={c.id} className="p-2 hover:bg-gray-50 flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.company_tag || c.name}</div>
                <div className="text-xs text-gray-500">{c.name}</div>
              </div>
              <Button size="sm" onClick={() => handleChoose(c.id)}>Switch</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
