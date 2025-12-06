export const insertRating = `
  INSERT INTO ratings (job_instance_id, contractor_id, company_id, rater_user_id, stars, comment)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (job_instance_id, rater_user_id) DO UPDATE SET stars = EXCLUDED.stars, comment = EXCLUDED.comment
  RETURNING *;
`;

export const ratingSummary = `
  SELECT
    contractor_id,
    company_id,
    ROUND(AVG(stars)::numeric, 2) AS avg_rating,
    COUNT(*) AS rating_count,
    ROUND(AVG(stars) FILTER (WHERE created_at >= now() - interval '30 days')::numeric, 2) AS avg_30d,
    ROUND(AVG(stars) FILTER (WHERE created_at >= now() - interval '90 days')::numeric, 2) AS avg_90d
  FROM ratings
  WHERE contractor_id = $1 AND company_id = $2
  GROUP BY contractor_id, company_id;
`;

export const listRatingsByContractor = `
  SELECT * FROM ratings
  WHERE contractor_id = $1 AND company_id = $2
  ORDER BY created_at DESC
  LIMIT $3 OFFSET $4;
`;

export const insertFlag = `
  INSERT INTO rating_flags (rating_id, company_id, reporter_id, reason)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;
