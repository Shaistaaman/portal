import AccountSettings from "@/features/settings/AccountSettings";
import type { UserRole } from "@/types/auth";

/**
 * Standalone settings page for roles that don't have a dashboard layout
 * yet (owner, agent, client). Once those roles get their own layout
 * (OwnerLayout/AgentLayout/ClientLayout, not built yet — see
 * Context_Instruction.md §8), this can move under that layout's <Outlet/>
 * the way admin's settings render inside AdminLayout.
 */
export default function RoleSettingsPage({ role }: { role: UserRole }) {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <AccountSettings role={role} />
    </div>
  );
}
