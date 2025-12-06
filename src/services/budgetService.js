// Budget service placeholders. TODO: Persist to Supabase or settings table.
const memoryStore = new Map();
export async function setBudget(company_id, currency, monthlyAmount) {
    const budget = { company_id, currency, monthlyAmount };
    memoryStore.set(company_id, budget);
    return budget;
}
export async function getBudget(company_id) {
    return memoryStore.get(company_id);
}
export async function checkBudget(company_id) {
    const budget = memoryStore.get(company_id);
    const used = 500; // TODO: fetch from cost reports per company
    if (!budget)
        return { used, remaining: 0, percent: 0 };
    const remaining = Math.max(budget.monthlyAmount - used, 0);
    const percent = budget.monthlyAmount ? (used / budget.monthlyAmount) * 100 : 0;
    // TODO: Trigger alert hook if percent > threshold
    return { used, remaining, percent };
}
