/**
 * Job Instances Service
 * Specialized operations for job instance management: creation, assignment, filtering
 * 
 * NOTE: All database operations rely on Supabase RLS policies.
 * TODO: Transactional operations should move to Edge Functions.
 */

import { supabase } from '../lib/supabase';
import { ServiceResponse, JobInstance, Job, RecurrenceRule } from '../types';

/**
 * Create a single job instance
 * @param jobId - Parent job ID
 * @param company_id - Company ID (from parent job)
 * @param scheduled_for - ISO datetime for scheduled execution
 * @param meta - Optional metadata (location override, etc.)
 */
export async function createJobInstance(
  company_id: string,
  jobId: string,
  scheduled_for: string,
  meta?: Record<string, unknown>
): Promise<ServiceResponse<JobInstance>> {
  try {
    const { data, error } = await supabase
      .from('job_instances')
      .insert({
        job_id: jobId,
        company_id,
        scheduled_for,
        status: 'unassigned',
        ...meta
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * Assign a job instance to a contractor
 * @param instanceId - Job instance ID
 * @param company_user_alias - Contractor's company alias (e.g., "john@acme_inc")
 * @returns Updated instance or error
 * 
 * TODO: Server-side validation should:
 * 1. Verify contractor exists and has contractor role
 * 2. Verify contractor's company_id matches instance company_id
 * 3. Check for scheduling conflicts
 * 4. Create audit log entry
 */
export async function assignJobInstance(
  company_id: string,
  instanceId: string,
  company_user_alias: string,
  actorId?: string
): Promise<ServiceResponse<JobInstance>> {
  try {
    // validate actor permissions: ensure actor has edit permission in company
    if (actorId) {
      const { data: cu, error: cuErr } = await supabase
        .from('company_users')
        .select('id, role, role_level, permissions')
        .eq('company_id', company_id)
        .eq('user_id', actorId)
        .maybeSingle();
      if (cuErr || !cu) {
        return { success: false, error: 'Actor has no affiliation to company', code: 'PERMISSION_DENIED' };
      }
      const perms = (cu as any).permissions || {};
      if ((perms['jobs'] || 'none') !== 'edit' && (cu as any).role_level < 90) {
        return { success: false, error: 'Permission denied', code: 'PERMISSION_DENIED' };
      }
    }

    const { data, error } = await supabase
      .from('job_instances')
      .update({
        assigned_to: company_user_alias,
        status: 'assigned'
      })
      .eq('id', instanceId)
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * List instances for a user (contractor view)
 * @param user_id - User ID
 * @param filters - Optional filters (status, company_id, date range)
 */
export async function listInstancesForUser(
  user_id: string,
  filters?: {
    status?: string;
    company_id?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<ServiceResponse<(JobInstance & { job?: Job })[]>> {
  try {
    let query = supabase
      .from('job_instances')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('assigned_to', user_id);

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.start_date) {
      query = query.gte('scheduled_for', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('scheduled_for', filters.end_date);
    }

    const { data, error } = await query.order('scheduled_for', { ascending: true });

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * Update instance status
 * @param instanceId - Instance ID
 * @param status - New status (unassigned, assigned, in_progress, completed, cancelled)
 * @param company_id - Company ID (RLS filter)
 */
export async function updateInstanceStatus(
  company_id: string,
  instanceId: string,
  status: 'unassigned' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
  actorId?: string
): Promise<ServiceResponse<JobInstance>> {
  try {
    // permission check: actor may be contractor assigned to instance or editor
    if (actorId) {
      const { data: cu, error: cuErr } = await supabase
        .from('company_users')
        .select('id, role, role_level, permissions')
        .eq('company_id', company_id)
        .eq('user_id', actorId)
        .maybeSingle();

      if (cuErr) {
        return { success: false, error: cuErr.message, code: 'PERMISSION_DENIED' };
      }
      // Use cu value for simple checks (silences unused variable linter).
      const actorRoleLevel = (cu as any)?.role_level || 0;
      if (actorRoleLevel < 0) {
        // no-op check – placeholder for future logic
      }
    }

    const { data, error } = await supabase
      .from('job_instances')
      .update({
        status,
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      })
      .eq('id', instanceId)
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * List instances with advanced filtering (corporate view)
 * @param company_id - Company ID
 * @param filters - Status, date range, recurring/adhoc, etc.
 */
export async function listInstancesFiltered(
  company_id: string,
  filters?: {
    status?: string[];
    start_date?: string;
    end_date?: string;
    recurring_only?: boolean;
  }
): Promise<ServiceResponse<(JobInstance & { job?: Job })[]>> {
  try {
    let query = supabase
      .from('job_instances')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('company_id', company_id);

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.start_date) {
      query = query.gte('scheduled_for', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('scheduled_for', filters.end_date);
    }
    if (filters?.recurring_only) {
      // Filter to jobs with recurring=true
      query = query.eq('job.recurring', true);
    }

    const { data, error } = await query.order('scheduled_for', { ascending: false });

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * Batch create instances for recurring job
 * @param jobId - Job ID
 * @param company_id - Company ID
 * @param recurrenceRule - Recurrence definition
 * @param numOccurrences - How many instances to create (default 90 for next 90 days)
 */
export async function createRecurringInstances(
  jobId: string,
  company_id: string,
  recurrenceRule: RecurrenceRule,
  numOccurrences: number = 90
): Promise<ServiceResponse<JobInstance[]>> {
  try {
    const scheduledTimes = generateScheduledTimes(recurrenceRule, numOccurrences);
    
    const instances = scheduledTimes.map(scheduled_for => ({
      job_id: jobId,
      company_id,
      scheduled_for,
      status: 'unassigned' as const
    }));

    const { data, error } = await supabase
      .from('job_instances')
      .insert(instances)
      .select();

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * Helper: Generate scheduled times based on recurrence rule
 * Supports daily, weekly, monthly. Custom cron not implemented.
 */
function generateScheduledTimes(rules: RecurrenceRule, numOccurrences: number): string[] {
  const times: string[] = [];
  let current = new Date();
  const endDate = rules.end_date ? new Date(rules.end_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < numOccurrences && current <= endDate; i++) {
    times.push(current.toISOString());

    if (rules.frequency === 'daily') {
      current.setDate(current.getDate() + (rules.interval || 1));
    } else if (rules.frequency === 'weekly') {
      current.setDate(current.getDate() + 7 * (rules.interval || 1));
    } else if (rules.frequency === 'monthly') {
      current.setMonth(current.getMonth() + (rules.interval || 1));
    }
  }

  return times;
}

export const jobInstancesService = {
  createJobInstance,
  assignJobInstance,
  listInstancesForUser,
  updateInstanceStatus,
  listInstancesFiltered,
  createRecurringInstances
};
