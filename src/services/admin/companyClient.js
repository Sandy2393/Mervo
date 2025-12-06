export async function fetchCompanies() {
    const res = await fetch("/api/companies");
    if (!res.ok)
        throw new Error("Failed to load companies");
    return res.json();
}
export async function createCompany(payload) {
    const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok)
        throw new Error("Failed to create company");
    return res.json();
}
export async function updateCompany(id, payload) {
    const res = await fetch(`/api/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok)
        throw new Error("Failed to update company");
    return res.json();
}
