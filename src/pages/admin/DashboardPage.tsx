import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { MOCK_PROPERTIES } from "@/features/properties/mockProperties";
import { MOCK_BOOKINGS } from "@/features/calendar/mockBookings";
import {
  BOOKING_STATUS_LABELS,
  bookingNumbers,
  type Booking,
  type BookingStatus,
} from "@/features/calendar/types";
import { allowedTransitions } from "@/features/calendar/transitions";
import { useClickOutside } from "@/hooks/useClickOutside";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface KpiCard {
  id: string;
  label: string;
  value: string;
}

/**
 * Dummy KPI data, ported from apps/portal/app/admin/dashboard/page.tsx.
 * Replace with a real summary endpoint once admin-fn exists (see
 * Context_Instruction.md §3/§8).
 */
const KPI_CARDS: KpiCard[] = [
  { id: "properties", label: "PROPERTIES", value: "12" },
  { id: "experiences", label: "EXPERIENCES", value: "110" },
  { id: "packages", label: "PACKAGES", value: "07" },
  { id: "users", label: "USERS", value: "1,284" },
  { id: "owners", label: "OWNERS", value: "36" },
  { id: "agents", label: "AGENTS", value: "48" },
];

const ITEMS_PER_PAGE = 6;

/** Badge classes per status for the bookings table. */
const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  requested: "bg-purple-100 text-purple-800",
  confirmed: "bg-green-100 text-green-800",
  blocked: "bg-gray-100 text-gray-800",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-slate-100 text-slate-800",
  cancelled: "bg-neutral-200 text-neutral-700",
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Status: All" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No-Show" },
  { value: "cancelled", label: "Cancelled" },
];

const ROLE_LABELS: Record<Booking["createdByRole"], string> = {
  admin: "Admin",
  owner: "Owner",
  agent: "Agent",
  client: "Client",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Portfolio Health metrics
  const portfolioMetrics = useMemo(() => {
    const active = MOCK_PROPERTIES.filter((p) => p.status === "active").length;
    const inReview = MOCK_PROPERTIES.filter(
      (p) => p.status === "in_review",
    ).length;
    const inactive = MOCK_PROPERTIES.filter(
      (p) => p.status === "inactive",
    ).length;
    const rejected = MOCK_PROPERTIES.filter(
      (p) => p.status === "rejected",
    ).length;
    return { active, inReview, inactive, rejected };
  }, []);

  // Booking Health metrics
  const bookingMetrics = useMemo(() => {
    const thisMonth = bookings.filter((b) => {
      const bookingDate = new Date(b.checkIn);
      const now = new Date();
      return (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const completed = bookings.filter((b) => b.status === "completed").length;
    const completionRate =
      bookings.length > 0 ? Math.round((completed / bookings.length) * 100) : 0;

    const noShow = bookings.filter((b) => b.status === "no_show").length;
    const noShowRate =
      bookings.length > 0 ? Math.round((noShow / bookings.length) * 100) : 0;

    return { thisMonth, completionRate, noShowRate };
  }, [bookings]);

  // All bookings in the system, filtered by search + status.
  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesSearch =
        !query ||
        b.propertyName.toLowerCase().includes(query) ||
        b.guestName.toLowerCase().includes(query) ||
        b.createdByName.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / ITEMS_PER_PAGE),
  );
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Stable Booking Numbers (BK-YYYY-MM-NNN) for the whole dataset.
  const numbers = useMemo(() => bookingNumbers(bookings), [bookings]);

  // A status change requested from a row's menu, held until confirmed.
  const [pendingChange, setPendingChange] = useState<{
    booking: Booking;
    next: BookingStatus;
  } | null>(null);

  /**
   * Commit the pending status change. The real overlap/approval guarantees
   * live server-side in admin-fn (see Documents/database-design.md §5); this
   * only reflects the change in the mocked dataset.
   */
  const confirmChange = () => {
    if (!pendingChange) return;
    const { booking, next } = pendingChange;
    setBookings((current) =>
      current.map((b) => (b.id === booking.id ? { ...b, status: next } : b)),
    );
    setPendingChange(null);
    // TODO(AWS integration): PATCH admin-fn's booking status endpoint.
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/properties/add-property")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Property
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/experiences/add-experience")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Experience
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/packages/add-package")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Package
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/user-management/add-user")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add New User
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/calendar/add-booking")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Booking
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-5">
        {KPI_CARDS.map((card) => (
          <div
            key={card.id}
            className="border border-neutral-300 bg-white p-6 rounded-lg flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow"
          >
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3">
              {card.label}
            </span>
            <span className="text-4xl lg:text-[42px] font-light text-neutral-900 leading-none tracking-tight">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Portfolio Health */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          Portfolio Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Active
            </span>
            <span className="text-3xl font-light text-green-600 leading-none tracking-tight">
              {portfolioMetrics.active}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              In Review
            </span>
            <span className="text-3xl font-light text-blue-600 leading-none tracking-tight">
              {portfolioMetrics.inReview}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Inactive
            </span>
            <span className="text-3xl font-light text-orange-600 leading-none tracking-tight">
              {portfolioMetrics.inactive}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Rejected
            </span>
            <span className="text-3xl font-light text-red-600 leading-none tracking-tight">
              {portfolioMetrics.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Health */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          Booking Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Bookings This Month
            </span>
            <span className="text-3xl font-light text-neutral-900 leading-none tracking-tight">
              {bookingMetrics.thisMonth}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Completion Rate
            </span>
            <span className="text-3xl font-light text-green-600 leading-none tracking-tight">
              {bookingMetrics.completionRate}%
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              No-Show Rate
            </span>
            <span className="text-3xl font-light text-red-600 leading-none tracking-tight">
              {bookingMetrics.noShowRate}%
            </span>
          </div>
        </div>

        {/* All-bookings table */}
        <div className="flex items-center justify-between gap-4 mt-8 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by property, guest or booker..."
              aria-label="Search bookings"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter bookings by status"
            className="px-4 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-black transition cursor-pointer"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-6 py-3">Booking No.</th>
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Guest</th>
                <th className="px-6 py-3">Booked By</th>
                <th className="px-6 py-3">Check In / Out</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-neutral-500">No bookings found.</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-blue-600 whitespace-nowrap">
                      {numbers[booking.id]}
                    </td>
                    <td className="px-6 py-3 font-medium text-neutral-950">
                      {booking.propertyName}
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-neutral-900">
                        {booking.bookingType === "maintenance"
                          ? "—"
                          : booking.guestName}
                      </div>
                      {booking.bookingType !== "maintenance" && (
                        <div className="text-xs text-neutral-500">
                          {booking.guestPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-neutral-900">
                        {ROLE_LABELS[booking.createdByRole]}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {booking.createdByName}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-neutral-700 whitespace-nowrap">
                      <div>
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${BOOKING_STATUS_STYLES[booking.status]}`}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/calendar?property=${booking.propertyId}`,
                            )
                          }
                          title="Show in Calendar"
                          aria-label="Show in Calendar"
                          className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </button>
                        <StatusMenu
                          booking={booking}
                          onChange={(next) =>
                            setPendingChange({ booking, next })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  page === num
                    ? "bg-black text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {pendingChange && (
        <ConfirmModal
          title={`Mark ${BOOKING_STATUS_LABELS[pendingChange.next]}?`}
          message={`Booking ${numbers[pendingChange.booking.id]} will change to "${BOOKING_STATUS_LABELS[pendingChange.next]}".`}
          confirmLabel={`Mark ${BOOKING_STATUS_LABELS[pendingChange.next]}`}
          destructive={pendingChange.next === "cancelled"}
          onCancel={() => setPendingChange(null)}
          onConfirm={confirmChange}
        />
      )}
    </div>
  );
}

/**
 * Status action for a single booking row. Admin is the only role that sees
 * this dashboard, so transitions are computed for "admin". When a booking
 * has no available transitions (blocked, completed, cancelled — terminal),
 * a static dash is shown instead of a disabled menu.
 */
function StatusMenu({
  booking,
  onChange,
}: {
  booking: Booking;
  onChange: (next: BookingStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  const targets = allowedTransitions(booking, "admin");

  if (targets.length === 0) {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        Change Status
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 min-w-[160px] bg-white border border-neutral-200 rounded-lg shadow-lg py-1">
          {targets.map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => {
                onChange(target);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors cursor-pointer ${
                target === "cancelled" ? "text-red-600" : "text-neutral-700"
              }`}
            >
              Mark {BOOKING_STATUS_LABELS[target]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
