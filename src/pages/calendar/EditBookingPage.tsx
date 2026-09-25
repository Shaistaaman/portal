import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BookingForm from "@/features/calendar/BookingForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { findMockBookingById } from "@/features/calendar/mockBookings";
import { MOCK_PROPERTIES } from "@/features/properties/mockProperties";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/features/calendar/types";
import {
  allowedTransitions,
  canEditBooking,
  canReschedule,
} from "@/features/calendar/transitions";
import type { UserRole } from "@/types/auth";

const DEMO_OWNER_ID = "2";

/**
 * Shared edit-booking page for admin/owner/agent. Renders the prefilled
 * BookingForm plus a status panel whose available transitions are gated by
 * role + checkout date (see transitions.ts). Admin-only No-Show reschedule
 * (reopens as a fresh payment_pending booking) and refund actions. Edit/
 * delete access is gated by canEditBooking.
 */
export default function EditBookingPage({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const calendarPath = `/${role}/calendar`;

  // If coming from search results, go back to search on cancel
  const searchPath = searchParams.toString()
    ? `/${role}/search?${searchParams.toString()}`
    : calendarPath;

  const booking = id ? findMockBookingById(id) : undefined;

  const [pendingTransition, setPendingTransition] =
    useState<BookingStatus | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  if (!booking) {
    return (
      <NotFound
        calendarPath={calendarPath}
        onBack={() => navigate(calendarPath)}
      />
    );
  }

  const ownsProperty =
    MOCK_PROPERTIES.find((p) => p.id === booking.propertyId)?.ownerId ===
    DEMO_OWNER_ID;
  const editable = canEditBooking(booking, role, ownsProperty);
  const transitions = allowedTransitions(booking, role);
  const rescheduleAvailable = canReschedule(booking, role);
  const colors = BOOKING_STATUS_COLORS[booking.status];

  if (!editable) {
    return (
      <div>
        <BackButton
          onClick={() => navigate(calendarPath)}
          label="Back to Calendar"
        />
        <p className="text-neutral-600">
          You don&apos;t have permission to edit this booking.
        </p>
      </div>
    );
  }

  const applyTransition = () => {
    // TODO(AWS integration): PATCH the booking status to `pendingTransition`.
    setPendingTransition(null);
    navigate(calendarPath);
  };

  return (
    <div>
      <BackButton onClick={() => navigate(searchPath)} label="Back" />

      <h1 className="text-3xl font-semibold text-neutral-950 mb-2">
        Edit Booking
      </h1>
      <div className="flex items-center gap-2 mb-8">
        <span className="text-sm text-neutral-500">Current status:</span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.cell} ${colors.text}`}
        >
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Status actions */}
      <div className="border border-neutral-200 rounded-lg p-5 mb-8">
        <h2 className="text-sm font-semibold text-neutral-950 mb-3">
          Status Actions
        </h2>
        {transitions.length === 0 && !rescheduleAvailable ? (
          <p className="text-sm text-neutral-500">
            No status changes are available to you for this booking right now.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setPendingTransition(status)}
                className="px-4 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Mark {BOOKING_STATUS_LABELS[status]}
              </button>
            ))}
            {rescheduleAvailable && (
              <button
                type="button"
                onClick={() => navigate(`${calendarPath}/add-booking`)}
                className="px-4 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Reschedule (new booking)
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-neutral-400 mt-3">
          {role === "admin"
            ? "Admins record payment (Payment Pending → Confirmed), refunds, and no-shows. Rescheduling a no-show creates a fresh Payment Pending booking with new dates."
            : "Only Completed (after checkout) is available to your role; payment and refund actions are admin-only."}
        </p>
      </div>

      {/* Booking details form */}
      <BookingForm
        role={role}
        currentBookingId={booking.id}
        submitLabel="Save Changes"
        initialValues={{
          propertyId: booking.propertyId,
          bookingType: booking.bookingType,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          guestEmail: booking.guestEmail,
          adults: booking.adults,
          children: booking.children,
          maintenanceNote: booking.maintenanceNote,
        }}
        onSubmit={() => {
          // TODO(AWS integration): PATCH the booking fields.
          navigate(calendarPath);
        }}
        onCancel={() => navigate(searchPath)}
      />

      {/* Delete */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => setPendingDelete(true)}
          className="px-5 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          Delete Booking
        </button>
      </div>

      {pendingTransition && (
        <ConfirmModal
          title={`Mark ${BOOKING_STATUS_LABELS[pendingTransition]}?`}
          message={`This booking's status will change to "${BOOKING_STATUS_LABELS[pendingTransition]}".`}
          confirmLabel="Confirm"
          destructive={pendingTransition === "cancelled_refunded"}
          onCancel={() => setPendingTransition(null)}
          onConfirm={applyTransition}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this booking?"
          message="This will permanently remove the booking from the calendar."
          confirmLabel="Delete"
          destructive
          onCancel={() => setPendingDelete(false)}
          onConfirm={() => {
            // TODO(AWS integration): DELETE the booking.
            setPendingDelete(false);
            navigate(calendarPath);
          }}
        />
      )}
    </div>
  );
}

function BackButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
}

function NotFound({
  calendarPath,
  onBack,
}: {
  calendarPath: string;
  onBack: () => void;
}) {
  return (
    <div>
      <BackButton onClick={onBack} label="Back to Calendar" />
      <p className="text-neutral-600">Booking not found.</p>
      <a
        href={calendarPath}
        className="text-sm text-neutral-950 underline mt-2 inline-block"
      >
        Return to calendar
      </a>
    </div>
  );
}
