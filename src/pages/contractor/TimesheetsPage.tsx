import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timesheetService } from '../../services/timesheetService';
import { Card, CardBody } from '../../components/ui/Card';

export default function TimesheetsPage() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const res = await timesheetService.listUserTimesheets(user.id);
      if (res.success && res.data) setTimesheets(res.data as any[]);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="text-center py-8">Loading timesheets...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <p className="text-gray-600 mt-1">Your clock-in / clock-out history</p>
      </div>

      <Card>
        <CardBody>
          {timesheets.length === 0 ? (
            <p className="text-gray-500">No timesheets found.</p>
          ) : (
            <div className="space-y-2">
              {timesheets.map(ts => (
                <div key={ts.id} className="border rounded p-3">
                  <div className="text-sm text-gray-600">Job Instance: {ts.job_instance_id}</div>
                  <div className="text-sm">In: {ts.clock_in || '-'}</div>
                  <div className="text-sm">Out: {ts.clock_out || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
