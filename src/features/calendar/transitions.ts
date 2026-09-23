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
 *  - payment_pending → confirmed | cancelled_refunded   (admin only)
 *  - confirmed       → completed                        (all roles, checkout passed)
 *  - confirmed       → no_show                          (admin only, checkout passed)
 *  - no_show         → cancelled_refunded               (admin only)
 *    (no_show → reschedule is handled as a separate action, not a status
 *     dropdown value — it reopens a new payment_pending booking)
 *  - blocked, completed, cancelled_refunded → terminal (no dropdown targets)
 */
export function allowedTransitions(
  booking: Booking,
  role: UserRole,
): BookingStatus[] {
  const checkoutPassed = isCheckoutPassed(booking.checkOut);

  switch (booking.status) {
    case "payment_pending":
      return role === "admin" ? ["confirmed", "cancelled_refunded"] : [];
    case "confirmed": {
      if (!checkoutPassed) return [];
      // All roles can mark Completed once checkout has passed; only admin
      // can additionally mark No-Show.
      return role === "admin" ? ["completed", "no_show"] : ["completed"];
    }
    case "no_show":
      return role === "admin" ? ["cancelled_refunded"] : [];
    case "blocked":
    case "completed":
    case "cancelled_refunded":
    default:
      return [];
  }
}

/**
 * No-Show reschedule is admin-only and, unlike a status change, creates a
 * fresh booking back at payment_pending with new dates (prices may have
 * risen — the guest is re-charged). This just reports whether the action
 * is available to the current role for the given booking.
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
