import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UsernameField from '../components/form/UsernameField';
import PasswordField from '../components/form/PasswordField';
import { Button } from '../components/ui/button';
import { Card, CardBody } from '../components/ui/card';
import { authService } from '../services/authService';

export default function CorporateLoginPage() {
  const navigate = useNavigate();
  const { login, devBypassLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const devBypassEnabled = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS === 'true';

  const handleDevBypass = async () => {
    if (!devBypassEnabled || !devBypassLogin) return;
    try {
      setLoading(true);
      setError(null);
      await devBypassLogin('corporate');
      navigate('/select-company');
    } catch (err) {
      setError('Dev bypass failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) return setError('Please fill in both fields');

    try {
      setLoading(true);
      await login(username, password);

      // After login, fetch current user id and company affiliations directly
      const me = await authService.getCurrentUser();
      if (!me.success || !me.data) {
        setError('Failed to determine user after login');
        await authService.logout();
        return;
      }

      const companies = await authService.getUserCompanies(me.data.id);
      const roles = (companies.data || []).map((c: any) => c.role);
      const nonContractor = roles.some((r: any) => r && r !== 'contractor');
      const onlyContractor = roles.length === 1 && roles[0] === 'contractor';

      if (onlyContractor) {
        setError('This account is contractor-only. Use the contractor login.');
        await authService.logout();
        return;
      }

      if (!nonContractor) {
        setError('No corporate roles found for this account');
        await authService.logout();
        return;
      }

      navigate('/select-company');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardBody>
          <h2 className="text-2xl font-semibold mb-4">Corporate Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <UsernameField value={username} onChange={(e) => setUsername(e.target.value)} />
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" isLoading={loading} className="w-full">Sign In</Button>
            {devBypassEnabled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDevBypass}
                className="w-full"
                disabled={loading}
              >
                Dev quick access
              </Button>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
