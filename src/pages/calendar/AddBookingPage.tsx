import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BookingForm from "@/features/calendar/BookingForm";
import { INITIAL_STATUS_BY_TYPE } from "@/features/calendar/types";
import type { UserRole } from "@/types/auth";

/**
 * Shared add-booking page for admin/owner/agent. On submit the initial
 * status is derived from the booking type per §4.5 (guest → payment_pending,
 * self → confirmed, maintenance → blocked). All persistence is mocked.
 */
export default function AddBookingPage({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const calendarPath = `/${role}/calendar`;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-semibold text-neutral-950 mb-8">
        Add Booking
      </h1>

      <BookingForm
        role={role}
        submitLabel="Create Booking"
        onSubmit={(values) => {
          // TODO(AWS integration): POST to admin-fn's booking endpoint. The
          // created booking starts at INITIAL_STATUS_BY_TYPE[values.bookingType]
          // and records createdByRole = role.
          void INITIAL_STATUS_BY_TYPE[values.bookingType];
          navigate(calendarPath);
        }}
        onCancel={() => navigate(calendarPath)}
      />
    </div>
  );
}
