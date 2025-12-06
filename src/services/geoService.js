/**
 * Geo Service
 * Geofencing validation and GPS override request handling
 *
 * Simple Haversine distance calculation for on-premise job verification.
 */
import { supabase } from '../lib/supabase';
/**
 * Haversine formula to calculate distance between two lat/lng points
 * @param pointA - { lat: number, lng: number }
 * @param pointB - { lat: number, lng: number }
 * @param meters - Acceptable radius in meters
 * @returns true if distance <= meters
 */
export function isWithinRadius(pointA, pointB, meters) {
    const R = 6371000; // Earth radius in meters
    const φ1 = (pointA.lat * Math.PI) / 180;
    const φ2 = (pointB.lat * Math.PI) / 180;
    const Δφ = ((pointB.lat - pointA.lat) * Math.PI) / 180;
    const Δλ = ((pointB.lng - pointA.lng) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= meters;
}
/**
 * Request geofence override (when contractor is outside job location radius)
 * Creates a pending approval request that manager can approve/reject
 *
 * TODO: Server-side logic should:
 * 1. Notify manager/owner of pending override request
 * 2. Check for previous overrides on same contractor (rate limiting)
 * 3. Log audit trail
 */
export async function handleGpsForgiveness(instanceId, userId, reason) {
    try {
        const { data, error } = await supabase
            .from('geofence_overrides')
            .insert({
            job_instance_id: instanceId,
            user_id: userId,
            reason,
            status: 'pending',
            requested_at: new Date().toISOString()
        })
            .select()
            .single();
        if (error) {
            return { success: false, error: error.message, code: 'DB_ERROR' };
        }
        // TODO: Send notification to company managers
        // await notificationService.notifyManagers(company_id, `Geofence override requested`);
        return { success: true, data };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
/**
 * Approve a geofence override request
 * @param overrideId - Override request ID
 * @param approverId - Manager/owner user ID
 */
export async function approveOverride(overrideId, approverId) {
    try {
        const { data, error } = await supabase
            .from('geofence_overrides')
            .update({
            status: 'approved',
            reviewed_by: approverId,
            reviewed_at: new Date().toISOString()
        })
            .eq('id', overrideId)
            .select()
            .single();
        if (error) {
            return { success: false, error: error.message, code: 'DB_ERROR' };
        }
        return { success: true, data };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
/**
 * Reject a geofence override request
 * @param overrideId - Override request ID
 * @param approverId - Manager/owner user ID
 */
export async function rejectOverride(overrideId, approverId) {
    try {
        const { data, error } = await supabase
            .from('geofence_overrides')
            .update({
            status: 'rejected',
            reviewed_by: approverId,
            reviewed_at: new Date().toISOString()
        })
            .eq('id', overrideId)
            .select()
            .single();
        if (error) {
            return { success: false, error: error.message, code: 'DB_ERROR' };
        }
        return { success: true, data };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
/**
 * Get pending overrides for a company
 */
export async function getPendingOverrides(_company_id) {
    try {
        // TODO: Join with job_instances to filter by company_id
        const { data, error } = await supabase
            .from('geofence_overrides')
            .select('*')
            .eq('status', 'pending')
            .order('requested_at', { ascending: false });
        if (error) {
            return { success: false, error: error.message, code: 'DB_ERROR' };
        }
        return { success: true, data: data || [] };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg, code: 'EXCEPTION' };
    }
}
export const geoService = {
    isWithinRadius,
    handleGpsForgiveness,
    approveOverride,
    rejectOverride,
    getPendingOverrides
};
