import { Star, Heart, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useMemo, useState } from "react";
import {
  MOCK_PROPERTIES,
  nightlyRateFor,
} from "@/features/properties/mockProperties";
import { MOCK_BOOKINGS } from "@/features/calendar/mockBookings";
import type { Property } from "@/features/properties/types";
import type { Guests } from "@/components/search/PropertySearch";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";

interface SearchResultsProps {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: Guests;
}

const ITEMS_PER_PAGE = 5;

const PROPERTY_TYPES = ["Penthouse", "Villa", "Apartment", "Other"];

const ALL_AMENITIES = [
  "Private Infinity Pool",
  "Wellness Spa & Sauna",
  "Home Cinema",
  "Wine Cellar",
  "Private Chef Available",
  "Concierge Service",
  "Gym / Fitness Studio",
  "Rooftop Terrace",
  "Private Beach Access",
  "Helipad",
  "Smart Home System",
  "Electric Vehicle Charging",
  "Tennis Court",
  "Private Dock / Marina",
  "Panoramic Sea View",
  "Garden & Orchard",
  "Staff Quarters",
  "Hot Tub",
];

function isPropertyAvailable(
  property: Property,
  checkIn: Date | null,
  checkOut: Date | null,
): boolean {
  if (!checkIn || !checkOut) return true;

  const propertyBookings = MOCK_BOOKINGS.filter(
    (b) =>
      b.propertyId === property.id &&
      (b.status === "confirmed" || b.status === "blocked"),
  );

  for (const booking of propertyBookings) {
    const bookingStart = new Date(booking.checkIn);
    const bookingEnd = new Date(booking.checkOut);

    if (checkIn < bookingEnd && checkOut > bookingStart) {
      return false;
    }
  }

  return true;
}

function canAccommodateGuests(property: Property, guests: Guests): boolean {
  const totalGuests = guests.adults + guests.children + guests.infants;
  const capacity = property.bedrooms * 2;
  return totalGuests <= capacity;
}

export default function SearchResults({
  location,
  checkIn,
  checkOut,
  guests,
}: SearchResultsProps) {
  const navigate = useNavigate();
  const role = useRole();
  const isAgent = role === "agent";
  const [page, setPage] = useState(1);
  const [likedProperties, setLikedProperties] = useState<Set<string>>(
    new Set(),
  );

  // Filter states
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState(1);
  const [maxBedrooms, setMaxBedrooms] = useState(12);
  const [minBathrooms, setMinBathrooms] = useState(1);
  const [maxBathrooms, setMaxBathrooms] = useState(12);
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<
    Set<string>
  >(new Set());
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
    new Set(),
  );

  const availableProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((property) => {
      // Status filter
      if (property.status !== "active") return false;

      // Location filter
      if (
        location &&
        !property.location.toLowerCase().includes(location.toLowerCase())
      ) {
        return false;
      }

      // Date availability
      if (!isPropertyAvailable(property, checkIn, checkOut)) {
        return false;
      }

      // Guest capacity
      if (!canAccommodateGuests(property, guests)) {
        return false;
      }

      // Price filter
      const pricePerNight = nightlyRateFor(property.id);
      const minVal = minPrice ? parseInt(minPrice) : 0;
      const maxVal = maxPrice ? parseInt(maxPrice) : Infinity;
      if (pricePerNight < minVal || pricePerNight > maxVal) {
        return false;
      }

      // Bedrooms filter
      if (property.bedrooms < minBedrooms || property.bedrooms > maxBedrooms) {
        return false;
      }

      // Bathrooms filter
      if (
        property.bathrooms < minBathrooms ||
        property.bathrooms > maxBathrooms
      ) {
        return false;
      }

      // Area filter
      const minAreaVal = minArea ? parseInt(minArea) : 0;
      const maxAreaVal = maxArea ? parseInt(maxArea) : Infinity;
      if (property.areaSqm < minAreaVal || property.areaSqm > maxAreaVal) {
        return false;
      }

      // Property type filter
      if (selectedPropertyTypes.size > 0) {
        if (!selectedPropertyTypes.has(property.propertyType)) {
          return false;
        }
      }

      // Amenities filter
      if (selectedAmenities.size > 0) {
        const hasAllAmenities = Array.from(selectedAmenities).every((amenity) =>
          property.amenities.includes(amenity),
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [
    location,
    checkIn,
    checkOut,
    guests,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    minArea,
    maxArea,
    selectedPropertyTypes,
    selectedAmenities,
  ]);

  const togglePropertyType = (type: string) => {
    const newSet = new Set(selectedPropertyTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedPropertyTypes(newSet);
    setPage(1);
  };

  const toggleAmenity = (amenity: string) => {
    const newSet = new Set(selectedAmenities);
    if (newSet.has(amenity)) {
      newSet.delete(amenity);
    } else {
      newSet.add(amenity);
    }
    setSelectedAmenities(newSet);
    setPage(1);
  };

  const toggleLike = (propertyId: string) => {
    const newSet = new Set(likedProperties);
    if (newSet.has(propertyId)) {
      newSet.delete(propertyId);
    } else {
      newSet.add(propertyId);
    }
    setLikedProperties(newSet);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms(1);
    setMaxBedrooms(12);
    setMinBathrooms(1);
    setMaxBathrooms(12);
    setMinArea("");
    setMaxArea("");
    setSelectedPropertyTypes(new Set());
    setSelectedAmenities(new Set());
    setPage(1);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(availableProperties.length / ITEMS_PER_PAGE),
  );
  const paginatedProperties = availableProperties.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const guestCount = guests.adults + guests.children + guests.infants;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-950 mb-2">
          {location || "Properties"}
        </h1>
        <p className="text-neutral-600 font-light">
          {availableProperties.length} Propert
          {availableProperties.length === 1 ? "y" : "ies"} Available
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE - RESULTS */}
        <div className="lg:col-span-2">
          {availableProperties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
              <p className="text-neutral-600 text-sm">
                No properties match your criteria.
              </p>
            </div>
          ) : (
            <>
              {/* Property Cards */}
              <div className="space-y-6 mb-8">
                {paginatedProperties.map((property) => {
                  const pricePerNight = nightlyRateFor(property.id);
                  const isLiked = likedProperties.has(property.id);

                  return (
                    <div
                      key={property.id}
                      className="bg-white border border-neutral-300 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row gap-6 p-6">
                        {/* Image */}
                        <div className="flex-shrink-0 w-full sm:w-48">
                          <div className="relative h-48 sm:h-full bg-neutral-200 rounded-xl overflow-hidden">
                            <img
                              src={property.images[0]}
                              alt={property.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          {/* Title and Like */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h2 className="text-2xl font-semibold text-neutral-950">
                              {property.name}
                            </h2>
                            <button
                              onClick={() => toggleLike(property.id)}
                              className="flex-shrink-0 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                              aria-label="Like property"
                            >
                              <Heart
                                className={`w-6 h-6 transition-colors ${
                                  isLiked
                                    ? "fill-red-500 text-red-500"
                                    : "text-neutral-400"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Rating and Price */}
                          <div className="flex items-center gap-6 mb-4">
                            {/* Rating */}
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-neutral-900">
                                4.8
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-neutral-900">
                                €{pricePerNight.toLocaleString()}
                              </span>
                              <span className="text-neutral-600 text-sm">
                                per night
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <p className="text-neutral-700 text-sm font-light">
                            {guestCount > 0 && `${guestCount} guests`}
                            {guestCount > 0 && property.bedrooms > 0 && " | "}
                            {property.bedrooms > 0 &&
                              `${property.bedrooms} bedroom${property.bedrooms > 1 ? "s" : ""}`}
                            {property.bathrooms > 0 &&
                              ` | ${property.bathrooms} bathroom${property.bathrooms > 1 ? "s" : ""}`}
                          </p>

                          {/* View Details Button */}
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => {
                                const path = isAgent
                                  ? `/agent/property/${property.id}`
                                  : `/client/property/${property.id}`;
                                navigate(path, {
                                  state: { property },
                                });
                              }}
                              className="px-6 py-2.5 bg-black hover:bg-neutral-900 text-white text-sm font-semibold rounded-lg transition-colors w-fit cursor-pointer"
                            >
                              View Details
                            </button>
                            {isAgent && (
                              <button
                                onClick={() => {
                                  // Navigate to property detail page to generate PDF
                                  navigate(`/agent/property/${property.id}`, {
                                    state: {
                                      property,
                                      shouldGeneratePDF: true,
                                    },
                                  });
                                }}
                                className="px-6 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 w-fit cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                                Generate Brochure
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (num) => (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === num
                              ? "bg-neutral-950 text-white"
                              : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          {num}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR - FILTERS */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-950">
                Filters
              </h2>
              {(minPrice ||
                maxPrice ||
                minBedrooms > 1 ||
                maxBedrooms < 12 ||
                minBathrooms > 1 ||
                maxBathrooms < 12 ||
                minArea ||
                maxArea ||
                selectedPropertyTypes.size > 0 ||
                selectedAmenities.size > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-950 mb-3">
                Price Range
              </h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min €"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
                <input
                  type="number"
                  placeholder="Max €"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Size and Layout */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-semibold text-neutral-950 mb-4">
                Size and Layout
              </h3>

              {/* Bedrooms */}
              <div className="mb-4">
                <label className="text-xs font-medium text-neutral-700 block mb-2">
                  Bedrooms
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMinBedrooms(Math.max(1, minBedrooms - 1))}
                    className="w-8 h-8 border border-neutral-300 rounded hover:bg-neutral-100 flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={minBedrooms}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setMinBedrooms(Math.max(1, Math.min(12, val)));
                    }}
                    className="flex-1 px-2 py-2 border border-neutral-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    min="1"
                    max="12"
                  />
                  <button
                    onClick={() =>
                      setMinBedrooms(Math.min(12, minBedrooms + 1))
                    }
                    className="w-8 h-8 border border-neutral-300 rounded hover:bg-neutral-100 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="mb-4">
                <label className="text-xs font-medium text-neutral-700 block mb-2">
                  Bathrooms
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setMinBathrooms(Math.max(1, minBathrooms - 1))
                    }
                    className="w-8 h-8 border border-neutral-300 rounded hover:bg-neutral-100 flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={minBathrooms}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setMinBathrooms(Math.max(1, Math.min(12, val)));
                    }}
                    className="flex-1 px-2 py-2 border border-neutral-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    min="1"
                    max="12"
                  />
                  <button
                    onClick={() =>
                      setMinBathrooms(Math.min(12, minBathrooms + 1))
                    }
                    className="w-8 h-8 border border-neutral-300 rounded hover:bg-neutral-100 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Area Range */}
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-2">
                  Area (m²)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-semibold text-neutral-950 mb-3">
                Room Type
              </h3>
              <div className="space-y-2">
                {PROPERTY_TYPES.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPropertyTypes.has(type)}
                      onChange={() => togglePropertyType(type)}
                      className="w-4 h-4 rounded border-neutral-300 accent-black"
                    />
                    <span className="text-sm text-neutral-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-semibold text-neutral-950 mb-3">
                Amenities
              </h3>
              <div className="space-y-2">
                {ALL_AMENITIES.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.has(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 rounded border-neutral-300 accent-black"
                    />
                    <span className="text-sm text-neutral-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
