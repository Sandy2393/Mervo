/**
 * Report Service
 * Handles job reports: photo uploads, report submission, approval workflow
 * 
 * NOTE: Storage operations are placeholders.
 * TODO: Real implementation should use Supabase Storage or GCS with service role key
 * via Edge Function to avoid exposing storage secrets to client.
 */

import { supabase } from '../lib/supabase';
import { ServiceResponse, JobPhoto, JobReport } from '../types';

/**
 * Upload photos for a job instance
 * 
 * TODO: Real implementation:
 * 1. Call Edge Function endpoint
 * 2. Edge Function uploads each photo to Supabase Storage
 * 3. Returns signed URLs or paths
 * 4. Client stores references in job_photos table
 * 
 * For now, returns placeholder paths.
 */
export async function uploadPhotos(
  instanceId: string,
  userId: string,
  photos: File[]
): Promise<ServiceResponse<JobPhoto[]>> {
  try {
    // Placeholder: generate fake storage paths
    const jobPhotos: JobPhoto[] = photos.map((file, idx) => ({
      id: `photo_${Date.now()}_${idx}`,
      job_instance_id: instanceId,
      uploader_id: userId,
      storage_path: `placeholder://job-photos/${instanceId}/${Date.now()}_${idx}.jpg`,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }));

    // Store references in database
    const { data, error } = await supabase
      .from('job_photos')
      .insert(jobPhotos)
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
 * Submit a job report
 * @param instanceId - Job instance ID
 * @param userId - Submitting user ID
 * @param reportPayload - Report data (answers, notes, duration)
 * @param photoIds - IDs of attached photos
 */
export async function submitReport(
  instanceId: string,
  userId: string,
  reportPayload: {
    answers?: Record<string, unknown>;
    notes?: string;
    duration_seconds?: number;
  },
  photoIds: string[] = []
): Promise<ServiceResponse<JobReport>> {
  try {
    const { data, error } = await supabase
      .from('job_reports')
      .insert({
        job_instance_id: instanceId,
        user_id: userId,
        answers: reportPayload.answers,
        notes: reportPayload.notes,
        duration_seconds: reportPayload.duration_seconds,
        photo_ids: photoIds,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    // Update instance status to reflect pending approval
    await supabase
      .from('job_instances')
      .update({ status: 'completed' })
      .eq('id', instanceId);

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * Approve a job report
 * @param reportId - Report ID
 * @param approverId - User ID of approver (owner/manager)
 */
export async function approveReport(
  reportId: string,
  approverId: string
): Promise<ServiceResponse<JobReport>> {
  try {
    const { data, error } = await supabase
      .from('job_reports')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', reportId)
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
 * Reject a job report
 * @param reportId - Report ID
 * @param approverId - User ID of approver
 * @param reason - Reason for rejection
 */
export async function rejectReport(
  reportId: string,
  approverId: string,
  reason: string
): Promise<ServiceResponse<JobReport>> {
  try {
    const { data, error } = await supabase
      .from('job_reports')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', reportId)
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
 * Get report by instance
 */
export async function getReportByInstance(
  instanceId: string
): Promise<ServiceResponse<JobReport>> {
  try {
    const { data, error } = await supabase
      .from('job_reports')
      .select('*')
      .eq('job_instance_id', instanceId)
      .single();

    if (error) {
      return { success: false, error: error.message, code: 'NOT_FOUND' };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

export const reportService = {
  uploadPhotos,
  submitReport,
  approveReport,
  rejectReport,
  getReportByInstance
};
