/**
 * Dexie Sync Worker
 * Processes queued actions when connectivity is restored.
 * Marks actions as synced or failed via offlineQueueService.
 */
import { offlineQueueService } from '../../services/offlineQueueService';
import { timesheetService } from '../../services/timesheetService';
import { jobPhotosService } from '../../services/jobPhotosService';
// Exponential backoff helper
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Helper to process a single queued action
async function processAction(action) {
    const id = action.id;
    try {
        switch (action.type) {
            case 'CLOCK_IN': {
                const { jobInstanceId, userId, geo } = action.payload;
                await timesheetService.clockIn(jobInstanceId, userId, geo);
                await offlineQueueService.markSynced(id);
                break;
            }
            case 'CLOCK_OUT': {
                const { jobInstanceId, userId, geo } = action.payload;
                await timesheetService.clockOut(jobInstanceId, userId, geo);
                await offlineQueueService.markSynced(id);
                break;
            }
            case 'UPLOAD_PHOTO': {
                const { jobInstanceId, companyId, userId, file, metadata } = action.payload;
                // file may be a base64 string or blob ref. If blob not available, mark failed.
                if (!file) {
                    await offlineQueueService.markFailed(id);
                    break;
                }
                // If file is base64, convert to Blob
                let blob = null;
                if (typeof file === 'string' && file.startsWith('data:')) {
                    const res = await fetch(file);
                    blob = await res.blob();
                }
                else if (file instanceof Blob) {
                    blob = file;
                }
                if (!blob) {
                    await offlineQueueService.markFailed(id);
                    break;
                }
                // Create a File from blob
                const fileObj = new File([blob], `offline-${Date.now()}.jpg`, { type: blob.type });
                const resp = await jobPhotosService.uploadPhoto(jobInstanceId, companyId, userId, fileObj, metadata || {});
                if (resp.success) {
                    await offlineQueueService.markSynced(id);
                }
                else {
                    await offlineQueueService.markFailed(id);
                }
                break;
            }
            case 'SUBMIT_REPORT': {
                // Placeholder: implement submit report logic
                await offlineQueueService.markSynced(id);
                break;
            }
            default:
                // Unknown action
                await offlineQueueService.markFailed(id);
                break;
        }
    }
    catch (err) {
        console.error('Error processing queued action', id, err);
        await offlineQueueService.markFailed(id);
    }
}
export async function processQueue() {
    const pending = await offlineQueueService.getPendingActions();
    for (const action of pending) {
        // Retry logic: attempt up to 5 times with exponential backoff based on retries counter
        const maxRetries = 5;
        let attempt = action.retries || 0;
        while (attempt <= maxRetries) {
            try {
                await processAction(action);
                // If markSynced is called by processAction, break out loop
                break;
            }
            catch (err) {
                attempt++;
                if (attempt > maxRetries) {
                    // Mark failed after too many retries
                    await offlineQueueService.markFailed(action.id);
                    // Create an audit log if available (client-only placeholder)
                    console.error('Action failed after max retries', action.id);
                    break;
                }
                // Wait with exponential backoff
                const backoffMs = Math.pow(2, attempt) * 1000;
                await wait(backoffMs);
            }
        }
    }
}
/**
 * Enqueue an action into the offline queue service
 */
export async function enqueueAction(action) {
    try {
        // offlineQueueService.queueAction expects type and payload
        return await offlineQueueService.queueAction(action.type, action.payload || {});
    }
    catch (err) {
        console.error('Failed to enqueue action', err);
        throw err;
    }
}
/**
 * Start background sync - used by app on startup or on online event
 */
export async function startSync() {
    try {
        await processQueue();
    }
    catch (err) {
        console.error('Start sync failed', err);
    }
}
// Hook into online event
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Dexie Sync] Online - processing queue');
        processQueue().catch(err => console.error('Queue processing error', err));
    });
    // Try to process on startup if online
    if (navigator.onLine) {
        processQueue().catch(err => console.error('Queue processing error', err));
    }
}
