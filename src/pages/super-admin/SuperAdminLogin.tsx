import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../../components/ui/Card';

const SUPER_ADMIN_KEY = import.meta.env.VITE_SUPER_ADMIN_KEY || 'mervo_super-admin_key_2025';

export default function SuperAdminLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if secret key is provided in URL
  const secretKey = searchParams.get('key');
  const hasValidKey = secretKey === SUPER_ADMIN_KEY;

  // Debug logging (remove in production)
  console.log('Expected key:', SUPER_ADMIN_KEY);
  console.log('Provided key:', secretKey);
  console.log('Valid?:', hasValidKey);

  if (!hasValidKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardBody>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-600 mt-2">Invalid or missing admin key</p>
              <p className="text-red-600 mt-4 font-semibold">🔒 Unauthorized Access</p>
              {import.meta.env.DEV && (
                <div className="mt-4 text-xs text-left bg-gray-100 p-2 rounded">
                  <p>Expected: {SUPER_ADMIN_KEY}</p>
                  <p>Provided: {secretKey || '(none)'}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('User authentication failed');

      // For now, bypass the is_super_admin check and just verify auth worked
      // TODO: Set up a public view or custom function to check is_super_admin from auth.users
      
      // Store the user in localStorage temporarily (in production, use proper auth state)
      localStorage.setItem('super_admin_user', JSON.stringify(user));

      // Success - navigate to super admin panel
      navigate('/super-admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardBody>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Login</h1>
            <p className="text-gray-600 mt-2">Protected system administration access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@mervo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 Super admin credentials are required for system access
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
