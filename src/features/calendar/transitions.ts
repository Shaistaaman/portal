import type { UserRole } from "@/types/auth";
import type { Booking, BookingStatus } from "./types";
import { isCheckoutPassed } from "./types";

/**
 * Allowed manual status transitions, per Project_Specification.md §4.5.
 * `role` + `booking` (for the checkout-date gate) determine which target
 * statuses are offered on the edit page. Returns the target statuses the
 * given role may move this booking to (excluding its current status).
 *
 * Summary:
 *  - requested → per REQUESTED_TARGETS_BY_TYPE               (admin only)
 *  - confirmed → cancelled                                  (admin only, any time)
 *  - confirmed → completed | no_show                        (admin only, once checkout passed;
 *                                                            completed also available to all roles)
 *  - no_show   → cancelled                                  (admin only)
 *    (no_show → reschedule is handled as a separate action, not a status
 *     dropdown value — it reopens a new requested booking)
 *  - blocked, completed, cancelled → terminal (no dropdown targets)
 */

/**
 * Where an admin may take a "requested" booking, by booking type.
 *
 * There is no payment-pending step: a guest or self request is approved
 * straight to `confirmed`, and a maintenance request to `blocked`. Any of
 * the three can instead be rejected, which uses `cancelled`.
 */
const REQUESTED_TARGETS_BY_TYPE: Record<
  Booking["bookingType"],
  BookingStatus[]
> = {
  guest: ["confirmed", "cancelled"],
  self: ["confirmed", "cancelled"],
  maintenance: ["blocked", "cancelled"],
};

export function allowedTransitions(
  booking: Booking,
  role: UserRole,
): BookingStatus[] {
  const checkoutPassed = isCheckoutPassed(booking.checkOut);

  switch (booking.status) {
    case "requested":
      return role === "admin"
        ? (REQUESTED_TARGETS_BY_TYPE[booking.bookingType] ?? [])
        : [];
    case "confirmed": {
      // A confirmed booking can be cancelled at any time. Once checkout has
      // passed it can additionally be completed (all roles) or, admin only,
      // marked no-show.
      if (role !== "admin") return checkoutPassed ? ["completed"] : [];
      if (!checkoutPassed) return ["cancelled"];
      return ["completed", "no_show", "cancelled"];
    }
    case "no_show":
      return role === "admin" ? ["cancelled"] : [];
    case "blocked":
    case "completed":
    case "cancelled":
    default:
      return [];
  }
}

/**
 * No-Show reschedule is admin-only and, unlike a status change, creates a
 * fresh booking back at `requested` with new dates (prices may have risen —
 * the guest is re-charged). This just reports whether the action is
 * available to the current role for the given booking.
 */
export function canReschedule(booking: Booking, role: UserRole): boolean {
  return role === "admin" && booking.status === "no_show";
}

/**
 * Edit/delete scope: admin any; owner only bookings on properties they own
 * (checked by the caller against the property's ownerId); agent only
 * bookings they themselves created.
 */
export function canEditBooking(
  booking: Booking,
  role: UserRole,
  ownsProperty: boolean,
): boolean {
  if (role === "admin") return true;
  if (role === "owner") return ownsProperty;
  if (role === "agent") return booking.createdByRole === "agent";
  return false;
}
