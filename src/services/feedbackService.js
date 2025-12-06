// Stubbed feedback service. TODO: Wire actual endpoints and storage.
export async function submitFeedback(company_id, user_id, type, message, metadata = {}) {
    // TODO: Implement POST /feedback
    return {
        id: "fb-temp-1",
        company_id,
        user_id,
        type,
        message,
        metadata,
        status: "open",
        created_at: new Date().toISOString(),
    };
}
export async function listFeedback(company_id, filters = {}) {
    // TODO: Implement GET /feedback?company_id=&status=&type=
    return [
        {
            id: "fb-temp-1",
            company_id,
            user_id: "user-1",
            type: filters.type || "bug",
            message: "Placeholder feedback",
            metadata: { source: "stub" },
            status: filters.status || "open",
            created_at: new Date().toISOString(),
        },
    ];
}
export async function markResolved(feedbackId, resolverId) {
    // TODO: Implement PATCH /feedback/:id
    return {
        id: feedbackId,
        company_id: "company-1",
        user_id: "user-1",
        type: "bug",
        message: "Resolved placeholder",
        metadata: { source: "stub" },
        status: "resolved",
        created_at: new Date().toISOString(),
        resolved_by: resolverId,
        resolved_at: new Date().toISOString(),
    };
}
// TODO: Create backend endpoints and Supabase table (see supabase/feedback_table.sql)
