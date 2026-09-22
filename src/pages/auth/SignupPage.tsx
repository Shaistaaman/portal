import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";
import { useAuth } from "@/auth/useAuth";

const DEFAULT_CLIENT_DASHBOARD = "/client/dashboard";

/**
 * Client-facing signup, reached from marketing CTAs. Role is always
 * "client" — signup for staff roles (admin/agent/owner) is not
 * self-service and does not belong on this page.
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

  const redirectTo = searchParams.get("redirect") || DEFAULT_CLIENT_DASHBOARD;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      // TODO(AWS integration): replace with a real Cognito sign-up call.
      signup({ firstName, lastName, email, phone, password, role: "client" });
      setIsLoading(false);
      navigate(redirectTo);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-[#fcfbf9]">
        <div className="w-full max-w-[460px] bg-white p-8 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-neutral-100">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight text-left mb-8 leading-snug">
            Sign Up to the Premium Traveler Experience
          </h1>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sr-only" htmlFor="first-name">
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="last-name">
                  Last Name
                </label>
                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
                />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="signup-phone">
                Phone
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-sm tracking-wide transition duration-150 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-600">
            Hereby, I agree to the{" "}
            <span className="font-semibold text-neutral-950 underline cursor-pointer">
              Terms & Condition
            </span>{" "}
            and{" "}
            <span className="font-semibold text-neutral-950 underline cursor-pointer">
              Privacy Policy
            </span>
          </div>

          <div className="mt-4 text-center text-xs text-neutral-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() =>
                navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`)
              }
              className="font-semibold text-neutral-950 underline hover:text-black cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
