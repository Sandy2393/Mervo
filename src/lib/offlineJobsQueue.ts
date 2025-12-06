/**
 * Offline Jobs Queue
 * Dexie-based queue for job-related actions
 * 
 * Actions supported:
 * - CLOCK_IN: Clock into a job
 * - CLOCK_OUT: Clock out of a job
 * - UPLOAD_PHOTO: Queue photo for upload
 * - SUBMIT_REPORT: Submit job completion report
 * - REQUEST_OVERRIDE: Request geofence override
 */

import { QueuedAction } from '../types';

export interface OfflineJobAction extends QueuedAction {
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'UPLOAD_PHOTO' | 'SUBMIT_REPORT' | 'REQUEST_OVERRIDE';
}

/**
 * Queue a clock-in action
 * @param instanceId - Job instance ID
 * @param userId - User ID
 * @param geoData - GPS coordinates
 * @returns Action ID
 */
export function queueClockIn(
  instanceId: string,
  userId: string,
  geoData?: { lat: number; lng: number }
): string {
  const id = `clock_in_${Date.now()}`;
  const action: OfflineJobAction = {
    id,
    type: 'CLOCK_IN',
    payload: {
      instanceId,
      userId,
      geoData,
      timestamp: new Date().toISOString()
    },
    timestamp: Date.now(),
    retries: 0,
    status: 'pending'
  };
  // TODO: Insert into dexie queue
  console.log('Queue CLOCK_IN action:', action);
  return id;
}

/**
 * Queue a clock-out action
 */
export function queueClockOut(
  instanceId: string,
  userId: string,
  geoData?: { lat: number; lng: number }
): string {
  const id = `clock_out_${Date.now()}`;
  const action: OfflineJobAction = {
    id,
    type: 'CLOCK_OUT',
    payload: {
      instanceId,
      userId,
      geoData,
      timestamp: new Date().toISOString()
    },
    timestamp: Date.now(),
    retries: 0,
    status: 'pending'
  };
  // TODO: Insert into dexie queue
  console.log('Queue CLOCK_OUT action:', action);
  return id;
}

/**
 * Queue a photo upload
 */
export function queuePhotoUpload(
  instanceId: string,
  userId: string,
  photoBlob: Blob
): string {
  const id = `photo_${Date.now()}`;
  const action: OfflineJobAction = {
    id,
    type: 'UPLOAD_PHOTO',
    payload: {
      instanceId,
      userId,
      photoBlob: photoBlob,
      size: photoBlob.size,
      type: photoBlob.type
    },
    timestamp: Date.now(),
    retries: 0,
    status: 'pending'
  };
  // TODO: Insert into dexie queue
  console.log('Queue UPLOAD_PHOTO action:', action);
  return id;
}

/**
 * Queue report submission
 */
export function queueSubmitReport(
  instanceId: string,
  userId: string,
  reportData: {
    answers?: Record<string, unknown>;
    notes?: string;
    duration_seconds?: number;
    photoIds?: string[];
  }
): string {
  const id = `report_${Date.now()}`;
  const action: OfflineJobAction = {
    id,
    type: 'SUBMIT_REPORT',
    payload: {
      instanceId,
      userId,
      ...reportData
    },
    timestamp: Date.now(),
    retries: 0,
    status: 'pending'
  };
  // TODO: Insert into dexie queue
  console.log('Queue SUBMIT_REPORT action:', action);
  return id;
}

/**
 * Queue geofence override request
 */
export function queueOverrideRequest(
  instanceId: string,
  userId: string,
  reason: string
): string {
  const id = `override_${Date.now()}`;
  const action: OfflineJobAction = {
    id,
    type: 'REQUEST_OVERRIDE',
    payload: {
      instanceId,
      userId,
      reason
    },
    timestamp: Date.now(),
    retries: 0,
    status: 'pending'
  };
  // TODO: Insert into dexie queue
  console.log('Queue REQUEST_OVERRIDE action:', action);
  return id;
}

/**
 * Sync a pending action to server (with retry logic)
 * Called by sync worker on online event
 * 
 * TODO: Implement exponential backoff:
 * - Retry 1: 1 second
 * - Retry 2: 2 seconds
 * - Retry 3: 4 seconds
 * - Retry 4: 8 seconds
 * - Max retries: 5
 */
export async function syncAction(action: OfflineJobAction): Promise<boolean> {
  try {
    // Dispatch action to appropriate service based on type
    switch (action.type) {
      case 'CLOCK_IN':
        // await timesheetService.clockIn(...)
        console.log('Syncing CLOCK_IN:', action.payload);
        break;
      case 'CLOCK_OUT':
        // await timesheetService.clockOut(...)
        console.log('Syncing CLOCK_OUT:', action.payload);
        break;
      case 'UPLOAD_PHOTO':
        // await reportService.uploadPhotos(...)
        console.log('Syncing UPLOAD_PHOTO:', action.payload);
        break;
      case 'SUBMIT_REPORT':
        // await reportService.submitReport(...)
        console.log('Syncing SUBMIT_REPORT:', action.payload);
        break;
      case 'REQUEST_OVERRIDE':
        // await geoService.handleGpsForgiveness(...)
        console.log('Syncing REQUEST_OVERRIDE:', action.payload);
        break;
    }
    return true;
  } catch (error) {
    console.error('Sync failed for action:', action.id, error);
    return false;
  }
}

export const offlineJobsQueue = {
  queueClockIn,
  queueClockOut,
  queuePhotoUpload,
  queueSubmitReport,
  queueOverrideRequest,
  syncAction
};
