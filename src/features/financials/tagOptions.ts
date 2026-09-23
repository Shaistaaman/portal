import { MOCK_USERS } from "@/features/user-management/mockUsers";
import type { TagOption } from "./types";

/**
 * Owner/agent options for the "Tag to" selector, sourced from the shared
 * user list. Owners and agents can view (only) the financial records tagged
 * to them. In future this comes from the users API; for now it's derived
 * from MOCK_USERS so it stays in sync with User Management.
 */
export const TAG_OPTIONS: TagOption[] = MOCK_USERS.filter(
  (u) => u.role === "owner" || u.role === "agent",
).map((u) => ({
  id: u.id,
  name: u.fullName,
  role: u.role as "owner" | "agent",
}));

export const OWNER_TAG_OPTIONS = TAG_OPTIONS.filter((o) => o.role === "owner");
export const AGENT_TAG_OPTIONS = TAG_OPTIONS.filter((o) => o.role === "agent");

export function findTagOption(id: string): TagOption | undefined {
  return TAG_OPTIONS.find((o) => o.id === id);
}
