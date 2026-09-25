import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  id: string;
  title: string;
  type: "property" | "experience";
  image: string;
  location: string;
  price: number;
}

const MOCK_WISHLIST: WishlistItem[] = [
  // Properties
  {
    id: "prop-1",
    title: "Tiber Luxury Penthouse",
    type: "property",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=400",
    location: "Rome",
    price: 750,
  },
  {
    id: "prop-2",
    title: "360 Penthouse",
    type: "property",
    image:
      "https://images.unsplash.com/photo-1499209974033-537250602fbf?q=80&w=400",
    location: "Florence",
    price: 123,
  },
  // Experiences
  {
    id: "exp-1",
    title: "Vatican VIP Tour",
    type: "experience",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400",
    location: "Vatican City",
    price: 750,
  },
  {
    id: "exp-2",
    title: "Roman Golf Cart Tour",
    type: "experience",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400",
    location: "Rome",
    price: 123,
  },
];

export default function ClientWishlistPage() {
  const navigate = useNavigate();
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
    // For experiences: navigate to request-experience with wishlist flow flag
    if (item.type === "experience") {
      navigate(`/client/property/${item.id}/request-experience`, {
        state: {
          selectedExperiences: [
            {
              id: item.id,
              title: item.title,
              price: item.price,
              rating: 4.9,
              image: item.image,
              category: "Experience",
              location: item.location,
            },
          ],
          isWishlistFlow: true, // Flag to hide back button, property section, and redirect on completion
        },
      });
    } else {
      // For properties: navigate normally to property detail
      navigate(`/client/property/${item.id}`);
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
