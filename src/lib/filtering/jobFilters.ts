/**
 * Job Filters Engine
 * Pure functions for client-side job instance filtering
 * No database calls - operates on in-memory data
 */

import { JobInstance } from '../../types';

export type JobStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
export type JobType = 'recurring' | 'adhoc';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Filter instances by status
 */
export function filterByStatus(
  instances: JobInstance[],
  statuses: JobStatus[]
): JobInstance[] {
  if (!statuses.length) return instances;
  return instances.filter(inst => statuses.includes(inst.status as JobStatus));
}

/**
 * Filter instances by date range
 */
export function filterByDateRange(
  instances: JobInstance[],
  start?: string,
  end?: string
): JobInstance[] {
  if (!start && !end) return instances;

  return instances.filter(inst => {
    if (!inst.scheduled_for) return true;
    
    const scheduledDate = new Date(inst.scheduled_for);

    if (start) {
      const startDate = new Date(start);
      if (scheduledDate < startDate) return false;
    }

    if (end) {
      const endDate = new Date(end);
      if (scheduledDate > endDate) return false;
    }

    return true;
  });
}

/**
 * Filter instances by job type (recurring vs adhoc)
 */
export function filterByType(
  instances: JobInstance[],
  types: { recurring?: boolean; adhoc?: boolean }
): JobInstance[] {
  const { recurring, adhoc } = types;

  if (recurring === undefined && adhoc === undefined) {
    return instances;
  }

  return instances.filter(inst => {
    const isRecurring = !!(inst as any).recurrence_rule;

    if (recurring && isRecurring) return true;
    if (adhoc && !isRecurring) return true;

    return false;
  });
}

/**
 * Filter instances by duration in hours
 */
export function filterByDuration(
  instances: JobInstance[],
  options: { minHours?: number; maxHours?: number }
): JobInstance[] {
  const { minHours, maxHours } = options;

  if (minHours === undefined && maxHours === undefined) {
    return instances;
  }

  return instances.filter(inst => {
    // Calculate duration from timesheet if available
    const timesheet = (inst as any).timesheet;
    if (!timesheet) return true; // No duration data yet

    const duration = timesheet.duration_seconds / 3600; // Convert to hours

    if (minHours !== undefined && duration < minHours) return false;
    if (maxHours !== undefined && duration > maxHours) return false;

    return true;
  });
}

/**
 * Filter instances by company_id (for owners with multiple companies)
 */
export function filterByCompany(
  instances: JobInstance[],
  company_id: string
): JobInstance[] {
  if (!company_id) return instances;
  return instances.filter(inst => inst.company_id === company_id);
}

/**
 * Filter instances by report approval status
 */
export function filterByApproval(
  instances: JobInstance[],
  options: { pending?: boolean; approved?: boolean; rejected?: boolean }
): JobInstance[] {
  const { pending, approved, rejected } = options;

  if (!pending && !approved && !rejected) {
    return instances;
  }

  return instances.filter(inst => {
    const report = (inst as any).report;
    if (!report) {
      // No report = pending
      return pending ?? false;
    }

    if (pending && report.status === 'pending') return true;
    if (approved && report.status === 'approved') return true;
    if (rejected && report.status === 'rejected') return true;

    return false;
  });
}

/**
 * Search instances by job name or contractor
 */
export function filterBySearch(
  instances: JobInstance[],
  query: string
): JobInstance[] {
  if (!query.trim()) return instances;

  const q = query.toLowerCase();
  return instances.filter(inst => {
    const jobName = (inst as any).job?.job_name?.toLowerCase() || '';
    const contractorName = inst.assigned_to?.toLowerCase() || '';

    return jobName.includes(q) || contractorName.includes(q);
  });
}

/**
 * Apply multiple filters at once
 */
export interface FilterOptions {
  statuses?: JobStatus[];
  startDate?: string;
  endDate?: string;
  types?: { recurring?: boolean; adhoc?: boolean };
  minHours?: number;
  maxHours?: number;
  company_id?: string;
  approval?: { pending?: boolean; approved?: boolean; rejected?: boolean };
  search?: string;
}

export function applyFilters(
  instances: JobInstance[],
  filters: FilterOptions
): JobInstance[] {
  let result = instances;

  if (filters.statuses) {
    result = filterByStatus(result, filters.statuses);
  }

  if (filters.startDate || filters.endDate) {
    result = filterByDateRange(result, filters.startDate, filters.endDate);
  }

  if (filters.types && (filters.types.recurring !== undefined || filters.types.adhoc !== undefined)) {
    result = filterByType(result, filters.types);
  }

  if (filters.minHours !== undefined || filters.maxHours !== undefined) {
    result = filterByDuration(result, {
      minHours: filters.minHours,
      maxHours: filters.maxHours
    });
  }

  if (filters.company_id) {
    result = filterByCompany(result, filters.company_id);
  }

  if (filters.approval && (filters.approval.pending || filters.approval.approved || filters.approval.rejected)) {
    result = filterByApproval(result, filters.approval);
  }

  if (filters.search) {
    result = filterBySearch(result, filters.search);
  }

  return result;
}

export const jobFilters = {
  filterByStatus,
  filterByDateRange,
  filterByType,
  filterByDuration,
  filterByCompany,
  filterByApproval,
  filterBySearch,
  applyFilters
};
