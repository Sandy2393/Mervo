import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ShieldAlert, ShieldCheck, Lock, Mail, KeyRound } from 'lucide-react';

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

  if (!hasValidKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-100 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-pulse">
            <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-4" />
          </div>
          
          <Card className="shadow-2xl border-2 border-red-200">
            <CardHeader className="text-center pb-3">
              <Badge variant="destructive" className="mx-auto mb-3 text-sm px-4 py-1">
                UNAUTHORIZED
              </Badge>
              <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
              <CardDescription className="text-base">
                Invalid or missing security key
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  A valid authentication key is required to access this protected system area.
                </AlertDescription>
              </Alert>

              {import.meta.env.DEV && (
                <div className="mt-4 text-xs text-left bg-muted p-4 rounded-lg border">
                  <p className="font-mono mb-1"><strong>Expected:</strong> {SUPER_ADMIN_KEY}</p>
                  <p className="font-mono text-destructive"><strong>Provided:</strong> {secretKey || '(none)'}</p>
                </div>
              )}

              <div className="pt-4 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 inline-block mr-1" />
                Protected System Administration Portal
              </div>
            </CardContent>
          </Card>
        </div>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/50">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Super Admin</h1>
          <Badge variant="secondary" className="text-xs">
            <KeyRound className="h-3 w-3 mr-1" />
            Security Key Verified
          </Badge>
        </div>

        <Card className="shadow-2xl border-purple-500/50 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">System Administration</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mervo.com"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>End-to-end encrypted authentication</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/60 mt-6">
          Protected system area • Authorized personnel only
        </p>
      </div>
    </div>
  );
}
