import { useState, useMemo } from "react";
import {
  Heart,
  MapPin,
  Users,
  Bed,
  Bath,
  GalleryVerticalEnd,
  Houses,
  HandPlatter,
  Boxes,
  Info,
  ChevronDown,
} from "lucide-react";
import { Calendar } from "lucide-react";

interface Booking {
  id: string;
  bookingNumber: string;
  title: string;
  type: "property" | "experience" | "package";
  image: string;
  checkIn: string;
  checkOut: string;
  location: string;
  guests?: number;
  beds?: number;
  baths?: number;
  description?: string;
  highlight?: string;
  rating: number;
  reviews: number;
  price: number;
  status: "confirmed" | "cancelled" | "completed" | "requested";
  isWishlisted?: boolean;
}

// Mock data
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-1",
    bookingNumber: "BK-2024-04-001",
    title: "Tiber Luxury Penthouse",
    type: "property",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=400",
    checkIn: "Apr 10",
    checkOut: "May 10",
    location: "Florence",
    guests: 4,
    beds: 2,
    baths: 2,
    rating: 4.9,
    reviews: 336,
    price: 3750,
    status: "confirmed",
    isWishlisted: true,
  },
  {
    id: "bk-2",
    bookingNumber: "BK-2024-04-002",
    title: "Roman Golf Cart Tour",
    type: "experience",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400",
    checkIn: "Apr 10",
    checkOut: "May 10",
    location: "Rome",
    guests: 4,
    rating: 4.9,
    reviews: 336,
    price: 3750,
    status: "confirmed",
    isWishlisted: false,
  },
  {
    id: "bk-3",
    bookingNumber: "BK-2024-04-003",
    title: "Sicily in Style",
    type: "package",
    image:
      "https://images.unsplash.com/photo-1499209974033-537250602fbf?q=80&w=400",
    checkIn: "Apr 10",
    checkOut: "May 10",
    location: "Amalfi Coast",
    highlight: "SICILIAN BAROQUE, ANCIENT TEMPLES & VOLCANO ISLANDS",
    rating: 4.9,
    reviews: 336,
    price: 3750,
    status: "cancelled",
    isWishlisted: false,
  },
  {
    id: "bk-4",
    bookingNumber: "BK-2024-04-004",
    title: "Tiber Luxury Penthouse",
    type: "property",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=400",
    checkIn: "Apr 10",
    checkOut: "May 10",
    location: "Florence",
    guests: 4,
    beds: 2,
    baths: 2,
    rating: 4.9,
    reviews: 336,
    price: 3750,
    status: "completed",
    isWishlisted: true,
  },
];

const STATUS_COLORS = {
  requested: {
    bg: "bg-purple-100",
    badge: "bg-purple-500",
    text: "text-purple-800",
  },
  confirmed: {
    bg: "bg-green-100",
    badge: "bg-green-500",
    text: "text-green-800",
  },
  completed: { bg: "bg-blue-100", badge: "bg-blue-500", text: "text-blue-800" },
  cancelled: { bg: "bg-red-100", badge: "bg-red-500", text: "text-red-800" },
};

const STATUS_LABELS = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

type FilterType = "all" | "property" | "experience" | "package";

export default function ClientBookingsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlisted, setWishlisted] = useState<Set<string>>(
    new Set(MOCK_BOOKINGS.filter((b) => b.isWishlisted).map((b) => b.id)),
  );

  const ITEMS_PER_PAGE = 6;

  // Type and Status are two independent filters, combined with AND:
  //  - a booking must match the selected type (unless "all"), and
  //  - it must match the selected status (unless none is selected).
  // So e.g. Properties + Confirmed shows only confirmed property bookings.
  const filteredBookings = useMemo(() => {
    return MOCK_BOOKINGS.filter((booking) => {
      const matchesType =
        activeFilter === "all" || booking.type === activeFilter;
      const matchesStatus = selectedStatus
        ? booking.status === selectedStatus
        : true;
      return matchesType && matchesStatus;
    });
  }, [activeFilter, selectedStatus]);

  // Paginate bookings
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Count summaries
  const propertyCount = MOCK_BOOKINGS.filter(
    (b) => b.type === "property",
  ).length;
  const experienceCount = MOCK_BOOKINGS.filter(
    (b) => b.type === "experience",
  ).length;
  const packageCount = MOCK_BOOKINGS.filter((b) => b.type === "package").length;

  const toggleWishlist = (bookingId: string) => {
    const newSet = new Set(wishlisted);
    if (newSet.has(bookingId)) {
      newSet.delete(bookingId);
    } else {
      newSet.add(bookingId);
    }
    setWishlisted(newSet);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-950 mb-2">
          My Bookings
        </h1>
        <p className="text-sm text-neutral-600">
          {propertyCount} Properties | {experienceCount} Experiences |{" "}
          {packageCount} Packages
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setActiveFilter("all");
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === "all"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
          }`}
        >
          <GalleryVerticalEnd className="w-5 h-5" />
          All
        </button>

        <button
          onClick={() => {
            setActiveFilter("property");
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === "property"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
          }`}
        >
          <Houses className="w-5 h-5" />
          Properties
        </button>

        <button
          onClick={() => {
            setActiveFilter("experience");
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === "experience"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
          }`}
        >
          <HandPlatter className="w-5 h-5" />
          Experiences
        </button>

        <button
          onClick={() => {
            setActiveFilter("package");
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === "package"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
          }`}
        >
          <Boxes className="w-5 h-5" />
          Packages
        </button>

        {/* Status is a dropdown, combined (AND) with the type tabs above. */}
        <div className="relative ml-auto">
          <Info className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select
            value={selectedStatus ?? "all"}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedStatus(
                value === "all" ? null : (value as keyof typeof STATUS_LABELS),
              );
              setCurrentPage(1);
            }}
            aria-label="Filter bookings by status"
            className="appearance-none pl-9 pr-9 py-2.5 rounded-lg font-medium text-sm bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:outline-none focus:ring-1 focus:ring-black transition cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {(
              Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>
            ).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {paginatedBookings.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <p className="text-neutral-600">
              No bookings found. Start exploring properties to make your first
              reservation.
            </p>
          </div>
        ) : (
          paginatedBookings.map((booking) => {
            const statusColor =
              STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS];
            const isWishlisted = wishlisted.has(booking.id);

            return (
              <div
                key={booking.id}
                className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-6 p-6">
                  {/* Image with Status Badge */}
                  <div className="flex-shrink-0 w-full sm:w-48">
                    <div className="relative h-48 sm:h-full bg-neutral-200 rounded-lg overflow-hidden">
                      <img
                        src={booking.image}
                        alt={booking.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className={`absolute top-3 left-3 ${statusColor.badge} text-white px-3 py-1 rounded-full text-xs font-semibold`}
                      >
                        {
                          STATUS_LABELS[
                            booking.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Title and Wishlist */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {booking.type === "property"
                              ? "🏠"
                              : booking.type === "experience"
                                ? "�"
                                : "📦"}
                          </span>
                          <h3 className="text-lg font-semibold text-neutral-950">
                            {booking.title}
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleWishlist(booking.id)}
                        className="flex-shrink-0 p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            isWishlisted
                              ? "fill-red-500 text-red-500"
                              : "text-neutral-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {booking.checkIn}-{booking.checkOut}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>

                      {/* Property-specific details (NOT for packages) */}
                      {booking.type === "property" && (
                        <div className="flex items-center gap-4 flex-wrap">
                          {booking.guests && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{booking.guests} Guests</span>
                            </div>
                          )}
                          {booking.beds && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              <span>{booking.beds} Beds</span>
                            </div>
                          )}
                          {booking.baths && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              <span>{booking.baths} Baths</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Experience-specific details */}
                      {booking.type === "experience" && booking.guests && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{booking.guests} Guests</span>
                        </div>
                      )}

                      {/* Highlight (for packages and experiences with description) */}
                      {booking.highlight && (
                        <p className="text-xs text-neutral-500 italic">
                          {booking.highlight}
                        </p>
                      )}

                      {/* Description */}
                      {booking.description && (
                        <p className="text-xs text-neutral-500 italic">
                          {booking.description}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Booking Number: {booking.bookingNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neutral-900">
                          €{booking.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
