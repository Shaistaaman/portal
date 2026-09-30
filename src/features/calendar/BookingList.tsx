import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { MOCK_BOOKINGS } from "./mockBookings";
import { allowedTransitions } from "./transitions";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_TYPE_LABELS,
  bookingNumbers,
  nightsBetween,
  type Booking,
  type BookingStatus,
} from "./types";

const ITEMS_PER_PAGE = 5;

const STATUS_STYLES: Record<BookingStatus, string> = {
  requested: "bg-purple-100 text-purple-800",
  confirmed: "bg-green-100 text-green-800",
  blocked: "bg-gray-100 text-gray-800",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-slate-100 text-slate-800",
  cancelled: "bg-neutral-200 text-neutral-700",
};

const ROLE_LABELS: Record<Booking["createdByRole"], string> = {
  admin: "Admin",
  owner: "Owner",
  agent: "Agent",
  client: "Client",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

/**
 * Two-panel bookings browser for the admin, mirroring PropertyList: a
 * searchable, paginated list on the left (Booking ID as the blue heading)
 * and a detail panel on the right with a 3-dot actions menu (status
 * transitions + Show in Calendar). Every status change is confirmed through
 * a ConfirmModal. Persistence is mocked — the real guarantees live in
 * admin-fn (see Documents/database-design.md §5).
 */
export default function BookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    booking: Booking;
    next: BookingStatus;
  } | null>(null);

  // Stable Booking Numbers for the whole dataset, computed once. Looked up
  // by id so filtering/sorting the display list never changes a number.
  const numbers = useMemo(() => bookingNumbers(bookings), [bookings]);

  const visibleBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter(
      (b) =>
        (numbers[b.id] ?? "").toLowerCase().includes(query) ||
        b.propertyName.toLowerCase().includes(query) ||
        b.guestName.toLowerCase().includes(query) ||
        b.createdByName.toLowerCase().includes(query),
    );
  }, [bookings, searchQuery, numbers]);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    visibleBookings[0]?.id,
  );
  const selected =
    visibleBookings.find((b) => b.id === selectedId) ?? visibleBookings[0];

  const totalPages = Math.max(
    1,
    Math.ceil(visibleBookings.length / ITEMS_PER_PAGE),
  );
  const paginated = visibleBookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const confirmChange = () => {
    if (!pendingChange) return;
    const { booking, next } = pendingChange;
    setBookings((current) =>
      current.map((b) => (b.id === booking.id ? { ...b, status: next } : b)),
    );
    setPendingChange(null);
    // TODO(AWS integration): PATCH admin-fn's booking status endpoint.
  };

  if (!selected) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-neutral-500">
        No bookings to show.
      </div>
    );
  }

  const targets = allowedTransitions(selected, "admin");
  const isMaintenance = selected.bookingType === "maintenance";

  return (
    <div className="w-full h-screen flex bg-white">
      {/* Left panel: list */}
      <div className="w-96 border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-950">
                Bookings
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {bookings.length} Total Bookings
              </p>
            </div>
            <Link
              to="/admin/calendar/add-booking"
              aria-label="Add booking"
              className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, property, guest or booker..."
              aria-label="Search bookings"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {paginated.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => setSelectedId(booking.id)}
              className={`w-full text-left flex flex-col gap-1.5 p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${
                selected.id === booking.id
                  ? "bg-neutral-50 border-l-4 border-l-black"
                  : ""
              }`}
            >
              <span className="text-sm font-semibold text-blue-600">
                {numbers[booking.id]}
              </span>
              <span className="text-sm font-medium text-neutral-950 line-clamp-1">
                {booking.propertyName}
              </span>
              <span className="text-xs text-neutral-500">
                {isMaintenanceType(booking) ? "Maintenance" : booking.guestName}
              </span>
              <StatusBadge status={booking.status} />
            </button>
          ))}
          {paginated.length === 0 && (
            <p className="p-6 text-sm text-neutral-500">No bookings match.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-neutral-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-blue-600">
              {numbers[selected.id]}
            </h2>
            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {selected.propertyName}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen((open) => !open)}
              aria-label="Booking actions"
              className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {actionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setActionMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-52 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      navigate(
                        `/admin/calendar?property=${selected.propertyId}`,
                      );
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Show in Calendar
                  </button>

                  {targets.length > 0 && (
                    <div className="border-t border-neutral-100" />
                  )}
                  {targets.map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => {
                        setActionMenuOpen(false);
                        setPendingChange({ booking: selected, next: target });
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        target === "cancelled"
                          ? "text-red-700 hover:bg-red-50"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      Mark {BOOKING_STATUS_LABELS[target]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <StatusBadge status={selected.status} />
        </div>

        {/* Detail grid */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-2xl">
          <DetailRow
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Check In"
            value={formatDate(selected.checkIn)}
          />
          <DetailRow
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Check Out"
            value={formatDate(selected.checkOut)}
          />
          <DetailRow
            label="Nights"
            value={String(nightsBetween(selected.checkIn, selected.checkOut))}
          />
          <DetailRow
            label="Type"
            value={BOOKING_TYPE_LABELS[selected.bookingType]}
          />
          {!isMaintenance && (
            <>
              <DetailRow
                icon={<User className="w-4 h-4" />}
                label="Guest"
                value={selected.guestName}
              />
              <DetailRow
                icon={<Users className="w-4 h-4" />}
                label="Guests"
                value={`${selected.adults} adults, ${selected.children} children`}
              />
              <DetailRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={selected.guestPhone}
              />
              <DetailRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={selected.guestEmail}
              />
            </>
          )}
          <DetailRow
            label="Booked By"
            value={`${ROLE_LABELS[selected.createdByRole]} — ${selected.createdByName}`}
          />
        </dl>

        {isMaintenance && selected.maintenanceNote && (
          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg max-w-2xl">
            <p className="text-xs font-semibold text-neutral-700 mb-1">
              Maintenance note
            </p>
            <p className="text-sm text-neutral-600">
              {selected.maintenanceNote}
            </p>
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

function isMaintenanceType(booking: Booking): boolean {
  return booking.bookingType === "maintenance";
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-neutral-900">{value}</dd>
    </div>
  );
}
