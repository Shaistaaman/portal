import type { UserRole } from "@/types/auth";

/**
 * Booking status model — see Project_Specification.md §4.5. Six states with
 * role- and date-gated manual transitions.
 *
 * There is no payment-pending state: the model is request-to-book, so a
 * booking goes straight from `requested` to `confirmed` on approval. The
 * cancel state is a plain `cancelled` (spelled the same way everywhere,
 * including the client bookings view).
 */
export type BookingStatus =
  "requested" | "confirmed" | "blocked" | "completed" | "no_show" | "cancelled";

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
  /**
   * Display name of whoever created the booking (the staff member or client,
   * not the guest). Shown in the admin dashboard's "Booked By" column beneath
   * the creating role. For a guest booking this is the agent/admin who made
   * it, distinct from `guestName`.
   */
  createdByName: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  blocked: "Blocked",
  completed: "Completed",
  no_show: "No-Show",
  cancelled: "Cancelled",
};

/** Legend/badge colors. Solid dot + block fill classes. */
export const BOOKING_STATUS_COLORS: Record<
  BookingStatus,
  { dot: string; block: string; text: string; cell: string }
> = {
  requested: {
    dot: "bg-purple-500",
    block: "bg-purple-500 text-white",
    text: "text-purple-800",
    cell: "bg-purple-50",
  },
  confirmed: {
    dot: "bg-green-500",
    block: "bg-green-500 text-white",
    text: "text-green-800",
    cell: "bg-green-50",
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
  cancelled: {
    dot: "bg-neutral-800",
    block: "bg-neutral-800 text-white line-through",
    text: "text-neutral-700",
    cell: "bg-neutral-100",
  },
};

/**
 * The statuses shown in the top-of-calendar legend. `requested` leads
 * because every new booking now starts there, so it is the status a user
 * sees most often on a fresh calendar.
 */
export const CALENDAR_LEGEND_STATUSES: BookingStatus[] = [
  "requested",
  "confirmed",
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

/**
 * Every new booking starts as "requested", regardless of its type (self,
 * guest or maintenance) and regardless of which role created it. Approval
 * is a separate, explicit admin action — see allowedTransitions() in
 * ./transitions.ts for where it goes next.
 *
 * This replaces an earlier INITIAL_STATUS_BY_TYPE map that started each
 * type in a different state (self → confirmed, maintenance → blocked), i.e.
 * self and maintenance bookings were implicitly pre-approved at creation. A
 * single entry state keeps the request-to-book model consistent: nothing is
 * confirmed until someone confirms it.
 */
export const BOOKING_CREATION_STATUS: BookingStatus = "requested";

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

/**
 * Human-facing Booking Number, matching the client "My Bookings" format:
 * `BK-YYYY-MM-NNN` — e.g. BK-2024-01-001.
 *
 *  - YYYY / MM come from the booking's check-in date (the month the stay
 *    falls in), so the number is stable and meaningful.
 *  - NNN is the booking's sequence within that month, zero-padded to three.
 *    The caller supplies it because sequence depends on the whole dataset,
 *    not one booking; see `bookingNumbers()` below, which computes them all.
 *
 * This is a pure formatter. Prefer `bookingNumbers(list)` to get a lookup
 * for a set of bookings; use this directly only when the sequence is known.
 */
export function formatBookingNumber(checkIn: string, sequence: number): string {
  const d = new Date(checkIn);
  const year = Number.isNaN(d.getTime())
    ? new Date().getFullYear()
    : d.getFullYear();
  const month = Number.isNaN(d.getTime()) ? 1 : d.getMonth() + 1;
  return `BK-${year}-${String(month).padStart(2, "0")}-${String(sequence).padStart(3, "0")}`;
}

/**
 * Build a { bookingId -> "BK-YYYY-MM-NNN" } map for a list of bookings.
 * Sequence is assigned per year-month in check-in chronological order, so a
 * given booking always gets the same number regardless of how the list is
 * filtered or sorted for display.
 *
 * In production the booking number is assigned and stored server-side at
 * creation (see Documents/database-design.md §2.10); this derives it for the
 * mocked dataset.
 */
export function bookingNumbers(
  bookings: { id: string; checkIn: string }[],
): Record<string, string> {
  const chronological = [...bookings].sort(
    (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(),
  );
  const counters = new Map<string, number>();
  const result: Record<string, string> = {};
  for (const b of chronological) {
    const d = new Date(b.checkIn);
    const key = Number.isNaN(d.getTime())
      ? "0000-00"
      : `${d.getFullYear()}-${d.getMonth() + 1}`;
    const next = (counters.get(key) ?? 0) + 1;
    counters.set(key, next);
    result[b.id] = formatBookingNumber(b.checkIn, next);
  }
  return result;
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
