import type { UserRole } from "@/types/auth";

const ROLES: readonly UserRole[] = ["admin", "agent", "owner", "client"];

/** Login surface for each role. Role is fixed by the page, never chosen by the visitor. */
export const LOGIN_PATH_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin/login",
  agent: "/agent/login",
  owner: "/owner/login",
  client: "/login",
};

export const DASHBOARD_PATH_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  agent: "/agent/dashboard",
  owner: "/owner/dashboard",
  client: "/client/dashboard",
};

/**
 * Reads a `?role=` query value. Used only to decide which login page or
 * dashboard to navigate back to — it never grants access. The server
 * decides the real role from the session.
 */
export function parseRole(value: string | null): UserRole {
  return ROLES.find((r) => r === value) ?? "client";
}

/**
 * Accepts only same-site relative paths, so `?redirect=` cannot send a
 * user to another origin after login (open-redirect protection).
 */
export function safeRedirect(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

/** Builds a path with query params, skipping empty values. */
export function withQuery(
  path: string,
  params: Record<string, string | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

const NOTICES: Record<string, string> = {
  verified: "Your email is verified. Please log in.",
  reset: "Your password has been reset. Please log in with your new password.",
  expired: "Your sign-in session expired. Please log in again.",
};

/** Maps a `?notice=` value to its message; unknown values show nothing. */
export function noticeMessage(value: string | null): string | null {
  return value ? (NOTICES[value] ?? null) : null;
}
