/**
 * System notifications for admin visibility: property onboarding, bookings,
 * financials, user actions, etc. Each notification captures an event and is
 * marked read/unread. Later, these come from a backend feed; for now, mocked.
 */

export type NotificationActionType =
  | "property_added"
  | "property_approved"
  | "property_rejected"
  | "booking_created"
  | "booking_confirmed"
  | "booking_payment_received"
  | "booking_completed"
  | "booking_cancelled"
  | "user_registered"
  | "financial_uploaded"
  | "package_created";

export const NOTIFICATION_ACTION_LABELS: Record<NotificationActionType, string> =
  {
    property_added: "Property Added",
    property_approved: "Property Approved",
    property_rejected: "Property Rejected",
    booking_created: "Booking Created",
    booking_confirmed: "Booking Confirmed",
    booking_payment_received: "Payment Received",
    booking_completed: "Booking Completed",
    booking_cancelled: "Booking Cancelled",
    user_registered: "User Registered",
    financial_uploaded: "Financial Uploaded",
    package_created: "Package Created",
  };

export const NOTIFICATION_ACTION_COLORS: Record<
  NotificationActionType,
  string
> = {
  property_added: "bg-blue-100 text-blue-700",
  property_approved: "bg-green-100 text-green-700",
  property_rejected: "bg-red-100 text-red-700",
  booking_created: "bg-purple-100 text-purple-700",
  booking_confirmed: "bg-green-100 text-green-700",
  booking_payment_received: "bg-emerald-100 text-emerald-700",
  booking_completed: "bg-blue-100 text-blue-700",
  booking_cancelled: "bg-orange-100 text-orange-700",
  user_registered: "bg-indigo-100 text-indigo-700",
  financial_uploaded: "bg-cyan-100 text-cyan-700",
  package_created: "bg-violet-100 text-violet-700",
};

export interface Notification {
  id: string;
  actionType: NotificationActionType;
  title: string;
  message: string;
  relatedId?: string; // e.g., property ID, booking ID
  relatedType?: "property" | "booking" | "user" | "financial" | "package";
  isRead: boolean;
  createdAt: string; // ISO date-time
  actionUrl?: string; // Optional link to relevant page
}
