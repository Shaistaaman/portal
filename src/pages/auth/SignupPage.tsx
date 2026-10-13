import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import {
  DASHBOARD_PATH_BY_ROLE,
  safeRedirect,
  withQuery,
} from "@/auth/authPaths";
import { meetsPasswordPolicy } from "@/auth/passwordPolicy";
import {
  AuthCard,
  AuthPageLayout,
  AuthSubmitButton,
  PasswordRequirements,
} from "@/features/auth/AuthCard";
import { AUTH_INPUT_CLASS, AUTH_LINK_CLASS } from "@/features/auth/authStyles";

/**
 * Client-facing signup, reached from marketing CTAs. Self-service signup
 * always creates a `client` account — the server assigns the group, and
 * no role is sent from here. Staff accounts are created by an admin.
 *
 * After submit, Cognito emails a 6-digit code and the user continues on
 * /confirm-signup.
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = safeRedirect(
    searchParams.get("redirect"),
    DASHBOARD_PATH_BY_ROLE.client,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!firstName.trim() || !lastName.trim() || !trimmedEmail || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!meetsPasswordPolicy(password)) {
      setError("Your password doesn't meet all the requirements below.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await signup({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      password,
    });
    setIsLoading(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    navigate(
      withQuery("/confirm-signup", {
        email: trimmedEmail,
        redirect: redirectTo,
      }),
    );
  };

  return (
    <AuthPageLayout>
      <AuthCard
        width="lg"
        heading="Sign Up to the Premium Traveler Experience"
        error={error}
        footer={
          <>
            <p>
              Hereby, I agree to the{" "}
              <span className="font-semibold text-neutral-950 underline cursor-pointer">
                Terms & Condition
              </span>{" "}
              and{" "}
              <span className="font-semibold text-neutral-950 underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
            <p className="mt-4">
              Already have an account?{" "}
              <Link
                to={withQuery("/login", { redirect: redirectTo })}
                className={AUTH_LINK_CLASS}
              >
                Login
              </Link>
            </p>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sr-only" htmlFor="first-name">
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                className={AUTH_INPUT_CLASS}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="last-name">
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                className={AUTH_INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className="sr-only" htmlFor="signup-phone">
              Phone
            </label>
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className={AUTH_INPUT_CLASS}
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={AUTH_INPUT_CLASS}
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              aria-describedby="signup-password-rules"
              className={AUTH_INPUT_CLASS}
            />
            <PasswordRequirements
              id="signup-password-rules"
              password={password}
            />
          </div>

          <AuthSubmitButton
            isLoading={isLoading}
            label="Sign Up"
            loadingLabel="Creating Account..."
          />
        </form>
      </AuthCard>
    </AuthPageLayout>
  );
}
