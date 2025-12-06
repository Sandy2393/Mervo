export const queries = {
  insertCompany: `INSERT INTO companies (name, slug, status) VALUES ($1, $2, $3) RETURNING *`,
  updateCompany: `UPDATE companies SET name = $2, slug = $3, status = $4, updated_at = NOW() WHERE id = $1 RETURNING *`,
  selectCompany: `SELECT * FROM companies WHERE id = $1`,
  listCompanies: `SELECT * FROM companies ORDER BY created_at DESC LIMIT $1 OFFSET $2`,

  insertUser: `INSERT INTO users (email, master_alias, display_name, status) VALUES ($1, $2, $3, $4) RETURNING *`,
  updateUser: `UPDATE users SET email = $2, display_name = $3, status = $4, updated_at = NOW() WHERE id = $1 RETURNING *`,
  softDeleteUser: `UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING *`,
  searchUsers: `SELECT * FROM users WHERE (email ILIKE $1 OR master_alias ILIKE $1) LIMIT $2`,

  insertCompanyUser: `INSERT INTO company_users (company_id, user_id, company_alias, role, status) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
  updateCompanyUserRole: `UPDATE company_users SET role = $3, updated_at = NOW() WHERE company_id = $1 AND user_id = $2 RETURNING *`,
  removeCompanyUser: `UPDATE company_users SET status = 'removed', updated_at = NOW() WHERE company_id = $1 AND user_id = $2 RETURNING *`,

  insertInvite: `INSERT INTO invites (company_id, email, role, expires_at, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
  selectInviteByToken: `SELECT i.* FROM invites i JOIN invite_tokens t ON i.id = t.invite_id WHERE t.token = $1 AND t.consumed_at IS NULL`,
  consumeInvite: `UPDATE invite_tokens SET consumed_at = NOW() WHERE token = $1`,
  insertInviteToken: `INSERT INTO invite_tokens (token, invite_id) VALUES ($1, $2)`,

  insertAudit: `INSERT INTO audit_logs (actor_user_id, company_id, action, target) VALUES ($1,$2,$3,$4)`,
};
