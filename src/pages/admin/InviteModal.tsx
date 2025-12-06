import { useState } from "react";
import { RoleSelector } from "../../components/workforce/RoleSelector";
import { CompanyRole } from "../../../server/corporate/companyUserService";

type Props = {
  onClose: () => void;
  onSubmit: (payload: { email: string; role: CompanyRole; expires_at: string }) => Promise<void>;
};

export default function InviteModal({ onClose, onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CompanyRole>("employee");
  const [expires, setExpires] = useState("2030-01-01");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await onSubmit({ email, role, expires_at: expires });
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Send Invite</h2>
          <button onClick={onClose}>×</button>
        </div>
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <label className="text-sm font-semibold">Expires At</label>
          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold mb-1 block">Role</label>
          <RoleSelector value={role} onChange={setRole} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit} disabled={loading}>
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
