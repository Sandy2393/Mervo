import type { NextApiRequest, NextApiResponse } from 'next';

function isSuper(req: NextApiRequest) {
  const role = (req as any).user?.role || req.headers['x-role'];
  return role === 'super_admin' || role === 'superadmin';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const authed = (req as any).user || req.headers['x-user'];
  if (!authed) return res.status(401).json({ error: 'Unauthorized' });
  return res.status(200).json({ id: (req as any).user?.id || null, email: (req as any).user?.email || null, is_super_admin: isSuper(req) });
}
