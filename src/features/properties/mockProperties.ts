import type { Property } from "./types";

/**
 * Mock property catalogue. Replace with a real API call once admin-fn
 * exists (see Context_Instruction.md §3/§8). ownerId values line up with
 * MOCK_USERS in features/user-management/mockUsers.ts (Giulia Romano is
 * "2", Elena Ricci is "6", Alessandro Barbieri is "9") so an owner session
 * scoped by ownerId has more than one property to look at.
 */
export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Villa Toscana",
    location: "Tuscany, Italy",
    description:
      "A restored 18th-century farmhouse set among rolling vineyards, with a private infinity pool overlooking the Val d'Orcia.",
    status: "active",
    propertyType: "villa",
    managementLevel: "full-service",
    bedrooms: 6,
    bathrooms: 5,
    areaSqm: 480,
    floorNumber: "",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Private Infinity Pool", "Wine Cellar", "Panoramic Sea View"],
    benefits: ["Luxury positioning", "Dedicated account manager"],
    ownerId: "2",
    ownerName: "Giulia Romano",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    id: "2",
    name: "Palazzo Roma Suite",
    location: "Rome, Italy",
    description:
      "An elegant top-floor suite in the historic center, walking distance from the Pantheon, fully renovated with period details preserved.",
    status: "active",
    propertyType: "apartment",
    managementLevel: "full-service",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 180,
    floorNumber: "4",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Concierge Service", "Smart Home System"],
    benefits: ["Restyling and branding"],
    ownerId: "9",
    ownerName: "Alessandro Barbieri",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=256&auto=format&fit=crop",
    isFeatured: false,
  },
  {
    id: "3",
    name: "Amalfi Cliffside Villa",
    location: "Amalfi Coast, Italy",
    description:
      "Perched above the Tyrrhenian Sea with terraced gardens and a private dock for boat access to the coastline.",
    status: "in_review",
    propertyType: "villa",
    managementLevel: "full-service",
    bedrooms: 7,
    bathrooms: 6,
    areaSqm: 620,
    floorNumber: "",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Private Dock / Marina", "Panoramic Sea View", "Hot Tub"],
    benefits: ["Luxury positioning", "Premium guest matching"],
    ownerId: "2",
    ownerName: "Giulia Romano",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    isFeatured: false,
  },
  {
    id: "4",
    name: "Lake Como Boathouse",
    location: "Lake Como, Italy",
    description:
      "A converted lakeside boathouse with floor-to-ceiling glass, private jetty, and views across to Bellagio.",
    status: "rejected",
    propertyType: "other",
    managementLevel: "marketing-only",
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 260,
    floorNumber: "",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Private Dock / Marina", "Panoramic Sea View"],
    benefits: [],
    ownerId: "6",
    ownerName: "Elena Ricci",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    rejectionReason:
      "Listing photos do not show the jetty/private dock referenced in the description. Please add supporting images and resubmit.",
    isFeatured: false,
  },
  {
    id: "5",
    name: "Venice Canal Residence",
    location: "Venice, Italy",
    description:
      "A three-story residence directly on a quiet canal in Dorsoduro, with a private water-entrance and rooftop terrace.",
    status: "active",
    propertyType: "apartment",
    managementLevel: "full-service",
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 210,
    floorNumber: "",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Rooftop Terrace", "Concierge Service"],
    benefits: ["Restyling and branding"],
    ownerId: "9",
    ownerName: "Alessandro Barbieri",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=256&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    id: "6",
    name: "Sicilian Masseria",
    location: "Sicily, Italy",
    description:
      "A restored 19th-century masseria surrounded by olive groves, with an orchard, wood-fired oven, and staff quarters.",
    status: "in_inactive",
    propertyType: "villa",
    managementLevel: "full-service",
    bedrooms: 8,
    bathrooms: 7,
    areaSqm: 720,
    floorNumber: "",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Garden & Orchard", "Staff Quarters", "Wine Cellar"],
    benefits: ["Luxury positioning"],
    ownerId: "2",
    ownerName: "Giulia Romano",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    isFeatured: false,
  },
  {
    id: "7",
    name: "Milan Penthouse",
    location: "Milan, Italy",
    description:
      "A designer penthouse in the Quadrilatero della Moda with a wraparound terrace and skyline views.",
    status: "active",
    propertyType: "penthouse",
    managementLevel: "marketing-only",
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 240,
    floorNumber: "9",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Rooftop Terrace", "Gym / Fitness Studio", "Smart Home System"],
    benefits: ["Premium guest matching"],
    ownerId: "6",
    ownerName: "Elena Ricci",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    id: "8",
    name: "Tuscan Vineyard Estate",
    location: "Chianti, Tuscany",
    description:
      "A working vineyard estate with guest villa, tasting room, and panoramic views over the Chianti hills.",
    status: "in_review",
    propertyType: "villa",
    managementLevel: "full-service",
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 390,
    floorNumber: "",
    listingUrl: "",
    images: [
      "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=1200&auto=format&fit=crop",
    ],
    amenities: ["Wine Cellar", "Garden & Orchard"],
    benefits: ["Luxury positioning", "Dedicated account manager"],
    ownerId: "9",
    ownerName: "Alessandro Barbieri",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=256&auto=format&fit=crop",
    isFeatured: false,
  },
];

export function findMockPropertyById(id: string): Property | undefined {
  return MOCK_PROPERTIES.find((property) => property.id === id);
}
