import { useNavigate } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";
import LoginForm from "@/features/auth/LoginForm";
import { useAuth } from "@/auth/useAuth";
import type { UserRole } from "@/types/auth";

const HEADING = "Login to the Premium Traveler Experience";

/**
 * Dev-only convenience credentials, pre-filled per role so anyone opening
 * this app locally can log in without guessing anything. AuthContext's
 * mocked `login()` accepts any password today — these exist purely so the
 * form isn't blank, not because the password is actually checked.
 * TODO(AWS integration): remove these defaults once real Cognito auth
 * requires (and validates) real credentials.
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
 * Shared login page for staff/internal roles (admin, agent, owner), each
 * mounted at its own route (/admin/login, /agent/login, /owner/login).
 * There is no role picker — the role is fixed by which route rendered
 * this page. In production each of these routes is reached via its own
 * subdomain or path (e.g. admin.skylifemanagement.com), never chosen by
 * the visitor in the UI.
 */
export default function StaffLoginPage({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (email: string, password: string) => {
    // TODO(AWS integration): replace with a real Cognito sign-in call.
    // The backend response's group claim — not this `role` prop — is what
    // must ultimately authorize access; this demo call just mocks success
    // and uses `role` (the login surface's fixed role) as a stand-in.
    login(email, password, role);
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-[#fcfbf9]">
        <LoginForm
          role={role}
          heading={HEADING}
          onSubmit={handleSubmit}
          defaultEmail={DEV_CREDENTIALS[role].email}
          defaultPassword={DEV_CREDENTIALS[role].password}
        />
      </div>
    </div>
  );
}
