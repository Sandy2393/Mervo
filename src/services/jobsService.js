/**
 * Jobs Service — CRUD for Jobs and Job Instances
 * Multi-tenant: all operations scoped to company_id
 */
import { supabase } from '../lib/supabase';
import { PermissionDeniedError } from '../lib/permissions';
import { validateJobPayload } from './validationService';
// audit and job-instance helpers available if services need to call them
class JobsService {
    /**
     * Create job within a company
     * Requires company_id_context
     */
    async createJob(companyId, job, actorId) {
        try {
            // permission enforcement: verify actor has edit permission on company
            if (actorId) {
                const { data: cu } = await supabase
                    .from('company_users')
                    .select('permissions, role_level')
                    .eq('company_id', companyId)
                    .eq('user_id', actorId)
                    .maybeSingle();
                const perms = cu?.permissions || {};
                if ((perms['jobs'] || 'none') !== 'edit' && (cu?.role_level || 0) < 90) {
                    throw new PermissionDeniedError('create_job_permission');
                }
            }
            const validation = validateJobPayload(job);
            if (!validation.valid) {
                return { success: false, error: validation.errors.join(', '), code: 'VALIDATION_FAILED' };
            }
            const { data, error } = await supabase
                .from('jobs')
                .insert({
                ...job,
                company_id: companyId
            })
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'CREATE_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            if (err instanceof PermissionDeniedError) {
                return { success: false, error: err.message, code: 'PERMISSION_DENIED' };
            }
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Get job by ID
     * RLS enforces company membership
     */
    async getJobById(companyId, jobId) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .eq('company_id', companyId)
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * List jobs in company
     */
    async listJobsByCompany(companyId, filters) {
        try {
            let query = supabase
                .from('jobs')
                .select('*')
                .eq('company_id', companyId);
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.publish !== undefined) {
                query = query.eq('publish', filters.publish);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data: data || [] };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Update job
     * RLS: only editors or owners
     */
    async updateJob(companyId, jobId, updates, actorId) {
        try {
            // permission enforcement
            if (actorId) {
                const { data: cu } = await supabase
                    .from('company_users')
                    .select('permissions, role_level')
                    .eq('company_id', companyId)
                    .eq('user_id', actorId)
                    .maybeSingle();
                const perms = cu?.permissions || {};
                if ((perms['jobs'] || 'none') !== 'edit' && (cu?.role_level || 0) < 90) {
                    throw new PermissionDeniedError('update_job_permission');
                }
            }
            const { data, error } = await supabase
                .from('jobs')
                .update(updates)
                .eq('id', jobId)
                .eq('company_id', companyId)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'UPDATE_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Create job instance (assignment)
     * TODO: Edge Function should:
     * 1. Validate job exists in company
     * 2. Validate assigned_to user exists
     * 3. Create job_instance
     * 4. Audit log
     */
    /**
     * Create a job instance – kept here for compatibility but callers should prefer
     * jobInstancesService.createJobInstance
     */
    async createJobInstance(companyId, jobInstanceData) {
        try {
            const { data, error } = await supabase
                .from('job_instances')
                .insert({
                ...jobInstanceData,
                company_id: companyId
            })
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'CREATE_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Get job instance by ID with related job data
     */
    async getJobInstanceById(jobInstanceId, companyId) {
        try {
            const { data, error } = await supabase
                .from('job_instances')
                .select(`
          *,
          job:jobs(*)
        `)
                .eq('id', jobInstanceId)
                .eq('company_id', companyId)
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * List job instances for a job
     */
    async listJobInstancesByJob(jobId, companyId) {
        try {
            const { data, error } = await supabase
                .from('job_instances')
                .select('*')
                .eq('job_id', jobId)
                .eq('company_id', companyId)
                .order('scheduled_for', { ascending: true });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data: data || [] };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * List job instances for today (contractor view)
     */
    async listTodayJobInstances(companyId, userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const { data, error } = await supabase
                .from('job_instances')
                .select(`
          *,
          job:jobs(*)
        `)
                .eq('company_id', companyId)
                .eq('assigned_to', userId)
                .gte('scheduled_for', today.toISOString())
                .lt('scheduled_for', tomorrow.toISOString())
                .order('scheduled_for', { ascending: true });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data: data || [] };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Update job instance status
     * RLS: contractor can update own, editors can update any
     */
    async updateJobInstance(companyId, jobInstanceId, updates, actorId) {
        try {
            // permission check for updates
            if (actorId) {
                const { data: cu } = await supabase
                    .from('company_users')
                    .select('permissions, role_level')
                    .eq('company_id', companyId)
                    .eq('user_id', actorId)
                    .maybeSingle();
                const perms = cu?.permissions || {};
                if ((perms['jobs'] || 'none') !== 'edit' && (cu?.role_level || 0) < 90) {
                    throw new PermissionDeniedError('update_instance_permission');
                }
            }
            const { data, error } = await supabase
                .from('job_instances')
                .update(updates)
                .eq('id', jobInstanceId)
                .eq('company_id', companyId)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'UPDATE_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Bulk create job instances for a job with multiple contractors
     * TODO: Should be an Edge Function (transactional)
     */
    async bulkCreateJobInstances(companyId, jobId, scheduledFor, contractorIds) {
        try {
            const instances = contractorIds.map(contractorId => ({
                job_id: jobId,
                company_id: companyId,
                assigned_to: contractorId,
                scheduled_for: scheduledFor,
                status: 'assigned'
            }));
            const { data, error } = await supabase
                .from('job_instances')
                .insert(instances)
                .select();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'CREATE_ERROR'
                };
            }
            return { success: true, data: data || [] };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
}
export const jobsService = new JobsService();
