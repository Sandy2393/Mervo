export const insertNotification = `
  INSERT INTO notifications (company_id, type, channel, recipient, payload, template_id, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;
`;

export const insertAttempt = `
  INSERT INTO notification_attempts (notification_id, provider, attempt_number, status, error, response)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`;

export const listTemplates = `
  SELECT * FROM notification_templates WHERE company_id = $1 ORDER BY updated_at DESC;
`;

export const upsertTemplate = `
  INSERT INTO notification_templates (company_id, type, channel, subject, body_html, body_text, active)
  VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
  ON CONFLICT (company_id, type, channel)
  DO UPDATE SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, active = EXCLUDED.active, updated_at = now()
  RETURNING *;
`;
