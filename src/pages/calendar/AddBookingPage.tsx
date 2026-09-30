import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BookingForm from "@/features/calendar/BookingForm";
import { BOOKING_CREATION_STATUS } from "@/features/calendar/types";
import type { Booking } from "@/features/calendar/types";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/auth/useAuth";

/**
 * Shared add-booking page for admin/owner/agent.
 *
 * Every booking is created as "requested" regardless of type or creating
 * role — self, guest and maintenance alike. Approval is an explicit admin
 * action afterwards (see allowedTransitions in features/calendar/transitions).
 * All persistence is mocked.
 */
export default function AddBookingPage({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardPath = `/${role}/dashboard`;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(dashboardPath)}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-semibold text-neutral-950 mb-2">
        Add Booking
      </h1>
      <p className="text-neutral-600 mb-8">
        New bookings are submitted as <strong>Requested</strong> and confirmed
        by the Skylife team.
      </p>

      <BookingForm
        role={role}
        submitLabel="Create Booking"
        onSubmit={(values) => {
          // TODO(AWS integration): POST this to admin-fn's booking endpoint.
          // The server must set the status itself rather than trusting the
          // client — this payload documents the intended shape.
          const newBooking: Omit<Booking, "id" | "propertyName"> = {
            ...values,
            status: BOOKING_CREATION_STATUS,
            nightlyRate: 0, // resolved server-side from the property
            createdByRole: role,
            createdByName: user?.name ?? "",
          };
          void newBooking;
          navigate(dashboardPath);
        }}
        onCancel={() => navigate(dashboardPath)}
      />
    </div>
  );
}
