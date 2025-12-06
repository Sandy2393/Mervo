import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/button';

export default function CompanySelectorPage() {
  const navigate = useNavigate();
  const { companies, switchCompany, activeCompanyId } = useAuth();
  const [selected, setSelected] = useState<string | null>(activeCompanyId || null);

  useEffect(() => {
    if (!selected && companies && companies.length === 1) {
      setSelected(companies[0].id);
    }
  }, [companies, selected]);

  const handleEnter = () => {
    if (!selected) return;
    switchCompany(selected);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-xl w-full">
        <CardBody>
          <h2 className="text-2xl font-semibold mb-4">Select Company</h2>
          <div className="space-y-3">
            {companies.map(c => (
              <div key={c.id} className={`p-3 border rounded ${selected === c.id ? 'ring-2 ring-orange-300' : ''}`} onClick={() => setSelected(c.id)}>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">{c.company_tag}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => navigate('/login')}>Back</Button>
            <Button onClick={handleEnter}>Enter</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
