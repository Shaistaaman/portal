import type { UserRole } from "@/types/auth";

/**
 * Booking status model — see Project_Specification.md §4.5. Six states with
 * role- and date-gated manual transitions.
 */
export type BookingStatus =
  | "payment_pending"
  | "confirmed"
  | "blocked"
  | "completed"
  | "no_show"
  | "cancelled_refunded";

/**
 * What a booking represents. The available set is filtered per role in the
 * booking form: admin = all three; owner = self + maintenance; agent =
 * self + guest.
 */
export type BookingType = "self" | "guest" | "maintenance";

export interface Booking {
  id: string;
  propertyId: string;
  /** Denormalized for display; mirrors the property's name. */
  propertyName: string;
  bookingType: BookingType;
  status: BookingStatus;
  /** ISO date (YYYY-MM-DD), inclusive. */
  checkIn: string;
  /** ISO date (YYYY-MM-DD), exclusive (checkout day). */
  checkOut: string;
  /** Contact details captured for every booking, all types, all roles. */
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  adults: number;
  children: number;
  /** Maintenance-only note; empty otherwise. */
  maintenanceNote: string;
  /** Snapshot of the nightly rate at booking time (property base price). */
  nightlyRate: number;
  /** Which role created the booking — used to gate agent edit scope. */
  createdByRole: UserRole;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  payment_pending: "Payment Pending",
  confirmed: "Confirmed",
  blocked: "Blocked",
  completed: "Completed",
  no_show: "No-Show",
  cancelled_refunded: "Cancelled / Refunded",
};

/** Legend/badge colors. Solid dot + block fill classes. */
export const BOOKING_STATUS_COLORS: Record<
  BookingStatus,
  { dot: string; block: string; text: string; cell: string }
> = {
  confirmed: {
    dot: "bg-green-500",
    block: "bg-green-500 text-white",
    text: "text-green-800",
    cell: "bg-green-50",
  },
  payment_pending: {
    dot: "bg-orange-500",
    block: "bg-orange-500 text-white",
    text: "text-orange-800",
    cell: "bg-orange-50",
  },
  blocked: {
    dot: "bg-red-500",
    block: "bg-red-500 text-white",
    text: "text-red-800",
    cell: "bg-red-50",
  },
  completed: {
    dot: "bg-blue-500",
    block: "bg-blue-500 text-white",
    text: "text-blue-800",
    cell: "bg-blue-50",
  },
  no_show: {
    dot: "bg-slate-500",
    block: "bg-slate-500 text-white",
    text: "text-slate-700",
    cell: "bg-slate-50",
  },
  cancelled_refunded: {
    dot: "bg-neutral-800",
    block: "bg-neutral-800 text-white line-through",
    text: "text-neutral-700",
    cell: "bg-neutral-100",
  },
};

/** The statuses shown in the top-of-calendar legend (the primary four). */
export const CALENDAR_LEGEND_STATUSES: BookingStatus[] = [
  "confirmed",
  "payment_pending",
  "blocked",
  "completed",
];

export const BOOKING_TYPES_BY_ROLE: Record<UserRole, BookingType[]> = {
  admin: ["self", "guest", "maintenance"],
  owner: ["self", "maintenance"],
  agent: ["self", "guest"],
  client: [], // client never creates bookings from the portal
};

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  self: "Self",
  guest: "Guest",
  maintenance: "Maintenance",
};

/** Initial status a new booking is created with, keyed by its type. */
export const INITIAL_STATUS_BY_TYPE: Record<BookingType, BookingStatus> = {
  guest: "payment_pending",
  self: "confirmed",
  maintenance: "blocked",
};

/** The editable fields captured by BookingForm (add + edit). */
export interface BookingFormValues {
  propertyId: string;
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  adults: number;
  children: number;
  maintenanceNote: string;
}

export function emptyBookingFormValues(role: UserRole): BookingFormValues {
  return {
    propertyId: "",
    bookingType: BOOKING_TYPES_BY_ROLE[role][0] ?? "self",
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    adults: 1,
    children: 0,
    maintenanceNote: "",
  };
}

/** Whole-day count between check-in (inclusive) and check-out (exclusive). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const ms = end.getTime() - start.getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** True when the checkout date is strictly before today (booking has ended). */
export function isCheckoutPassed(checkOut: string): boolean {
  const end = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end.getTime() < today.getTime();
}

export interface OrgFees {
  cleaningFee: number;
  serviceFee: number;
  /** Percentage, e.g. 10 = 10%. */
  taxesPct: number;
}

/** Demo org fees — mirrors the admin Settings "Booking Fees" defaults. */
export const DEFAULT_ORG_FEES: OrgFees = {
  cleaningFee: 150,
  serviceFee: 75,
  taxesPct: 10,
};

export interface PriceBreakdown {
  nights: number;
  nightlyRate: number;
  roomTotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

export function computePrice(
  nightlyRate: number,
  nights: number,
  fees: OrgFees,
): PriceBreakdown {
  const roomTotal = nightlyRate * nights;
  const taxes = Math.round(
    ((roomTotal + fees.cleaningFee + fees.serviceFee) * fees.taxesPct) / 100,
  );
  return {
    nights,
    nightlyRate,
    roomTotal,
    cleaningFee: fees.cleaningFee,
    serviceFee: fees.serviceFee,
    taxes,
    total: roomTotal + fees.cleaningFee + fees.serviceFee + taxes,
  };
}
