export function validateJobPayload(payload) {
    const errors = [];
    if (!payload)
        return { valid: false, errors: ['missing_payload'] };
    if (!payload.job_name || typeof payload.job_name !== 'string' || payload.job_name.trim().length < 3) {
        errors.push('job_name_required');
    }
    if (!payload.priority) {
        errors.push('priority_required');
    }
    else if (!['low', 'medium', 'high'].includes(payload.priority)) {
        errors.push('priority_invalid');
    }
    if (payload.location && typeof payload.location === 'object') {
        const loc = payload.location;
        if (loc.radius && !(typeof loc.radius === 'number')) {
            errors.push('location_radius_must_be_number');
        }
    }
    // payment sanity checks
    if (payload.payment && typeof payload.payment === 'object') {
        const p = payload.payment;
        if (p.rate && (typeof p.rate !== 'number' || p.rate < 0))
            errors.push('payment_rate_invalid');
        if (p.currency && typeof p.currency !== 'string')
            errors.push('payment_currency_invalid');
    }
    // schedule conflict detection is a TODO for server-side transactional checks
    const valid = errors.length === 0;
    return { valid, errors };
}
export function validateRecurrence(rule) {
    const errors = [];
    if (!rule)
        return { valid: true, errors };
    if (!['daily', 'weekly', 'monthly', 'custom'].includes(rule.frequency))
        errors.push('recurrence_frequency_invalid');
    if (rule.interval && (typeof rule.interval !== 'number' || rule.interval < 1))
        errors.push('recurrence_interval_invalid');
    return { valid: errors.length === 0, errors };
}
export default { validateJobPayload, validateRecurrence };
