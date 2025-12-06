import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsernameField from '../../components/form/UsernameField';
import PasswordField from '../../components/form/PasswordField';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { loginWithMasterId } from '../../services/auth/login';
import { useAuth } from '../../context/AuthContext';
import { ENV } from '../../config/env';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) return setError('Fill both fields');

    // forbid @ in the input as requested per UI spec — canonicalization handled by service
    if (username.includes('@')) return setError('Enter the username only (no @)');

    try {
      setLoading(true);

      // Use login service which accepts bare username and appends app tag
      const resp = await loginWithMasterId(username, password);
      if (!resp.success) {
        setError(resp.error || 'Login failed');
        return;
      }

      // persist in global auth context if available
      if (login) await login(`${username}@${ENV.APP_TAG}`, password);

      // Decide where to route the user
      const role = resp.data?.primaryRole;
      const companies = resp.data?.companies || [];

      if (role === 'contractor') {
        navigate('/contractor');
        return;
      }

      // corporate roles - if multiple, show selector
      if (companies.length > 1) {
        navigate('/select-company');
      } else if (companies.length === 1) {
        // route to corporate dashboard — keep AuthContext to set active company
        navigate('/corporate');
      } else {
        setError('No connected company found for this account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Card className="max-w-md w-full">
        <CardBody>
          <h2 className="text-2xl font-semibold mb-4">Sign in to Mervo</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <UsernameField value={username} onChange={(e) => setUsername(e.target.value)} />
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" isLoading={loading} className="w-full">Sign in</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
