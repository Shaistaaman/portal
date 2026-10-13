import type {
  ActionResult,
  AuthError,
  LoginResult,
  SignupInput,
  SignupResult,
  User,
  UserRole,
} from "@/types/auth";
import { DEMO_ADMIN } from "./auth-context";

/**
 * Client for the cookie-session auth endpoints (backend-config.md §10.1).
 *
 * Live mode (VITE_API_BASE_URL defined, may be empty for same-origin):
 * every call goes to the backend `/auth/*` Lambdas. Tokens never reach
 * this code — the server sets an HttpOnly session cookie and the browser
 * sends it automatically (`credentials: "include"`).
 *
 * Mock mode (VITE_API_BASE_URL undefined): an in-memory stand-in so the
 * portal still runs with no backend. See `mockApi` for demo behaviour.
 */
export interface AuthApi {
  /** Current session user, or null when there is no valid session. */
  me(): Promise<User | null>;
  /** `portal` is the login surface's fixed role; the server rejects a mismatch. */
  login(email: string, password: string, portal: UserRole): Promise<LoginResult>;
  completeNewPassword(newPassword: string, portal: UserRole): Promise<LoginResult>;
  logout(): Promise<void>;
  signup(input: SignupInput): Promise<SignupResult>;
  confirmSignup(email: string, code: string): Promise<ActionResult>;
  resendSignupCode(email: string): Promise<ActionResult>;
  forgotPassword(email: string): Promise<ActionResult>;
  resetPassword(email: string, code: string, newPassword: string): Promise<ActionResult>;
}

const API_BASE: string | undefined = import.meta.env.VITE_API_BASE_URL;

export const isMockAuth = API_BASE === undefined;

// ---------------------------------------------------------------------------
// Live implementation
// ---------------------------------------------------------------------------

const NETWORK_ERROR: AuthError = {
  status: "error",
  code: "network_error",
  message: "We couldn't reach the server. Check your connection and try again.",
};

const GENERIC_ERROR: AuthError = {
  status: "error",
  code: "unknown_error",
  message: "Something went wrong. Please try again.",
};

/**
 * Server contract: success bodies are the result object itself
 * (e.g. `{ "status": "ok", "user": {...} }`); failures use a non-2xx
 * status with `{ "error": { "code": "...", "message": "..." } }`.
 */
async function call<T>(path: string, body?: unknown): Promise<T | AuthError> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE ?? ""}${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // CSRF guard: the server rejects state-changing requests without it.
        "X-Requested-With": "XMLHttpRequest",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return NETWORK_ERROR;
  }

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string } } | null)?.error;
    return {
      status: "error",
      code: err?.code ?? `http_${res.status}`,
      message: err?.message ?? GENERIC_ERROR.message,
    };
  }
  return data as T;
}

const liveApi: AuthApi = {
  async me() {
    const result = await call<{ user: User }>("/v1/me");
    return "user" in result ? result.user : null;
  },
  login: (email, password, portal) =>
    call<LoginResult>("/auth/login", { email, password, portal }),
  completeNewPassword: (newPassword, portal) =>
    call<LoginResult>("/auth/complete-new-password", { newPassword, portal }),
  async logout() {
    await call("/auth/logout", {});
  },
  signup: (input) => call<SignupResult>("/auth/signup", input),
  confirmSignup: (email, code) => call<ActionResult>("/auth/confirm-signup", { email, code }),
  resendSignupCode: (email) => call<ActionResult>("/auth/resend-code", { email }),
  forgotPassword: (email) => call<ActionResult>("/auth/forgot-password", { email }),
  resetPassword: (email, code, newPassword) =>
    call<ActionResult>("/auth/reset-password", { email, code, newPassword }),
};

// ---------------------------------------------------------------------------
// Mock implementation (no backend)
// ---------------------------------------------------------------------------

/**
 * Demo behaviour, so every screen can be exercised locally:
 * - Any email/password logs in, shaped to the login surface's role.
 * - An email starting with `new.` triggers the first-login "set new
 *   password" step (as admin-created staff will in production).
 * - Signup puts the email into an unconfirmed state; any 6-digit code
 *   confirms it. Logging in before confirming routes to the code screen.
 * - Any 6-digit code resets a password.
 * - On load the app is pre-authenticated as the demo admin, matching the
 *   previous mock. State resets on refresh.
 */
const mockPendingConfirmation = new Map<string, Pick<User, "firstName" | "lastName" | "phone">>();
const mockProfiles = new Map<string, Pick<User, "firstName" | "lastName" | "phone">>();
let mockChallenge: { email: string } | null = null;

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));
const ok: ActionResult = { status: "ok" };

function mockUser(email: string, role: UserRole): User {
  const profile = mockProfiles.get(email.toLowerCase());
  const firstName = profile?.firstName ?? DEMO_ADMIN.firstName;
  const lastName = profile?.lastName ?? DEMO_ADMIN.lastName;
  return {
    ...DEMO_ADMIN,
    email,
    role,
    firstName,
    lastName,
    phone: profile?.phone,
    name: `${firstName ?? ""} ${lastName ?? ""}`.trim() || DEMO_ADMIN.name,
  };
}

const mockApi: AuthApi = {
  async me() {
    return DEMO_ADMIN;
  },
  async login(email, _password, portal) {
    await delay();
    const key = email.toLowerCase();
    if (mockPendingConfirmation.has(key)) return { status: "unconfirmed" };
    if (key.startsWith("new.")) {
      mockChallenge = { email };
      return { status: "new_password_required" };
    }
    return { status: "ok", user: mockUser(email, portal) };
  },
  async completeNewPassword(_newPassword, portal) {
    await delay();
    if (!mockChallenge) {
      return {
        status: "error",
        code: "session_expired",
        message: "Your sign-in session expired. Please log in again.",
      };
    }
    const { email } = mockChallenge;
    mockChallenge = null;
    return { status: "ok", user: mockUser(email, portal) };
  },
  async logout() {
    mockChallenge = null;
  },
  async signup(input) {
    await delay();
    const key = input.email.toLowerCase();
    if (mockProfiles.has(key)) {
      return {
        status: "error",
        code: "email_exists",
        message: "An account with this email already exists. Try logging in.",
      };
    }
    mockPendingConfirmation.set(key, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });
    return { status: "confirmation_required" };
  },
  async confirmSignup(email, code) {
    await delay();
    if (!/^\d{6}$/.test(code)) {
      return { status: "error", code: "invalid_code", message: "That code isn't valid." };
    }
    const key = email.toLowerCase();
    const profile = mockPendingConfirmation.get(key);
    if (profile) {
      mockProfiles.set(key, profile);
      mockPendingConfirmation.delete(key);
    }
    return ok;
  },
  async resendSignupCode() {
    await delay();
    return ok;
  },
  async forgotPassword() {
    await delay();
    return ok;
  },
  async resetPassword(_email, code) {
    await delay();
    if (!/^\d{6}$/.test(code)) {
      return { status: "error", code: "invalid_code", message: "That code isn't valid." };
    }
    return ok;
  },
};

export const authApi: AuthApi = isMockAuth ? mockApi : liveApi;
