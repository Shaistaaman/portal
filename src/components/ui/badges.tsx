import type { UserRole } from "@/types/auth";
import type { ManagedUserStatus } from "@/features/user-management/types";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-purple-50 text-purple-700",
  client: "bg-blue-50 text-blue-700",
  owner: "bg-amber-50 text-amber-700",
  agent: "bg-teal-50 text-teal-700",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}

export function StatusBadge({ status }: { status: ManagedUserStatus }) {
  const active = status === "active";
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
      <span
        className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`}
      />
      <span className="capitalize">{status}</span>
    </span>
  );
}
