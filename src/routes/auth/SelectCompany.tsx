import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setActiveCompany } from '../../services/auth/companySwitch';
import { authService } from '../../services/authService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';

export default function SelectCompany() {
  const { companies, user, switchCompany } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [affiliations, setAffiliations] = useState<{ company_id: string; company_alias?: string; role?: string }[]>([]);

  useEffect(() => {
    if (!user) navigate('/login');
    // load company_user affiliations so we can present company_alias + role
    (async () => {
      if (!user) return;
      const result = await authService.getUserCompanies(user.id);
      if (result.success && result.data) setAffiliations(result.data.map((r:any) => ({ company_id: r.company_id, company_alias: r.company_alias, role: r.role })));
    })();
  }, [user]);

  const choose = async (companyId: string) => {
    setLoading(true);
    try {
      setActiveCompany(companyId);
      switchCompany(companyId);
      navigate('/corporate');
    } finally {
      setLoading(false);
    }
  };

  if ((!companies || companies.length === 0) && affiliations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardBody>
            <p>No companies associated with this account.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-2xl w-full">
        <CardBody>
          <h3 className="text-xl font-semibold mb-4">Select a company</h3>
          <div className="space-y-3">
            {affiliations.map((c) => (
              <div key={c.company_id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{c.company_alias || c.company_id}</div>
                  <div className="text-sm text-gray-500">{c.role}</div>
                </div>
                <Button onClick={() => choose(c.company_id)} isLoading={loading}>Enter</Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
