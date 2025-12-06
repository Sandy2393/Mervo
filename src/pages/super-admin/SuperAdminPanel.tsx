/**
 * Super Admin Panel — Stub for super admin features
 * TODO: Implement with proper RLS and audit logging
 */


import { Card, CardBody } from '../../components/ui/Card';

export default function SuperAdminPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
        <p className="text-gray-600 mt-2">System administration and company management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companies */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Companies</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm">
              🔧 List, suspend, activate companies
            </div>
          </CardBody>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm">
              📊 View system audit trail
            </div>
          </CardBody>
        </Card>

        {/* User Management */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm">
              👥 List, edit, deactivate users
            </div>
          </CardBody>
        </Card>

        {/* Ownership Transfer */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Ownership Transfer</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm">
              🔄 Transfer company ownership
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded text-sm">
            ⚠️ These features are stubs and require super_admin RLS verification via Edge Functions
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
