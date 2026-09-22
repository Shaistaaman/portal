import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { RoleBadge, StatusBadge } from "@/components/ui/badges";
import { useClickOutside } from "@/hooks/useClickOutside";
import { MOCK_USERS } from "@/features/user-management/mockUsers";
import type { ManagedUser } from "@/features/user-management/types";
import type { UserRole } from "@/types/auth";

const ITEMS_PER_PAGE = 5;

const ROLE_FILTERS: { label: string; value: UserRole | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Admins", value: "admin" },
  { label: "Clients", value: "client" },
  { label: "Owners", value: "owner" },
  { label: "Agents", value: "agent" },
];

export default function UserListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<ManagedUser | null>(null);

  const statusFilterRef = useClickOutside<HTMLDivElement>(
    () => setStatusFilterOpen(false),
    statusFilterOpen,
  );
  const menuRef = useClickOutside<HTMLDivElement>(
    () => setActiveMenuId(null),
    activeMenuId !== null,
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;
    setUsers((current) =>
      current.map((user) =>
        user.id === pendingStatusChange.id
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user,
      ),
    );
    setPendingStatusChange(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">
            User Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage staff, owners, agents, and client accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/user-management/add-user")}
          className="px-7 py-3.5 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Add New User
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                changeFilter(() => setRoleFilter(filter.value))
              }
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                roleFilter === filter.value
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative" ref={statusFilterRef}>
          <button
            type="button"
            onClick={() => setStatusFilterOpen((open) => !open)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Status: <span className="capitalize">{statusFilter}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {statusFilterOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
              {(["all", "active", "inactive"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    changeFilter(() => setStatusFilter(option));
                    setStatusFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm capitalize transition-colors cursor-pointer ${
                    statusFilter === option
                      ? "bg-black text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
                    />
                    <span className="font-medium text-neutral-950">
                      {user.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-neutral-700">{user.email}</td>
                <td className="px-6 py-3 text-neutral-700">{user.phone}</td>
                <td className="px-6 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="relative inline-block" ref={activeMenuId === user.id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId((current) =>
                          current === user.id ? null : user.id,
                        )
                      }
                      aria-label={`Actions for ${user.fullName}`}
                      className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenuId === user.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(
                              `/admin/user-management/edit-user/${user.id}`,
                            );
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          Edit User
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setPendingStatusChange(user);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          {user.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                page === num
                  ? "bg-black text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {pendingStatusChange && (
        <ConfirmModal
          title={
            pendingStatusChange.status === "active"
              ? "Deactivate user?"
              : "Activate user?"
          }
          message={`${pendingStatusChange.fullName} will ${
            pendingStatusChange.status === "active"
              ? "lose access to their account"
              : "regain access to their account"
          }.`}
          confirmLabel={
            pendingStatusChange.status === "active" ? "Deactivate" : "Activate"
          }
          destructive={pendingStatusChange.status === "active"}
          onConfirm={confirmStatusChange}
          onCancel={() => setPendingStatusChange(null)}
        />
      )}
    </div>
  );
}
