import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { accountLinkService } from '../../services/accountLinkService';
// companyService import not needed here yet
import { Card, CardBody } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function AccountLinkingSettingsPage() {
  const { user } = useAuth();
  const [linked, setLinked] = useState<any[]>([]);
  const [newAccountId, setNewAccountId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const res = await accountLinkService.listLinkedAccounts(user.id);
      if (res.success && res.data) setLinked(res.data);
    };
    load();
  }, [user]);

  const onAdd = async () => {
    if (!user) return;
    setMessage(null);
    const res = await accountLinkService.linkAccounts(user.id, newAccountId);
    if (res.success) {
      setMessage('Linked');
      const updated = await accountLinkService.listLinkedAccounts(user.id);
      if (updated.success && updated.data) setLinked(updated.data);
      setNewAccountId('');
    } else {
      setMessage(res.error || 'Failed');
    }
  };

  const onUnlink = async (id: string) => {
    const res = await accountLinkService.unlinkAccount(id);
    if (res.success) {
      setLinked(linked.filter(l => l.id !== id));
    } else {
      setMessage(res.error || 'Failed to unlink');
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Account Linking</h2>

      <Card>
        <CardBody>
          <div className="mb-4">
            <div className="text-sm text-gray-600">Master account</div>
            <div className="font-medium">{user?.email || user?.id}</div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Linked Accounts</h3>
            {linked.length === 0 && <div className="text-sm text-gray-500">No linked accounts</div>}
            <div className="space-y-2">
              {linked.map(l => (
                <div key={l.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{l.linked_account_id}</div>
                    <div className="text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => onUnlink(l.id)}>Unlink</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input placeholder="other-account@domain" value={newAccountId} onChange={e => setNewAccountId(e.target.value)} />
              <Button onClick={onAdd}>Link</Button>
            </div>

            {message && <div className="text-sm text-gray-700 mt-2">{message}</div>}
          </div>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-medium">Company Identities</h3>
        <div className="text-sm text-gray-600 mt-2">TODO: list company_user aliases for this master account</div>
      </div>
    </div>
  );
}
