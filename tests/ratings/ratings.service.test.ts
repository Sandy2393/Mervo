// @ts-nocheck
import { recordRating, getRatingSummary, listRatings } from "../../server/ratings/service";

const makeDb = () => {
  const rows: any[] = [];
  return {
    rows,
    async query(text: string, params: any[]) {
      if (text.includes("INSERT INTO ratings")) {
        const [job_instance_id, contractor_id, company_id, rater_user_id, stars, comment] = params;
        const existing = rows.find((r) => r.job_instance_id === job_instance_id && r.rater_user_id === rater_user_id);
        if (existing) {
          existing.stars = stars;
          existing.comment = comment;
        } else {
          rows.push({ id: `${rows.length + 1}`, job_instance_id, contractor_id, company_id, rater_user_id, stars, comment, created_at: new Date() });
        }
        return { rows: [rows[rows.length - 1]] };
      }
      if (text.includes("FROM ratings")) {
        const contractor_id = params[0];
        const company_id = params[1];
        const filtered = rows.filter((r) => r.contractor_id === contractor_id && r.company_id === company_id);
        const rating_count = filtered.length;
        const avg = rating_count ? filtered.reduce((acc, r) => acc + r.stars, 0) / rating_count : 0;
        const summary = {
          contractor_id,
          company_id,
          avg_rating: Number(avg.toFixed(2)),
          rating_count,
          avg_30d: rating_count ? Number(avg.toFixed(2)) : null,
          avg_90d: rating_count ? Number(avg.toFixed(2)) : null,
        };
        return { rows: [summary] };
      }
      if (text.includes("ORDER BY created_at DESC")) {
        return { rows: [...rows] };
      }
      return { rows: [] };
    },
  } as any;
};

test("record and summarize ratings", async () => {
  const db = makeDb();
  await recordRating({ job_instance_id: "job1", contractor_id: "c1", company_id: "co", rater_user_id: "u1", stars: 5 }, db);
  await recordRating({ job_instance_id: "job2", contractor_id: "c1", company_id: "co", rater_user_id: "u2", stars: 3 }, db);
  const summary = await getRatingSummary("c1", "co", db);
  expect(summary.avg_rating).toBeCloseTo(4);
  expect(summary.rating_count).toBe(2);
});

test("list ratings", async () => {
  const db = makeDb();
  await recordRating({ job_instance_id: "job1", contractor_id: "c1", company_id: "co", rater_user_id: "u1", stars: 4 }, db);
  const list = await listRatings("c1", "co", { limit: 10, offset: 0 }, db);
  expect(list.length).toBeGreaterThan(0);
});
