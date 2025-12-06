import { auditService } from '../services/auditService';
/** Lightweight wrapper for recording audit events consistently from UI/services
 * TODO: For security this should be executed on server-side to prevent user tampering.
 */
export async function recordAudit(companyId, actorId, action, target, details) {
    // actorId currently optional – server side should bind actor from session
    try {
        await auditService.record(companyId, action, target, { ...details, actor: actorId });
    }
    catch (err) {
        // swallow – auditing should not block user flows
        console.warn('Audit record failed', err);
    }
}
export default { recordAudit };
