import { useEffect, useState } from "react";
import { listWorkforce, inviteUser, importCsvPreview, importCsvCommit } from "../../services/admin/workforceClient";
import { UserCard } from "../../components/workforce/UserCard";
import { RoleSelector } from "../../components/workforce/RoleSelector";
import InviteModal from "./InviteModal";
import CsvImportPreview from "./CsvImportPreview";

interface WorkforceProps {
  companyId: string;
}

export default function Workforce({ companyId }: WorkforceProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInvite, setShowInvite] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  useEffect(() => {
    listWorkforce(companyId)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [companyId]);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch = (u.company_alias || "").includes(search.toLowerCase()) || (u.email || "").includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <input
            className="border px-3 py-2 rounded"
            placeholder="Search workforce"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="border px-3 py-2 rounded" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
            <option value="employee">Employees</option>
            <option value="contractor">Contractors</option>
            <option value="viewer">Viewers</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" onClick={() => setShowCsv(true)}>
            Import CSV
          </button>
          <a className="px-3 py-2 border rounded" href={`/api/companies/${companyId}/workforce?format=csv`}>
            Export CSV
          </a>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setShowInvite(true)}>
            Send Invite
          </button>
        </div>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((u) => (
          <UserCard key={u.id} name={u.company_alias} email={u.email} role={u.role} status={u.status} />
        ))}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSubmit={async (payload) => {
            await inviteUser({ ...payload, company_id: companyId });
            setShowInvite(false);
          }}
        />
      )}

      {showCsv && (
        <CsvImportPreview
          onClose={() => setShowCsv(false)}
          onPreview={(file) => importCsvPreview(companyId, file)}
          onCommit={(file) => importCsvCommit(companyId, file)}
        />
      )}
    </div>
  );
}
