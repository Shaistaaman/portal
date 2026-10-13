import { useSearchParams } from "react-router-dom";
import LoginForm from "@/features/auth/LoginForm";
import { AuthPageLayout } from "@/features/auth/AuthCard";
import { useLoginSubmit } from "@/features/auth/useLoginSubmit";
import { useAuth } from "@/auth/useAuth";
import {
  DASHBOARD_PATH_BY_ROLE,
  noticeMessage,
  safeRedirect,
  withQuery,
} from "@/auth/authPaths";
import type { UserRole } from "@/types/auth";

const HEADING = "Login to the Premium Traveler Experience";

/**
 * Mock-mode convenience credentials, pre-filled per role so the form isn't
 * blank when running without a backend. Never used in live mode, where
 * Cognito validates real credentials.
 */
const DEV_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  admin: { email: "martina@skylifemanagement.com", password: "password123" },
  agent: { email: "agent.demo@skylifemanagement.com", password: "password123" },
  owner: { email: "owner.demo@skylifemanagement.com", password: "password123" },
  client: {
    email: "client.demo@skylifemanagement.com",
    password: "password123",
  },
};

/**
 * Shared login page for staff roles (admin, agent, owner), each mounted at
 * its own route (/admin/login, /agent/login, /owner/login). There is no
 * role picker — the role is fixed by the route. The server rejects the
 * login if the account's Cognito group doesn't match this surface.
 * Staff accounts are created by an admin; there is no staff signup.
 */
export default function StaffLoginPage({ role }: { role: UserRole }) {
  const [searchParams] = useSearchParams();
  const { isMockAuth } = useAuth();

  const dashboard = DASHBOARD_PATH_BY_ROLE[role];
  const requested = safeRedirect(searchParams.get("redirect"), dashboard);
  // Only follow a redirect that stays inside this role's own area.
  const redirectTo = requested.startsWith(`/${role}/`) ? requested : dashboard;

  const { submit, isLoading, error } = useLoginSubmit(role, redirectTo);
  const dev = isMockAuth ? DEV_CREDENTIALS[role] : null;

  return (
    <AuthPageLayout>
      <LoginForm
        role={role}
        heading={HEADING}
        onSubmit={submit}
        isLoading={isLoading}
        error={error}
        notice={noticeMessage(searchParams.get("notice"))}
        forgotPasswordHref={withQuery("/forgot-password", { role })}
        defaultEmail={searchParams.get("email") ?? dev?.email ?? ""}
        defaultPassword={dev?.password ?? ""}
      />
    </AuthPageLayout>
  );
}
