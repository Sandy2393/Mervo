import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UsernameField from '../components/form/UsernameField';
import PasswordField from '../components/form/PasswordField';
import { Button } from '../components/ui/button';
import { Card, CardBody } from '../components/ui/card';
import { authService } from '../services/authService';

export default function ContractorLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) return setError('Please fill in both fields');

    try {
      setLoading(true);
      await login(username, password);

      const me = await authService.getCurrentUser();
      if (!me.success || !me.data) {
        setError('Failed to determine user after login');
        await authService.logout();
        return;
      }

      const companies = await authService.getUserCompanies(me.data.id);
      const roles = (companies.data || []).map((c: any) => c.role);
      const onlyContractor = roles.length === 1 && roles[0] === 'contractor';

      if (!onlyContractor) {
        setError('This login is not contractor-only. Use the corporate login.');
        await authService.logout();
        return;
      }

      // proceed to contractor dashboard
      navigate('/dashboard');
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
          <h2 className="text-2xl font-semibold mb-4">Contractor Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <UsernameField value={username} onChange={(e) => setUsername(e.target.value)} />
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" isLoading={loading} className="w-full">Sign In</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
