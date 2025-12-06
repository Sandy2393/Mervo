import { insertFlag, insertRating, listRatingsByContractor, ratingSummary } from "./sql/queries";

type DBClient = {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
};

const defaultDb: DBClient = {
  query: async () => {
    throw new Error("DB client not configured");
  },
};

export type RatingInput = {
  job_instance_id: string;
  contractor_id: string;
  company_id: string;
  rater_user_id: string;
  stars: number;
  comment?: string;
};

export type RatingSummary = {
  contractor_id: string;
  company_id: string;
  avg_rating: number;
  rating_count: number;
  avg_30d: number | null;
  avg_90d: number | null;
};

export async function recordRating(input: RatingInput, db: DBClient = defaultDb): Promise<RatingSummary> {
  if (input.stars < 1 || input.stars > 5) {
    throw new Error("stars must be between 1 and 5");
  }
  await db.query(insertRating, [
    input.job_instance_id,
    input.contractor_id,
    input.company_id,
    input.rater_user_id,
    input.stars,
    input.comment ?? null,
  ]);
  const summary = await getRatingSummary(input.contractor_id, input.company_id, db);
  return summary;
}

export async function getRatingSummary(contractor_id: string, company_id: string, db: DBClient = defaultDb): Promise<RatingSummary> {
  const result = await db.query(ratingSummary, [contractor_id, company_id]);
  if (!result.rows.length) {
    return {
      contractor_id,
      company_id,
      avg_rating: 0,
      rating_count: 0,
      avg_30d: null,
      avg_90d: null,
    };
  }
  return result.rows[0];
}

export async function listRatings(contractor_id: string, company_id: string, page: { limit: number; offset: number }, db: DBClient = defaultDb) {
  const limit = Math.min(page.limit, 100);
  const offset = page.offset ?? 0;
  const result = await db.query(listRatingsByContractor, [contractor_id, company_id, limit, offset]);
  return result.rows;
}

export async function flagRating(rating_id: string, reason: string, reporter_id: string, company_id: string, db: DBClient = defaultDb) {
  if (!reason) throw new Error("reason required");
  const result = await db.query(insertFlag, [rating_id, company_id, reporter_id, reason]);
  return result.rows[0];
}
