import BookingList from "@/features/calendar/BookingList";

/**
 * Admin Bookings page — a two-panel list/detail of every booking in the
 * system, mirroring the Properties list. Rendered full-bleed like the
 * calendar and property list (BookingList owns its own h-screen layout).
 */
export default function AdminBookingsPage() {
  return <BookingList />;
}
