import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timesheetService } from '../../services/timesheetService';
import { Card, CardBody } from '../../components/ui/card';

export default function MyEarnings() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{ total_earnings?: number; total_hours?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const res = await timesheetService.getEarningsSummary(user.id, start, end);
      if (res.success && res.data) {
        setSummary(res.data as any);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading earnings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Earnings</h1>
        <p className="text-gray-600 mt-1">Summary of recent earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <div className="text-2xl font-bold mt-2">${(0).toFixed(2)}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Total Hours</p>
            <div className="text-2xl font-bold mt-2">{(summary?.total_hours || 0).toFixed(2)} hrs</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
