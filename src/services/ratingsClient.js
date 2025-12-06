const base = "/api";
let lastSubmit = 0;
export async function recordRating(payload) {
    const now = Date.now();
    if (now - lastSubmit < 2000) {
        throw new Error("Please wait before submitting another rating");
    }
    lastSubmit = now;
    const res = await fetch(`${base}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok)
        throw new Error("Failed to record rating");
    return res.json();
}
export async function fetchRatingSummary(contractorId, companyId) {
    const res = await fetch(`${base}/ratings/${contractorId}?company_id=${companyId}`);
    if (!res.ok)
        throw new Error("Failed to fetch summary");
    return res.json();
}
export async function listRatings(contractorId, companyId, page) {
    const res = await fetch(`${base}/ratings/${contractorId}/list?company_id=${companyId}&limit=${page.limit}&offset=${page.offset}`);
    if (!res.ok)
        throw new Error("Failed to list ratings");
    return res.json();
}
