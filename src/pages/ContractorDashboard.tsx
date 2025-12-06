import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { JobInstance, Job, Timesheet } from '../types';

/**
 * ContractorDashboard
 * 
 * Displays job instances assigned to the logged-in contractor.
 * This component demonstrates:
 * - Querying job_instances filtered by assigned_to (RLS protected)
 * - Joining with jobs table to show job details
 * - Querying timesheets for contractor (RLS protected)
 * 
 * NOTE: This will not execute in AI Studio without a live Supabase instance
 * and authenticated user. For local development, ensure:
 * 1. Supabase project is created
 * 2. supabase_schema.sql is imported
 * 3. env.ts placeholders are replaced
 * 4. User is authenticated via Supabase Auth
 */

export default function ContractorDashboard() {
  const [jobInstances, setJobInstances] = useState<(JobInstance & { job?: Job })[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ILLUSTRATIVE: Fetch job instances assigned to current contractor
        // In runtime: auth.uid() is automatically the logged-in user's ID from Supabase Auth
        // RLS policy will filter to only show instances assigned to them
        const { data: instances, error: instanceError } = await supabase
          .from('job_instances')
          .select(`
            id,
            job_id,
            assigned_to,
            scheduled_for,
            status,
            created_at,
            company_id,
            job:job_id (
              id,
              job_name,
              location,
              company_id
            )
          `)
          .order('scheduled_for', { ascending: true });

        if (instanceError) throw instanceError;
        // Map to extract single job object (not array)
        const mappedInstances = (instances || []).map((inst: any) => ({
          ...inst,
          job: inst.job?.[0]
        }));
        setJobInstances(mappedInstances);

        // ILLUSTRATIVE: Fetch timesheets for current contractor
        // RLS policy ensures contractor only sees their own timesheets
        const { data: sheets, error: sheetError } = await supabase
          .from('timesheets')
          .select('*')
          .order('created_at', { ascending: false });

        if (sheetError) throw sheetError;
        setTimesheets(sheets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Assigned Jobs</h2>
        {jobInstances.length === 0 ? (
          <p className="text-gray-500">No job instances assigned.</p>
        ) : (
          <div className="space-y-2">
            {jobInstances.map(inst => (
              <div key={inst.id} className="border p-4 rounded bg-white">
                <h3 className="font-medium">{inst.job?.job_name || 'Unknown Job'}</h3>
                <p className="text-sm text-gray-600">
                  Scheduled: {inst.scheduled_for ? new Date(inst.scheduled_for).toLocaleString() : 'Not scheduled'}
                </p>
                <p className="text-sm">Status: <span className="font-semibold">{inst.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Timesheets</h2>
        {timesheets.length === 0 ? (
          <p className="text-gray-500">No timesheets recorded.</p>
        ) : (
          <div className="space-y-2">
            {timesheets.map(ts => (
              <div key={ts.id} className="border p-4 rounded bg-white">
                <p className="text-sm text-gray-600">
                  In: {ts.clock_in ? new Date(ts.clock_in).toLocaleString() : 'Not clocked in'}
                </p>
                <p className="text-sm text-gray-600">
                  Out: {ts.clock_out ? new Date(ts.clock_out).toLocaleString() : 'Not clocked out'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
