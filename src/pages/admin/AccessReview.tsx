import { useEffect, useState } from "react";

interface UserRow {
  user_account_id: string;
  email: string;
  company_id: string;
  role: string;
  last_login: string;
  active: boolean;
  reviewed?: boolean;
}

const placeholderUsers: UserRow[] = [
  {
    user_account_id: "u-1",
    email: "admin@example.com",
    company_id: "company-1",
    role: "admin",
    last_login: new Date().toISOString(),
    active: true,
  },
  {
    user_account_id: "u-2",
    email: "ops@example.com",
    company_id: "company-1",
    role: "ops",
    last_login: new Date(Date.now() - 86400000).toISOString(),
    active: true,
  },
];

export default function AccessReview() {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    // TODO: Fetch from backend listing company_users with roles/last_login
    setUsers(placeholderUsers);
  }, []);

  const toggleReviewed = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.user_account_id === id ? { ...u, reviewed: !u.reviewed } : u)));
  };

  const markRecertified = () => {
    // TODO: send recertification event to backend and audit logs
    alert("Recertified (placeholder)");
  };

  const exportCsv = () => {
    const header = "user_account_id,email,company_id,role,last_login,active,reviewed\n";
    const rows = users
      .map((u) => `${u.user_account_id},${u.email},${u.company_id},${u.role},${u.last_login},${u.active},${!!u.reviewed}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access_review_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Access Review</h1>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded" onClick={exportCsv}>Export CSV</button>
          <button className="px-3 py-1 border rounded" onClick={markRecertified}>Mark Recertified</button>
        </div>
      </header>

      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Company</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Last Login</th>
            <th className="p-2 text-left">Active</th>
            <th className="p-2 text-left">Reviewed</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_account_id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.company_id}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.last_login}</td>
              <td className="p-2">{u.active ? "Yes" : "No"}</td>
              <td className="p-2">
                <input type="checkbox" checked={!!u.reviewed} onChange={() => toggleReviewed(u.user_account_id)} />
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="p-2" colSpan={6}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
