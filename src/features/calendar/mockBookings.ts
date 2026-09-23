import {
  MOCK_PROPERTIES,
  nightlyRateFor,
} from "@/features/properties/mockProperties";
import type { Booking } from "./types";

/**
 * Mock bookings. Dates are generated relative to today so the calendar
 * always shows data in the current month / timeline window regardless of
 * when it's viewed. Replace with a real API call once the backend exists
 * (see Context_Instruction.md §3/§8).
 */
function isoDate(daysFromToday: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function propertyName(id: string): string {
  return MOCK_PROPERTIES.find((p) => p.id === id)?.name ?? "Property";
}

interface Seed {
  id: string;
  propertyId: string;
  bookingType: Booking["bookingType"];
  status: Booking["status"];
  startOffset: number;
  nights: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  adults: number;
  children: number;
  maintenanceNote?: string;
  createdByRole: Booking["createdByRole"];
}

const SEEDS: Seed[] = [
  {
    id: "bk-1",
    propertyId: "1",
    bookingType: "guest",
    status: "confirmed",
    startOffset: -12,
    nights: 5,
    guestName: "M. Davenport",
    guestPhone: "+1 415 555 0148",
    guestEmail: "m.davenport@example.com",
    adults: 2,
    children: 0,
    createdByRole: "admin",
  },
  {
    id: "bk-2",
    propertyId: "2",
    bookingType: "guest",
    status: "payment_pending",
    startOffset: 6,
    nights: 4,
    guestName: "C. Villiers",
    guestPhone: "+44 20 7946 0958",
    guestEmail: "c.villiers@example.com",
    adults: 3,
    children: 1,
    createdByRole: "agent",
  },
  {
    id: "bk-3",
    propertyId: "3",
    bookingType: "maintenance",
    status: "blocked",
    startOffset: 1,
    nights: 3,
    guestName: "Facilities Team",
    guestPhone: "+39 06 5555 0100",
    guestEmail: "facilities@skylifemanagement.com",
    adults: 0,
    children: 0,
    maintenanceNote: "Pool resurfacing and deep clean.",
    createdByRole: "admin",
  },
  {
    id: "bk-4",
    propertyId: "5",
    bookingType: "guest",
    status: "confirmed",
    startOffset: 14,
    nights: 6,
    guestName: "Dr. S. Chen",
    guestPhone: "+65 6555 0175",
    guestEmail: "s.chen@example.com",
    adults: 2,
    children: 2,
    createdByRole: "admin",
  },
  {
    id: "bk-5",
    propertyId: "1",
    bookingType: "guest",
    status: "completed",
    startOffset: -40,
    nights: 4,
    guestName: "A. Rossi",
    guestPhone: "+39 02 5555 0132",
    guestEmail: "a.rossi@example.com",
    adults: 2,
    children: 0,
    createdByRole: "admin",
  },
  {
    id: "bk-6",
    propertyId: "6",
    bookingType: "self",
    status: "confirmed",
    startOffset: 20,
    nights: 3,
    guestName: "Giulia Romano",
    guestPhone: "+39 348 234 5678",
    guestEmail: "giulia.romano@example.com",
    adults: 1,
    children: 0,
    createdByRole: "owner",
  },
  {
    id: "bk-7",
    propertyId: "10",
    bookingType: "guest",
    status: "payment_pending",
    startOffset: 3,
    nights: 7,
    guestName: "R. Nakamura",
    guestPhone: "+81 3 5555 0192",
    guestEmail: "r.nakamura@example.com",
    adults: 4,
    children: 2,
    createdByRole: "agent",
  },
  {
    id: "bk-8",
    propertyId: "9",
    bookingType: "guest",
    status: "confirmed",
    startOffset: 9,
    nights: 4,
    guestName: "L. Fontaine",
    guestPhone: "+33 1 5555 0110",
    guestEmail: "l.fontaine@example.com",
    adults: 2,
    children: 0,
    createdByRole: "admin",
  },
  {
    id: "bk-9",
    propertyId: "12",
    bookingType: "maintenance",
    status: "blocked",
    startOffset: 16,
    nights: 2,
    guestName: "Facilities Team",
    guestPhone: "+39 06 5555 0100",
    guestEmail: "facilities@skylifemanagement.com",
    adults: 0,
    children: 0,
    maintenanceNote: "HVAC servicing.",
    createdByRole: "owner",
  },
  {
    id: "bk-10",
    propertyId: "11",
    bookingType: "guest",
    status: "confirmed",
    startOffset: 25,
    nights: 5,
    guestName: "T. Okonkwo",
    guestPhone: "+234 1 555 0143",
    guestEmail: "t.okonkwo@example.com",
    adults: 2,
    children: 1,
    createdByRole: "agent",
  },
  {
    id: "bk-11",
    propertyId: "1",
    bookingType: "self",
    status: "confirmed",
    startOffset: -5,
    nights: 3,
    guestName: "Giulia Romano",
    guestPhone: "+39 348 234 5678",
    guestEmail: "giulia.romano@example.com",
    adults: 1,
    children: 0,
    maintenanceNote: "",
    createdByRole: "owner",
  },
  {
    id: "bk-12",
    propertyId: "2",
    bookingType: "guest",
    status: "confirmed",
    startOffset: -6,
    nights: 3,
    guestName: "J. Rossini",
    guestPhone: "+39 06 5555 0120",
    guestEmail: "j.rossini@example.com",
    adults: 2,
    children: 1,
    createdByRole: "agent",
  },
];

export const MOCK_BOOKINGS: Booking[] = SEEDS.map((seed) => ({
  id: seed.id,
  propertyId: seed.propertyId,
  propertyName: propertyName(seed.propertyId),
  bookingType: seed.bookingType,
  status: seed.status,
  checkIn: isoDate(seed.startOffset),
  checkOut: isoDate(seed.startOffset + seed.nights),
  guestName: seed.guestName,
  guestPhone: seed.guestPhone,
  guestEmail: seed.guestEmail,
  adults: seed.adults,
  children: seed.children,
  maintenanceNote: seed.maintenanceNote ?? "",
  nightlyRate: nightlyRateFor(seed.propertyId),
  createdByRole: seed.createdByRole,
}));

export function findMockBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}
