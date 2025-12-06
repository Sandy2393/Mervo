import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
    const [jobInstances, setJobInstances] = useState([]);
    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                if (instanceError)
                    throw instanceError;
                // Map to extract single job object (not array)
                const mappedInstances = (instances || []).map((inst) => ({
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
                if (sheetError)
                    throw sheetError;
                setTimesheets(sheets || []);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Dashboard fetch error:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    if (loading)
        return _jsx("div", { className: "text-gray-600", children: "Loading..." });
    if (error)
        return _jsxs("div", { className: "text-red-600", children: ["Error: ", error] });
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Assigned Jobs" }), jobInstances.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No job instances assigned." })) : (_jsx("div", { className: "space-y-2", children: jobInstances.map(inst => (_jsxs("div", { className: "border p-4 rounded bg-white", children: [_jsx("h3", { className: "font-medium", children: inst.job?.job_name || 'Unknown Job' }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Scheduled: ", inst.scheduled_for ? new Date(inst.scheduled_for).toLocaleString() : 'Not scheduled'] }), _jsxs("p", { className: "text-sm", children: ["Status: ", _jsx("span", { className: "font-semibold", children: inst.status })] })] }, inst.id))) }))] }), _jsxs("section", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "My Timesheets" }), timesheets.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No timesheets recorded." })) : (_jsx("div", { className: "space-y-2", children: timesheets.map(ts => (_jsxs("div", { className: "border p-4 rounded bg-white", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["In: ", ts.clock_in ? new Date(ts.clock_in).toLocaleString() : 'Not clocked in'] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Out: ", ts.clock_out ? new Date(ts.clock_out).toLocaleString() : 'Not clocked out'] })] }, ts.id))) }))] })] }));
}
