import { CompanyRole } from "../../../server/corporate/companyUserService";

const permissions: Record<CompanyRole, string[]> = {
  owner: ["manage billing", "manage roles", "edit settings"],
  admin: ["manage users", "manage roles", "view billing"],
  manager: ["edit users", "view billing"],
  employee: ["view own", "view team"],
  contractor: ["view own"],
  viewer: ["view only"],
};

type Props = {
  value: CompanyRole;
  onChange: (role: CompanyRole) => void;
};

export function RoleSelector({ value, onChange }: Props) {
  const roles: CompanyRole[] = ["owner", "admin", "manager", "employee", "contractor", "viewer"];
  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <label key={role} className="flex items-center gap-3 cursor-pointer">
          <input type="radio" name="role" value={role} checked={value === role} onChange={() => onChange(role)} />
          <div>
            <div className="font-medium capitalize">{role}</div>
            <div className="text-xs text-gray-600">{permissions[role].join(", ")}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
