export async function can(userId, companyId, permission) {
    if (!userId || !companyId || !permission)
        return false;
    try {
        const resp = await fetch("/api/permissions/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": userId,
                "x-company-id": companyId,
            },
            body: JSON.stringify({ company_id: companyId, permission }),
        });
        if (!resp.ok)
            return false;
        const data = await resp.json();
        return Boolean(data.allowed);
    }
    catch (err) {
        console.error("can() check failed", err);
        return false;
    }
}
export function filterByPermission(items, allowed) {
    return items.filter((item) => allowed.includes(item.permission));
}
