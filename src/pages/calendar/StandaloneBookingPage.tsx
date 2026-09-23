import AddBookingPage from "./AddBookingPage";
import EditBookingPage from "./EditBookingPage";
import type { UserRole } from "@/types/auth";

/**
 * Standalone chrome for owner/agent booking pages (roles without a
 * dashboard layout yet). Admin renders AddBookingPage/EditBookingPage
 * directly inside AdminLayout's padded <main>.
 */
export function StandaloneAddBookingPage({ role }: { role: UserRole }) {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <AddBookingPage role={role} />
    </div>
  );
}

export function StandaloneEditBookingPage({ role }: { role: UserRole }) {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <EditBookingPage role={role} />
    </div>
  );
}
