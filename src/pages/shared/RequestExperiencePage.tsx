import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import { MOCK_EXPERIENCES as SOURCE_EXPERIENCES } from "@/features/experiences/mockExperiences";
import { EXPERIENCE_CATEGORIES } from "@/types/experiences";

/**
 * Card view of the shared experience catalogue. Ids match
 * features/experiences/mockExperiences so a card's "Add to Booking" can
 * open that experience's detail page (slot picker) by id. Only `active`
 * experiences are shown, mirroring the marketing site.
 */
const MOCK_EXPERIENCES = SOURCE_EXPERIENCES.filter(
  (e) => e.status === "active",
).map((e) => ({
  id: e.id,
  title: e.name,
  price: e.pricePerPerson,
  image: e.images[0] ?? "",
  category: e.categories[0] ?? "Experience",
  location: e.location,
}));

const CATEGORIES = ["All", ...EXPERIENCE_CATEGORIES];

const ITEMS_PER_PAGE = 6;

interface LocationState {
  property?: {
    id: string;
    title: string;
  };
  selectedExperiences?: SelectedExperience[];
  startDate?: Date | null;
  endDate?: Date | null;
  totalPrice?: number;
  isWishlistFlow?: boolean;
}

/**
 * An experience in the order summary. `price` is the line total
 * (pricePerPerson × guests); `slot` and `guests` come from the detail
 * page's slot picker.
 */
interface SelectedExperience {
  id: string;
  title: string;
  price: number;
  pricePerPerson?: number;
  image: string;
  category: string;
  location: string;
  slot?: string;
  guests?: number;
}

type Experience = SelectedExperience;

export default function RequestExperiencePage() {
  const role = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = useParams<{ propertyId: string }>();

  const state = (location.state as LocationState) || {};
  const {
    property,
    selectedExperiences: initialExperiences = [],
    isWishlistFlow = false,
    startDate,
    endDate,
    totalPrice = 0,
  } = state;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExperiences, setSelectedExperiences] =
    useState<Experience[]>(initialExperiences);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for floating effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keep the current history entry's state in sync with the live cart, so
  // navigating to a detail page and pressing Back restores the CURRENT
  // selections — not the stale list this page was first opened with (which
  // would resurrect a removed experience).
  useEffect(() => {
    navigate(".", {
      replace: true,
      state: { ...state, selectedExperiences },
    });
    // Only re-sync when the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExperiences]);

  // Filter experiences
  const filteredExperiences = useMemo(() => {
    return MOCK_EXPERIENCES.filter(
      (exp) => selectedCategory === "All" || exp.category === selectedCategory,
    );
  }, [selectedCategory]);

  // Paginate experiences
  const paginatedExperiences = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredExperiences.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExperiences, page]);

  const totalPages = Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE);

  // Trim title with ellipsis if too long
  const trimTitle = (title: string, maxLength: number = 40): string => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const handleRemoveExperience = (experienceId: string) => {
    setSelectedExperiences(
      selectedExperiences.filter((exp) => exp.id !== experienceId),
    );
  };

  const handleToggleWishlist = (experienceId: string) => {
    setWishlistItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(experienceId)) {
        newSet.delete(experienceId);
      } else {
        newSet.add(experienceId);
      }
      return newSet;
    });
  };

  const experiencesTotal = selectedExperiences.reduce(
    (sum, exp) => sum + exp.price,
    0,
  );
  const newTotal = totalPrice + experiencesTotal;

  const handleProceedToCheckout = () => {
    const contactPath = `/${role}/property/${propertyId}/contact`;
    navigate(contactPath, {
      state: {
        property,
        startDate,
        endDate,
        totalPrice: newTotal,
        experiences: selectedExperiences,
        // Experience-only checkout: no property/nightly fees, just the
        // sum of requested experiences.
        experienceOnly: isWishlistFlow,
      },
    });
  };

  // "Add to Booking" on a grid card opens that experience's detail page
  // (slot picker + guests). Carry the current selections so the detail page
  // can merge the new one rather than replacing them.
  const openExperienceDetail = (experienceId: string) => {
    navigate(`/${role}/experience/${experienceId}`, {
      state: { existingSelections: selectedExperiences },
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button - Hidden in wishlist flow */}
        {!isWishlistFlow && (
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-normal text-neutral-900 italic">
            Select Experiences
          </h1>
          <p className="text-sm font-light text-neutral-500 italic">
            Browse and add activities to personalize your stay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Experiences */}
          <div className="lg:col-span-2">
            {/* Category Filters */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                      selectedCategory === category
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-12">
              {paginatedExperiences.map((experience) => {
                const isSelected = selectedExperiences.find(
                  (exp) => exp.id === experience.id,
                );

                return (
                  <div key={experience.id} className="flex flex-col group">
                    {/* Image Container */}
                    <div className="relative mb-4 h-64 overflow-hidden rounded-lg bg-neutral-100">
                      <img
                        src={experience.image}
                        alt={experience.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Heart Icon - Client Only */}
                      {role === "client" && (
                        <button
                          onClick={() => handleToggleWishlist(experience.id)}
                          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          <Heart
                            className={`h-5 w-5 transition-all ${
                              wishlistItems.has(experience.id)
                                ? "fill-red-500 text-red-500"
                                : "text-neutral-900"
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="mb-4 font-serif text-lg font-normal text-neutral-900 italic line-clamp-2 h-14">
                        {experience.title}
                      </h3>

                      {/* Price */}
                      <p className="mb-4 text-sm font-light text-neutral-600">
                        €{experience.price} PER GUEST
                      </p>

                      {/* Add opens the detail page (slot + guests);
                          Remove clears it from the order summary. */}
                      <button
                        onClick={() =>
                          isSelected
                            ? handleRemoveExperience(experience.id)
                            : openExperienceDetail(experience.id)
                        }
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                          isSelected
                            ? "bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                            : "bg-neutral-900 text-white hover:bg-black"
                        }`}
                      >
                        {isSelected ? "REMOVE" : "ADD TO BOOKING"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-neutral-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`h-10 w-10 rounded-lg font-medium transition-all cursor-pointer ${
                      page === i + 1
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-neutral-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div
              style={{
                transform: `translateY(${scrollY}px)`,
                transition: "transform 0.1s ease-out",
              }}
              className="border border-neutral-200 bg-white p-6 shadow-sm rounded-lg"
            >
              <h3 className="border-b border-neutral-200 pb-4 font-serif text-xl font-normal text-neutral-900 italic mb-4">
                Order Summary
              </h3>

              {/* Property - Hidden in wishlist flow */}
              {property && !isWishlistFlow && (
                <div className="mb-4">
                  <p className="text-xs font-light text-neutral-500 mb-1">
                    PROPERTY
                  </p>
                  <p className="text-sm font-medium text-neutral-900">
                    {property.title}
                  </p>
                </div>
              )}

              {/* Base Price - Hidden in wishlist flow */}
              {!isWishlistFlow && (
                <div className="mb-4 pb-4 border-b border-neutral-200">
                  <p className="text-xs font-light text-neutral-500 mb-1">
                    BASE PRICE
                  </p>
                  <p className="text-sm font-medium text-neutral-900">
                    €{totalPrice}
                  </p>
                </div>
              )}

              {/* Selected Experiences */}
              {selectedExperiences.length > 0 && (
                <div className="mb-4 pb-4 border-b border-neutral-200">
                  <p className="text-xs font-light text-neutral-500 mb-3">
                    SELECTED EXPERIENCES ({selectedExperiences.length})
                  </p>
                  <div className="space-y-2">
                    {selectedExperiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex justify-between items-start gap-2"
                      >
                        <span className="text-xs text-neutral-600 flex-1">
                          {trimTitle(exp.title)}
                          {(exp.slot || exp.guests) && (
                            <span className="block text-[11px] text-neutral-400">
                              {exp.slot}
                              {exp.slot && exp.guests ? " · " : ""}
                              {exp.guests
                                ? `${exp.guests} guest${exp.guests === 1 ? "" : "s"}`
                                : ""}
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-medium text-neutral-900">
                          €{exp.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-bold text-neutral-900">
                    TOTAL
                  </span>
                  <span className="text-2xl font-bold text-neutral-900">
                    €{newTotal}
                  </span>
                </div>
                {selectedExperiences.length > 0 && (
                  <p className="text-[11px] font-light text-neutral-500 italic">
                    +€{experiencesTotal} in experiences
                  </p>
                )}
              </div>

              {/* Proceed to Checkout */}
              <div className="space-y-3">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedExperiences.length === 0}
                  className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-lg hover:bg-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
