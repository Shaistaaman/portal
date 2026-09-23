import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Calendar } from "lucide-react";
import { MOCK_PROPERTIES } from "@/features/properties/mockProperties";
import { MOCK_BOOKINGS } from "@/features/calendar/mockBookings";
import type { Booking } from "@/features/calendar/types";

/**
 * Demo-only owner id matching the PropertyList scoping.
 */
const DEMO_OWNER_ID = "2";

const ITEMS_PER_PAGE = 6;

interface KpiCard {
  id: string;
  label: string;
  value: string;
  color?: string;
}

const BOOKING_STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  payment_pending: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  blocked: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Owner's property metrics
  const ownedProperties = useMemo(
    () => MOCK_PROPERTIES.filter((p) => p.ownerId === DEMO_OWNER_ID),
    [],
  );

  const propertyMetrics = useMemo(() => {
    const total = ownedProperties.length;
    const active = ownedProperties.filter((p) => p.status === "active").length;
    const inactive = ownedProperties.filter(
      (p) => p.status === "in_inactive",
    ).length;
    return { total, active, inactive };
  }, [ownedProperties]);

  // Bookings for owner's properties OR created by owner
  const ownedPropertyIds = useMemo(
    () => new Set(ownedProperties.map((p) => p.id)),
    [ownedProperties],
  );

  const ownedBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          ownedPropertyIds.has(b.propertyId) || b.createdByRole === "owner",
      ),
    [bookings, ownedPropertyIds],
  );

  const bookingMetrics = useMemo(() => {
    const thisMonth = ownedBookings.filter((b) => {
      const bookingDate = new Date(b.checkIn);
      const now = new Date();
      return (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      );
    }).length;
    return { thisMonth };
  }, [ownedBookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ownedBookings.filter((b) => {
      const matchesSearch =
        !query ||
        b.propertyName.toLowerCase().includes(query) ||
        b.guestName.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ownedBookings, searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / ITEMS_PER_PAGE),
  );
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const kpiCards: KpiCard[] = [
    {
      id: "total",
      label: "Total Properties",
      value: propertyMetrics.total.toString(),
    },
    {
      id: "active",
      label: "Active",
      value: propertyMetrics.active.toString(),
      color: "text-green-600",
    },
    {
      id: "inactive",
      label: "Inactive",
      value: propertyMetrics.inactive.toString(),
      color: "text-blue-600",
    },
    {
      id: "bookings",
      label: "Bookings This Month",
      value: bookingMetrics.thisMonth.toString(),
      color: "text-purple-600",
    },
  ];

  const markComplete = (bookingId: string) => {
    setBookings((current) =>
      current.map((b) =>
        b.id === bookingId ? { ...b, status: "completed" as const } : b,
      ),
    );
  };

  /**
   * Check if a booking can be marked complete:
   * - Must be created by owner (createdByRole === "owner")
   * - Status must be confirmed (not payment_pending)
   * - Checkout date must be in the past
   */
  const canMarkComplete = (booking: Booking): boolean => {
    if (booking.createdByRole !== "owner") return false;
    if (booking.status !== "confirmed") return false;
    const checkoutDate = new Date(booking.checkOut);
    const today = new Date();
    // Set time to midnight for fair comparison
    today.setHours(0, 0, 0, 0);
    return checkoutDate < today;
  };

  /**
   * Get "Booked By" label for a booking:
   * - "Self" if created by owner
   * - "Other" if created by admin or agent
   */
  const getBookedByLabel = (booking: Booking): string => {
    return booking.createdByRole === "owner" ? "Self" : "Other";
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate("/owner/properties/add-property")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Property
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-8">
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className="border border-neutral-300 bg-white p-6 rounded-lg flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow"
          >
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3">
              {card.label}
            </span>
            <span
              className={`text-4xl lg:text-[42px] font-light leading-none tracking-tight ${
                card.color || "text-neutral-900"
              }`}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bookings Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-950 mb-4">
            All Bookings
          </h2>

          {/* Search and filters */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by property or guest..."
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
              <option value="all">Status: All</option>
              <option value="confirmed">Confirmed</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Guest</th>
                <th className="px-6 py-3">Booked By</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-neutral-950">
                    {booking.propertyName}
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-neutral-900">{booking.guestName}</div>
                    <div className="text-xs text-neutral-500">
                      {booking.guestPhone}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        getBookedByLabel(booking) === "Self"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {getBookedByLabel(booking)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-neutral-700">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-neutral-700">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        BOOKING_STATUS_STYLES[booking.status] ||
                        "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {booking.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/owner/calendar?property=${booking.propertyId}`,
                          )
                        }
                        title="View on Calendar"
                        className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      {canMarkComplete(booking) && (
                        <button
                          type="button"
                          onClick={() => markComplete(booking.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    No bookings found.
                  </td>
                </tr>
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
    </div>
  );
}
