import { useContext } from "react";
import { AuthContext } from "@/auth/auth-context";
import type { UserRole } from "@/types/auth";

/**
 * Hook to get the current user's role
 * Returns the role from auth context, or infers from URL path if needed
 */
export function useRole(): UserRole {
  const context = useContext(AuthContext);
  
  if (!context || !context.user) {
    // Fallback to inferring from URL path
    const path = window.location.pathname;
    if (path.includes("/agent")) return "agent";
    if (path.includes("/client")) return "client";
    if (path.includes("/admin")) return "admin";
    if (path.includes("/owner")) return "owner";
    return "client"; // default fallback
  }

  return context.user.role;
}
