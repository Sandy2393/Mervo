import { CompanyRole } from "../../../server/corporate/companyUserService";

type Props = {
  name: string;
  email?: string;
  role: CompanyRole;
  status?: string;
  onClick?: () => void;
};

export function UserCard({ name, email, role, status, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border rounded-lg p-4 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          {email && <div className="text-sm text-gray-600">{email}</div>}
        </div>
        <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 uppercase">{role}</div>
      </div>
      {status && <div className="mt-2 text-xs text-gray-500">{status}</div>}
    </button>
  );
}
