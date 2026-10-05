import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { PROPERTIES } from "@/features/properties/properties";
import { MOCK_EXPERIENCES } from "@/features/experiences/mockExperiences";

interface WishlistItem {
  id: string;
  title: string;
  type: "property" | "experience";
  image: string;
  location: string;
  price: number;
}

// Build wishlist from MOCK_PROPERTIES and MOCK_EXPERIENCES
// The wishlist contains specific property and experience IDs
const WISHLIST_IDS = ["prop-1", "prop-2", "exp-1", "exp-2"];

const MOCK_WISHLIST: WishlistItem[] = [
  ...PROPERTIES.filter((p) => WISHLIST_IDS.includes(p.id)).map((p) => ({
    id: p.id,
    title: p.name,
    type: "property" as const,
    image: p.images[0] || "",
    location: p.location,
    price: 0, // Properties don't have a direct price; nightly rate is dynamic
  })),
  ...MOCK_EXPERIENCES.filter((e) => WISHLIST_IDS.includes(e.id)).map((e) => ({
    id: e.id,
    title: e.name,
    type: "experience" as const,
    image: e.images[0] || "",
    location: e.location,
    price: e.pricePerPerson,
  })),
];

export default function ClientWishlistPage() {
  const navigate = useNavigate();
  // Shared by client and agent — route back into whichever portal is active.
  const role = useRole();
  const basePath = role === "agent" ? "/agent" : "/client";
  const [wishlisted, setWishlisted] = useState<Set<string>>(
    new Set(MOCK_WISHLIST.map((item) => item.id)),
  );

  const properties = MOCK_WISHLIST.filter((item) => item.type === "property");
  const experiences = MOCK_WISHLIST.filter(
    (item) => item.type === "experience",
  );

  const toggleWishlist = (id: string) => {
    const newSet = new Set(wishlisted);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setWishlisted(newSet);
  };

  const handleCardClick = (item: WishlistItem) => {
    if (item.type === "experience") {
      // Open the experience detail page; its Request button (slot picker)
      // then leads into the request-experience grid.
      navigate(`${basePath}/experience/${item.id}`);
    } else {
      // For properties: navigate normally to property detail
      navigate(`${basePath}/property/${item.id}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Properties Section */}
      {properties.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-neutral-950 mb-1">
              Properties
            </h2>
            <p className="text-sm text-neutral-600">
              {properties.length}{" "}
              {properties.length === 1 ? "Property" : "Properties"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer"
              >
                <div className="relative mb-3 overflow-hidden rounded-lg bg-neutral-200 h-56">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        wishlisted.has(item.id)
                          ? "fill-red-500 text-red-500"
                          : "text-neutral-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-950 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {item.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-neutral-900">
                        €{item.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiences Section */}
      {experiences.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-neutral-950 mb-1">
              Experiences
            </h2>
            <p className="text-sm text-neutral-600">
              {experiences.length}{" "}
              {experiences.length === 1 ? "Experience" : "Experiences"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer"
              >
                <div className="relative mb-3 overflow-hidden rounded-lg bg-neutral-200 h-56">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        wishlisted.has(item.id)
                          ? "fill-red-500 text-red-500"
                          : "text-neutral-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-950 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {item.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-neutral-900">
                        €{item.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {properties.length === 0 && experiences.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <p className="text-neutral-600">
            Your wishlist is empty. Heart your favorite properties and
            experiences to save them for later.
          </p>
        </div>
      )}
    </div>
  );
}
