export type UserRole = "admin" | "agent" | "client" | "owner";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

/**
 * Self-service signup is client-only. There is deliberately no `role`
 * field: the server always assigns the `client` group. Staff accounts
 * are created by an admin.
 */
export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export type AuthError = { status: "error"; code: string; message: string };

export type LoginResult =
  | { status: "ok"; user: User }
  /** Admin-created staff must set their own password on first login. */
  | { status: "new_password_required" }
  /** Signed up but never entered the email verification code. */
  | { status: "unconfirmed" }
  | AuthError;

export type SignupResult = { status: "confirmation_required" } | AuthError;

export type ActionResult = { status: "ok" } | AuthError;
