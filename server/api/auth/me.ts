import type { NextApiRequest, NextApiResponse } from 'next';

function isSuper(req: NextApiRequest) {
  const role = (req as any).user?.role || req.headers['x-role'];
  return role === 'super_admin' || role === 'superadmin';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  // Accept either a real authenticated user or header-based super-admin context
  const authedUser = (req as any).user;
  const headerUser = req.headers['x-user'];
  const role = (req as any).user?.role || req.headers['x-role'];
  const isSuperAdmin = role === 'super_admin' || role === 'superadmin';

  if (!authedUser && !headerUser && !isSuperAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    id: authedUser?.id || req.headers['x-user-id'] || null,
    email: authedUser?.email || (typeof headerUser === 'string' ? headerUser : null),
    is_super_admin: isSuperAdmin,
  });
}
