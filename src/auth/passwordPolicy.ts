/**
 * Mirrors the Cognito user pool password policy so users get instant
 * feedback. Cognito still enforces it server-side — keep these in sync
 * with `PasswordPolicy` in backend/template.yaml.
 */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { id: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  {
    id: "symbol",
    label: "One symbol (e.g. ! @ # $)",
    test: (p: string) => /[^A-Za-z0-9\s]/.test(p),
  },
] as const;

export function meetsPasswordPolicy(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** Cognito verification and reset codes are 6 digits. */
export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
