import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import ExperienceModal from "../../components/ExperienceModal";

// Mock experience data
const MOCK_EXPERIENCES = [
  {
    id: "1",
    title: "Roman Golf Cart Tour",
    price: 350,
    rating: 4.9,
    image: "/images/experiences/roman-golf-cart.jpg",
    category: "History & Culture",
    location: "Rome",
  },
  {
    id: "2",
    title: "Olive Grove Tasting",
    price: 100,
    rating: 4.8,
    image: "/images/experiences/olive-grove.jpg",
    category: "Culinary Adventures",
    location: "Tuscany",
  },
  {
    id: "3",
    title: "Cooking Class with Authentic Italian Grandmothers",
    price: 350,
    rating: 4.9,
    image: "/images/experiences/cooking-class.jpg",
    category: "Culinary Adventures",
    location: "Rome",
  },
  {
    id: "4",
    title: "Vintage Fiat 500 Tour",
    price: 350,
    rating: 4.9,
    image: "/images/experiences/vintage-fiat.jpg",
    category: "History & Culture",
    location: "Rome",
  },
  {
    id: "5",
    title: "Private Chef at the Villa",
    price: 420,
    rating: 5.0,
    image: "/images/experiences/private-chef.jpg",
    category: "Culinary Adventures",
    location: "Tuscany",
  },
  {
    id: "6",
    title: "Private Coastal Charter",
    price: 1200,
    rating: 5.0,
    image: "/images/experiences/coastal-charter.jpg",
    category: "Outdoor Tours",
    location: "Amalfi",
  },
  {
    id: "7",
    title: "Vatican Museum Private Tour",
    price: 280,
    rating: 4.9,
    image: "/images/experiences/vatican-tour.jpg",
    category: "History & Culture",
    location: "Rome",
  },
  {
    id: "8",
    title: "Wine Tasting in Chianti Valley",
    price: 150,
    rating: 4.8,
    image: "/images/experiences/chianti-wine.jpg",
    category: "Culinary Adventures",
    location: "Tuscany",
  },
  {
    id: "9",
    title: "Hiking in Cinque Terre",
    price: 120,
    rating: 4.7,
    image: "/images/experiences/cinque-terre-hike.jpg",
    category: "Outdoor Tours",
    location: "Liguria",
  },
  {
    id: "10",
    title: "Florence Art Museum Exclusive Access",
    price: 200,
    rating: 5.0,
    image: "/images/experiences/florence-art.jpg",
    category: "History & Culture",
    location: "Florence",
  },
  {
    id: "11",
    title: "Truffle Hunting Experience",
    price: 250,
    rating: 4.9,
    image: "/images/experiences/truffle-hunt.jpg",
    category: "Culinary Adventures",
    location: "Piedmont",
  },
  {
    id: "12",
    title: "Amalfi Coast Boat Excursion",
    price: 180,
    rating: 4.8,
    image: "/images/experiences/amalfi-boat.jpg",
    category: "Outdoor Tours",
    location: "Amalfi",
  },
  {
    id: "13",
    title: "Family Pasta Making Workshop",
    price: 110,
    rating: 4.6,
    image: "/images/experiences/pasta-workshop.jpg",
    category: "Family",
    location: "Rome",
  },
  {
    id: "14",
    title: "Sunset Aperitivo on the Terrace",
    price: 85,
    rating: 4.9,
    image: "/images/experiences/sunset-aperitivo.jpg",
    category: "At Home",
    location: "Tuscany",
  },
  {
    id: "15",
    title: "Exclusive Opera Evening at the Scala",
    price: 450,
    rating: 5.0,
    image: "/images/experiences/opera-scala.jpg",
    category: "Closed To The Public",
    location: "Milan",
  },
];

const CATEGORIES = [
  "All",
  "History & Culture",
  "Culinary Adventures",
  "Outdoor Tours",
  "Closed To The Public",
  "Family",
  "At Home",
  "One Day City Escape",
];

const ITEMS_PER_PAGE = 6;

interface LocationState {
  property?: {
    id: string;
    title: string;
  };
  selectedExperiences?: Array<{
    id: string;
    title: string;
    price: number;
    rating: number;
    image: string;
    category: string;
    location: string;
  }>;
  startDate?: Date | null;
  endDate?: Date | null;
  totalPrice?: number;
  isWishlistFlow?: boolean;
}

interface Experience {
  id: string;
  title: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  location: string;
}

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
  const [showModal, setShowModal] = useState(false);
  const [lastAddedExperience, setLastAddedExperience] =
    useState<Experience | null>(null);
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

  const handleAddExperience = (experience: Experience) => {
    if (!selectedExperiences.find((exp) => exp.id === experience.id)) {
      setSelectedExperiences([...selectedExperiences, experience]);
      setLastAddedExperience(experience);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000); // Auto-dismiss after 3 seconds
    }
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

  const handleNext = () => {
    const contactPath =
      role === "agent"
        ? `/agent/property/${propertyId}/contact`
        : `/client/property/${propertyId}/contact`;

    navigate(contactPath, {
      state: {
        property,
        startDate,
        endDate,
        totalPrice: newTotal,
        experiences: selectedExperiences,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8 lg:px-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Left Column - Experiences */}
          <div className="lg:col-span-3">
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
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
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

                      {/* Add/Remove Button */}
                      <button
                        onClick={() =>
                          isSelected
                            ? handleRemoveExperience(experience.id)
                            : handleAddExperience(experience)
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
                        className="flex justify-between items-start"
                      >
                        <span className="text-xs text-neutral-600 flex-1">
                          {trimTitle(exp.title)}
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

              {/* Back and Next Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleNext}
                  className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-lg hover:bg-black transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {lastAddedExperience && (
        <ExperienceModal
          isOpen={showModal}
          experience={lastAddedExperience}
          onClose={() => {
            setShowModal(false);
            // If wishlist flow, redirect to bookings after modal closes
            if (isWishlistFlow) {
              setTimeout(() => navigate("/client/bookings"), 500);
            }
          }}
        />
      )}
    </div>
  );
}
