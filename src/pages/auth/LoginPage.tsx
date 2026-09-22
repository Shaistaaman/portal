import { useNavigate, useSearchParams } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";
import LoginForm from "@/features/auth/LoginForm";
import { useAuth } from "@/auth/useAuth";

const DEFAULT_CLIENT_DASHBOARD = "/client/dashboard";

/**
 * Client-facing login, reached from marketing CTAs (e.g. "Book Your Stay",
 * "Request an Experience"). The role is always "client" here — there is no
 * role picker. `redirect` carries the visitor's *intent* from the marketing
 * site (e.g. the booking flow they came from), not their identity; the
 * actual role that grants access still comes from the authenticated
 * session, not from this query param.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectTo = searchParams.get("redirect") || DEFAULT_CLIENT_DASHBOARD;

  const handleSubmit = (email: string, password: string) => {
    // TODO(AWS integration): replace with a real Cognito sign-in call.
    login(email, password, "client");
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-[#fcfbf9]">
        <LoginForm
          role="client"
          heading="Login to the Premium Traveler Experience"
          onSubmit={handleSubmit}
          footer={
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(`/signup?redirect=${encodeURIComponent(redirectTo)}`)
                }
                className="font-semibold text-neutral-950 underline hover:text-black cursor-pointer"
              >
                Sign up now
              </button>
            </>
          }
        />
      </div>
    </div>
  );
}
