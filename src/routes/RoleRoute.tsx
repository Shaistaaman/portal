import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import type { UserRole } from "@/types/auth";

const LOGIN_PATH_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin/login",
  agent: "/agent/login",
  owner: "/owner/login",
  client: "/login",
};

interface RoleRouteProps {
  allow: UserRole[];
  children: ReactNode;
}

/**
 * Gates a subtree to a set of allowed roles. Redirects to the
 * corresponding login surface if there is no session, or if the
 * authenticated user's role is not in `allow`.
 *
 * TODO(AWS integration): `user.role` must come from a verified Cognito
 * group claim (decoded from the session's ID/access token), not from
 * client-writable state, before this check is meaningful for security.
 * Today's AuthContext is a demo mock — this guard is the enforcement
 * point that will matter once that's wired up.
 */
export default function RoleRoute({ allow, children }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const primaryRole = allow[0];
    const fallback = primaryRole ? LOGIN_PATH_BY_ROLE[primaryRole] : "/login";
    return (
      <Navigate
        to={`${fallback}?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={LOGIN_PATH_BY_ROLE[user.role]} replace />;
  }

  return <>{children}</>;
}
