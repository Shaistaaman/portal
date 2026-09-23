import type { Notification } from "./types";

/**
 * Mock notifications reflecting system events: property onboarding, bookings,
 * financials, user management. Replace with a real notifications API once the
 * backend exists. In production, these come from a feed with server-side read
 * state persistence.
 */
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    actionType: "booking_payment_received",
    title: "Payment Received",
    message:
      "Payment of €850 received for booking BK-1 (Amalfi Villa, July 15–18)",
    relatedId: "bk-1",
    relatedType: "booking",
    isRead: false,
    createdAt: "2026-09-23T14:30:00Z",
    actionUrl: "/admin/calendar",
  },
  {
    id: "notif-2",
    actionType: "property_added",
    title: "New Property Added",
    message:
      "Giulia Romano added Florence Riverside Loft for onboarding review",
    relatedId: "9",
    relatedType: "property",
    isRead: false,
    createdAt: "2026-09-23T12:15:00Z",
    actionUrl: "/admin/properties",
  },
  {
    id: "notif-3",
    actionType: "booking_created",
    title: "Booking Created",
    message:
      "New guest booking for Tuscany Vineyard (Sept 25–27, 2 guests, €1600)",
    relatedId: "bk-7",
    relatedType: "booking",
    isRead: true,
    createdAt: "2026-09-23T10:45:00Z",
    actionUrl: "/admin/calendar",
  },
  {
    id: "notif-4",
    actionType: "financial_uploaded",
    title: "Financial Record Uploaded",
    message:
      "July 2026 Revenue Summary uploaded by Martina Vance (62 KB, tagged to Giulia Romano)",
    relatedId: "fin-1",
    relatedType: "financial",
    isRead: true,
    createdAt: "2026-09-22T16:20:00Z",
    actionUrl: "/admin/financial",
  },
  {
    id: "notif-5",
    actionType: "user_registered",
    title: "New User Registered",
    message: "Agent Marco Bianchi registered and awaiting verification",
    relatedId: "3",
    relatedType: "user",
    isRead: true,
    createdAt: "2026-09-22T11:30:00Z",
    actionUrl: "/admin/users",
  },
  {
    id: "notif-6",
    actionType: "property_approved",
    title: "Property Approved",
    message: "Positano Sea View Villa (ID: 10) approved and now bookable",
    relatedId: "10",
    relatedType: "property",
    isRead: true,
    createdAt: "2026-09-21T09:00:00Z",
    actionUrl: "/admin/properties",
  },
  {
    id: "notif-7",
    actionType: "booking_confirmed",
    title: "Booking Confirmed",
    message:
      "Guest confirmed booking for Capri Cliff Retreat (Sept 28 – Oct 2, 4 guests)",
    relatedId: "bk-9",
    relatedType: "booking",
    isRead: true,
    createdAt: "2026-09-20T15:45:00Z",
    actionUrl: "/admin/calendar",
  },
  {
    id: "notif-8",
    actionType: "booking_completed",
    title: "Booking Completed",
    message: "Booking BK-3 completed and checked out (Amalfi Mansion)",
    relatedId: "bk-3",
    relatedType: "booking",
    isRead: true,
    createdAt: "2026-09-19T18:10:00Z",
    actionUrl: "/admin/calendar",
  },
];
