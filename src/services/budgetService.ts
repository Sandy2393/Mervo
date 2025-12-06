// Budget service placeholders. TODO: Persist to Supabase or settings table.

interface Budget {
  company_id: string;
  currency: string;
  monthlyAmount: number; // in currency units
}

const memoryStore = new Map<string, Budget>();

export async function setBudget(company_id: string, currency: string, monthlyAmount: number): Promise<Budget> {
  const budget: Budget = { company_id, currency, monthlyAmount };
  memoryStore.set(company_id, budget);
  return budget;
}

export async function getBudget(company_id: string): Promise<Budget | undefined> {
  return memoryStore.get(company_id);
}

export async function checkBudget(company_id: string): Promise<{ used: number; remaining: number; percent: number }> {
  const budget = memoryStore.get(company_id);
  const used = 500; // TODO: fetch from cost reports per company
  if (!budget) return { used, remaining: 0, percent: 0 };
  const remaining = Math.max(budget.monthlyAmount - used, 0);
  const percent = budget.monthlyAmount ? (used / budget.monthlyAmount) * 100 : 0;
  // TODO: Trigger alert hook if percent > threshold
  return { used, remaining, percent };
}
