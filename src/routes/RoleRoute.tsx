import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { LOGIN_PATH_BY_ROLE, withQuery } from "@/auth/authPaths";
import type { UserRole } from "@/types/auth";

interface RoleRouteProps {
  allow: UserRole[];
  children: ReactNode;
}

/**
 * Gates a subtree to a set of allowed roles. Redirects to the
 * corresponding login surface if there is no session, or if the
 * authenticated user's role is not in `allow`.
 *
 * This is a UX convenience, not a security boundary: `user.role` is the
 * display copy from `/v1/me`, and every protected API call is
 * re-authorised server-side against the session's Cognito group.
 */
export default function RoleRoute({ allow, children }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center bg-[#fcfbf9] text-sm text-neutral-500"
      >
        Checking your session…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const primaryRole = allow[0];
    const loginPath = primaryRole ? LOGIN_PATH_BY_ROLE[primaryRole] : "/login";
    return (
      <Navigate
        to={withQuery(loginPath, {
          redirect: location.pathname + location.search,
        })}
        replace
      />
    );
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={LOGIN_PATH_BY_ROLE[user.role]} replace />;
  }

  return <>{children}</>;
}
