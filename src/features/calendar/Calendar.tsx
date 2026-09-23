import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { MOCK_PROPERTIES } from "@/features/properties/mockProperties";
import { MOCK_BOOKINGS } from "./mockBookings";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  CALENDAR_LEGEND_STATUSES,
  type Booking,
} from "./types";

export type CalendarRole = "admin" | "owner" | "agent";

/** Demo-only owner scoping — same approach as PropertyList. */
const DEMO_OWNER_ID = "2";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** True if `dateKey` falls within [checkIn, checkOut) of the booking. */
function bookingCoversDate(booking: Booking, dateKey: string): boolean {
  return dateKey >= booking.checkIn && dateKey < booking.checkOut;
}

export default function Calendar({
  role,
  initialPropertyFilter = "",
}: {
  role: CalendarRole;
  initialPropertyFilter?: string;
}) {
  const navigate = useNavigate();
  const [view, setView] = useState<"month" | "timeline">("month");
  // "" = all properties; otherwise a single property id.
  const [propertyFilter, setPropertyFilter] = useState(initialPropertyFilter);

  const ownedPropertyIds = useMemo(() => {
    if (role === "owner") {
      return new Set(
        MOCK_PROPERTIES.filter((p) => p.ownerId === DEMO_OWNER_ID).map(
          (p) => p.id,
        ),
      );
    }
    return null; // admin/agent: all properties
  }, [role]);

  // Properties visible to this role, before the single-property filter.
  // Only `active` properties are bookable, so in_review / rejected /
  // in_inactive properties never appear on the calendar.
  const scopedProperties = useMemo(() => {
    const bookable = MOCK_PROPERTIES.filter((p) => p.status === "active");
    if (!ownedPropertyIds) return bookable;
    return bookable.filter((p) => ownedPropertyIds.has(p.id));
  }, [ownedPropertyIds]);

  // Apply the single-property filter (or show all scoped properties).
  const properties = useMemo(() => {
    if (!propertyFilter) return scopedProperties;
    return scopedProperties.filter((p) => p.id === propertyFilter);
  }, [scopedProperties, propertyFilter]);

  const visibleIds = useMemo(
    () => new Set(properties.map((p) => p.id)),
    [properties],
  );

  const bookings = useMemo(() => {
    const propertyBookings = MOCK_BOOKINGS.filter((b) =>
      visibleIds.has(b.propertyId),
    );
    // For owner, also include bookings they created (even on other properties)
    if (role === "owner") {
      const ownerCreatedBookings = MOCK_BOOKINGS.filter(
        (b) => b.createdByRole === "owner",
      );
      // Combine and deduplicate
      const allBookings = [...propertyBookings, ...ownerCreatedBookings];
      const seen = new Set<string>();
      return allBookings.filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
    }
    return propertyBookings;
  }, [visibleIds, role]);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-semibold text-neutral-950">Calendar</h1>
        <button
          type="button"
          onClick={() => navigate(`/${role}/calendar/add-booking`)}
          className="flex items-center gap-1.5 px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Booking
        </button>
      </div>

      {/* Property filter */}
      <div className="mb-6 max-w-sm">
        <label
          htmlFor="calendar-property-filter"
          className="text-xs font-semibold text-neutral-700 mb-1.5 block"
        >
          Property
        </label>
        <select
          id="calendar-property-filter"
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
        >
          <option value="">All properties</option>
          {scopedProperties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      {/* View toggle + legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {CALENDAR_LEGEND_STATUSES.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-2 text-sm text-neutral-600"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${BOOKING_STATUS_COLORS[status].dot}`}
              />
              {BOOKING_STATUS_LABELS[status]}
            </span>
          ))}
        </div>
        <div className="inline-flex border border-neutral-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setView("month")}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              view === "month"
                ? "bg-black text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              view === "timeline"
                ? "bg-black text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {view === "month" ? (
        <MonthView role={role} bookings={bookings} />
      ) : (
        <TimelineView role={role} properties={properties} bookings={bookings} />
      )}
    </div>
  );
}

/* ------------------------------- Month view ------------------------------ */

function MonthView({
  role,
  bookings,
}: {
  role: CalendarRole;
  bookings: Booking[];
}) {
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Build the 6-week grid (leading/trailing days from adjacent months).
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const bookingsForDay = (dateKey: string) =>
    bookings.filter((b) => bookingCoversDate(b, dateKey));

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-neutral-950">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            aria-label="Next month"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-neutral-200">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-3 py-2 border-r border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = toKey(day);
          const inMonth = day.getMonth() === month;
          const isToday = dateKey === toKey(today);
          const dayBookings = bookingsForDay(dateKey);
          return (
            <div
              key={dateKey}
              className={`min-h-[110px] border-r border-b border-neutral-200 p-1.5 ${
                inMonth ? "bg-white" : "bg-neutral-50/60"
              }`}
            >
              <div
                className={`text-xs mb-1 flex items-center gap-1 ${
                  inMonth ? "text-neutral-700" : "text-neutral-400"
                }`}
              >
                <span
                  className={
                    isToday
                      ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white font-semibold"
                      : ""
                  }
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="space-y-1">
                {dayBookings.map((booking) => {
                  const colors = BOOKING_STATUS_COLORS[booking.status];
                  const label =
                    booking.bookingType === "maintenance"
                      ? "Maintenance"
                      : booking.guestName;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => {
                        // Owner can only edit bookings they created
                        if (
                          role === "owner" &&
                          booking.createdByRole !== "owner"
                        ) {
                          return; // Don't navigate
                        }
                        navigate(`/${role}/calendar/${booking.id}/edit`);
                      }}
                      className={`w-full text-left px-1.5 py-1 rounded text-[10px] leading-tight ${colors.block} ${
                        role === "owner" && booking.createdByRole !== "owner"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                    >
                      <span className="block font-semibold truncate">
                        {booking.propertyName}
                      </span>
                      <span className="block truncate opacity-90">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Timeline view ---------------------------- */

const TIMELINE_INITIAL_DAYS = 21;
const TIMELINE_LOAD_MORE_DAYS = 21;
const DAY_COL_WIDTH = 64; // px

function TimelineView({
  role,
  properties,
  bookings,
}: {
  role: CalendarRole;
  properties: typeof MOCK_PROPERTIES;
  bookings: Booking[];
}) {
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const [dayCount, setDayCount] = useState(TIMELINE_INITIAL_DAYS);

  const days = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      }),
    // today is stable within a render session; dayCount drives growth
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayCount],
  );

  const dayKeys = days.map(toKey);

  // Group the visible days into contiguous same-month segments for the band.
  const monthSegments = useMemo(() => {
    const segments: {
      year: number;
      month: number;
      length: number;
    }[] = [];
    for (const day of days) {
      const last = segments[segments.length - 1];
      if (
        last &&
        last.year === day.getFullYear() &&
        last.month === day.getMonth()
      ) {
        last.length += 1;
      } else {
        segments.push({
          year: day.getFullYear(),
          month: day.getMonth(),
          length: 1,
        });
      }
    }
    return segments;
  }, [days]);

  return (
    <div>
      <div
        className="overflow-x-auto border border-neutral-200 rounded-lg"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (
            el.scrollLeft + el.clientWidth >= el.scrollWidth - 200 &&
            dayCount < 365
          ) {
            setDayCount((c) => Math.min(365, c + TIMELINE_LOAD_MORE_DAYS));
          }
        }}
      >
        <div style={{ minWidth: 260 + days.length * DAY_COL_WIDTH }}>
          {/* Month band — labels each contiguous run of same-month days so
              the day numbers (…30, 31, 1, 2…) are never ambiguous. */}
          <div className="flex border-b border-neutral-200 bg-neutral-100">
            <div className="w-[260px] shrink-0 border-r border-neutral-200" />
            {monthSegments.map((segment) => (
              <div
                key={`${segment.year}-${segment.month}`}
                style={{ width: segment.length * DAY_COL_WIDTH }}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-neutral-700 border-r border-neutral-200 whitespace-nowrap"
              >
                {MONTH_NAMES[segment.month]} {segment.year}
              </div>
            ))}
          </div>

          {/* Day header row */}
          <div className="flex border-b border-neutral-200 bg-neutral-50">
            <div className="w-[260px] shrink-0 px-4 py-3 text-sm font-semibold text-neutral-700 uppercase tracking-wide border-r border-neutral-200">
              Properties
            </div>
            {days.map((day) => {
              const isToday = toKey(day) === toKey(today);
              const isFirstOfMonth = day.getDate() === 1;
              return (
                <div
                  key={toKey(day)}
                  style={{ width: DAY_COL_WIDTH }}
                  className={`shrink-0 px-1 py-2 text-center border-r border-neutral-200 ${
                    isToday ? "bg-neutral-100" : ""
                  } ${isFirstOfMonth ? "border-l-2 border-l-neutral-400" : ""}`}
                >
                  <div className="text-[10px] text-neutral-500 uppercase">
                    {WEEKDAYS[day.getDay()]}
                  </div>
                  <div className="text-sm font-medium text-neutral-800">
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Property rows */}
          {properties.map((property) => {
            const propertyBookings = bookings.filter(
              (b) => b.propertyId === property.id,
            );
            return (
              <div
                key={property.id}
                className="flex border-b border-neutral-100 relative"
              >
                <div className="w-[260px] shrink-0 px-4 py-4 text-sm font-medium text-neutral-900 border-r border-neutral-200 truncate">
                  {property.name}
                </div>
                <div className="relative flex">
                  {days.map((day) => (
                    <div
                      key={toKey(day)}
                      style={{ width: DAY_COL_WIDTH }}
                      className="shrink-0 h-[64px] border-r border-neutral-100"
                    />
                  ))}

                  {/* Booking bars, absolutely positioned over the day cells */}
                  {propertyBookings.map((booking) => {
                    // Visible span within the loaded window.
                    const firstVisible = dayKeys.findIndex((k) =>
                      bookingCoversDate(booking, k),
                    );
                    if (firstVisible === -1) return null;
                    const visibleNights = dayKeys.filter((k) =>
                      bookingCoversDate(booking, k),
                    ).length;
                    const colors = BOOKING_STATUS_COLORS[booking.status];
                    const label =
                      booking.bookingType === "maintenance"
                        ? "Maintenance"
                        : booking.guestName;
                    // If the booking started before the visible window, mark
                    // the bar as continuing with a leading ellipsis.
                    const startsInWindow = dayKeys.includes(booking.checkIn);
                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => {
                          // Owner can only edit bookings they created
                          if (
                            role === "owner" &&
                            booking.createdByRole !== "owner"
                          ) {
                            return; // Don't navigate
                          }
                          navigate(`/${role}/calendar/${booking.id}/edit`);
                        }}
                        style={{
                          left: firstVisible * DAY_COL_WIDTH + 4,
                          width: visibleNights * DAY_COL_WIDTH - 8,
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 h-8 px-3 rounded-full flex items-center justify-between gap-2 text-[11px] font-medium ${colors.block} ${
                          role === "owner" && booking.createdByRole !== "owner"
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        } overflow-hidden`}
                      >
                        <span className="truncate">
                          {startsInWindow ? label : `… ${label}`}
                        </span>
                        <span className="shrink-0 opacity-90 text-[9px] uppercase">
                          {visibleNights}n
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {dayCount < 365 && (
        <p className="text-xs text-neutral-400 mt-3 text-center">
          Scroll right to load more days…
        </p>
      )}
    </div>
  );
}
