/**
 * Timesheet Service — Clock in/out, timesheet tracking
 * Multi-tenant aware, offline-queue compatible
 */

import { supabase } from '../lib/supabase';
import { Timesheet, ServiceResponse } from '../types';

class TimesheetService {
  /**
   * Clock in
   * Creates or updates timesheet record
   */
  async clockIn(
    jobInstanceId: string,
    userId: string,
    geoData?: Record<string, number>
  ): Promise<ServiceResponse<Timesheet>> {
    try {
      // Check if existing timesheet for this job_instance
      const { data: existing } = await supabase
        .from('timesheets')
        .select('*')
        .eq('job_instance_id', jobInstanceId)
        .eq('user_id', userId)
        .single();

      if (existing && existing.clock_in) {
        // Already clocked in
        return {
          success: false,
          error: 'Already clocked in for this job',
          code: 'ALREADY_CLOCKED_IN'
        };
      }

      const clockInTime = new Date().toISOString();
      const data = {
        job_instance_id: jobInstanceId,
        user_id: userId,
        clock_in: clockInTime,
        clock_in_geo: geoData || {}
      };

      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('timesheets')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            error: error.message,
            code: 'UPDATE_ERROR'
          };
        }
        return { success: true, data: updated };
      }

      // Create new
      const { data: newTs, error } = await supabase
        .from('timesheets')
        .insert(data)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'CREATE_ERROR'
        };
      }

      return { success: true, data: newTs };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * Clock out
   * Updates clock_out timestamp and calculates duration
   */
  async clockOut(
    jobInstanceId: string,
    userId: string,
    geoData?: Record<string, number>
  ): Promise<ServiceResponse<Timesheet>> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('timesheets')
        .select('*')
        .eq('job_instance_id', jobInstanceId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existing) {
        return {
          success: false,
          error: 'No timesheet found for this job',
          code: 'NOT_FOUND'
        };
      }

      const clockOutTime = new Date().toISOString();
      let durationSeconds = null;

      if (existing.clock_in) {
        const clockIn = new Date(existing.clock_in).getTime();
        const clockOut = new Date(clockOutTime).getTime();
        durationSeconds = Math.floor((clockOut - clockIn) / 1000);
      }

      const { data: updated, error } = await supabase
        .from('timesheets')
        .update({
          clock_out: clockOutTime,
          clock_out_geo: geoData || {},
          duration_seconds: durationSeconds
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'UPDATE_ERROR'
        };
      }

      return { success: true, data: updated };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * Get timesheet for job instance
   */
  async getTimesheetByJobInstance(
    jobInstanceId: string
  ): Promise<ServiceResponse<Timesheet | null>> {
    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('job_instance_id', jobInstanceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found
        return { success: true, data: null };
      }

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'FETCH_ERROR'
        };
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * List timesheets for user (contractor view)
   */
  async listUserTimesheets(
    userId: string,
    limit: number = 50
  ): Promise<ServiceResponse<Timesheet[]>> {
    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'FETCH_ERROR'
        };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * Calculate earnings summary for user within date range
   */
  async getEarningsSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse<{ totalDurationSeconds: number; totalHours: number }>> {
    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select('duration_seconds')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'FETCH_ERROR'
        };
      }

      const totalDurationSeconds = (data || []).reduce(
        (sum, ts) => sum + (ts.duration_seconds || 0),
        0
      );
      const totalHours = totalDurationSeconds / 3600;

      return {
        success: true,
        data: { totalDurationSeconds, totalHours }
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }
}

export const timesheetService = new TimesheetService();
