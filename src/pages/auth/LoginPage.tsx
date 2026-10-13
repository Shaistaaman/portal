import { Link, useSearchParams } from "react-router-dom";
import LoginForm from "@/features/auth/LoginForm";
import { AuthPageLayout } from "@/features/auth/AuthCard";
import { AUTH_LINK_CLASS } from "@/features/auth/authStyles";
import { useLoginSubmit } from "@/features/auth/useLoginSubmit";
import {
  DASHBOARD_PATH_BY_ROLE,
  noticeMessage,
  safeRedirect,
  withQuery,
} from "@/auth/authPaths";

/**
 * Client-facing login, reached from marketing CTAs (e.g. "Book Your Stay",
 * "Request an Experience"). The role is always "client" here — there is no
 * role picker. `redirect` carries the visitor's *intent* from the marketing
 * site, not their identity; the role that grants access comes from the
 * server-side session.
 */
export default function LoginPage() {
  const [searchParams] = useSearchParams();

  const redirectTo = safeRedirect(
    searchParams.get("redirect"),
    DASHBOARD_PATH_BY_ROLE.client,
  );
  const { submit, isLoading, error } = useLoginSubmit("client", redirectTo);

  return (
    <AuthPageLayout>
      <LoginForm
        role="client"
        heading="Login to the Premium Traveler Experience"
        onSubmit={submit}
        isLoading={isLoading}
        error={error}
        notice={noticeMessage(searchParams.get("notice"))}
        forgotPasswordHref={withQuery("/forgot-password", { role: "client" })}
        defaultEmail={searchParams.get("email") ?? ""}
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link
              to={withQuery("/signup", { redirect: redirectTo })}
              className={AUTH_LINK_CLASS}
            >
              Sign up now
            </Link>
          </>
        }
      />
    </AuthPageLayout>
  );
}
