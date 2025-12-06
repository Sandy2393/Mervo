const base = "/api";

type RatingPayload = {
  contractor_id: string;
  company_id: string;
  job_instance_id: string;
  rater_user_id: string;
  stars: number;
  comment?: string;
};

let lastSubmit = 0;

export async function recordRating(payload: RatingPayload) {
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
  if (!res.ok) throw new Error("Failed to record rating");
  return res.json();
}

export async function fetchRatingSummary(contractorId: string, companyId: string) {
  const res = await fetch(`${base}/ratings/${contractorId}?company_id=${companyId}`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function listRatings(contractorId: string, companyId: string, page: { limit: number; offset: number }) {
  const res = await fetch(`${base}/ratings/${contractorId}/list?company_id=${companyId}&limit=${page.limit}&offset=${page.offset}`);
  if (!res.ok) throw new Error("Failed to list ratings");
  return res.json();
}
