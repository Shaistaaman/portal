import type { Experience } from "./types";

/**
 * Mock experiences catalogue. Replace with a real API call once admin-fn
 * exists (see Context_Instruction.md §3/§8). Ported from the Next.js
 * reference's inline DUMMY_EXPERIENCES, conformed to the richer shared
 * Experience type (images array, numeric price, wired maxGuests/season).
 */
export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: "1",
    name: "Cooking Class with Italian Grandmothers",
    location: "Rome",
    status: "active",
    images: [
      "https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "3 Hours",
    durationMinutes: 180,
    bookableFrom: "09:00",
    bookableUntil: "17:00",
    pricePerPerson: 180,
    maxGuests: 8,
    categories: ["Culinary Adventures", "Family"],
    season: "March-September",
    description:
      "Learn authentic Italian cooking from local grandmothers in their own kitchens, then share the meal you've made together over regional wine.",
    specialRequirements: "",
  },
  {
    id: "2",
    name: "Pasta Making Masterclass",
    location: "Rome",
    status: "inactive",
    images: [
      "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "2 Hours",
    durationMinutes: 120,
    bookableFrom: "10:00",
    bookableUntil: "18:00",
    pricePerPerson: 150,
    maxGuests: 8,
    categories: ["Culinary Adventures", "At-Home"],
    season: "March-September",
    description:
      "Master the art of traditional hand-made pasta with a professional chef, from dough to plate.",
    specialRequirements: "",
  },
  {
    id: "3",
    name: "Historic Rome Walking Tour",
    location: "Rome",
    status: "active",
    images: [
      "https://images.pexels.com/photos/3935683/pexels-photo-3935683.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "4 Hours",
    durationMinutes: 240,
    bookableFrom: "09:00",
    bookableUntil: "18:00",
    pricePerPerson: 120,
    maxGuests: 12,
    categories: ["History & Culture", "One-Day City Escapes"],
    season: "Year-round",
    description:
      "Explore the ancient ruins and historical landmarks of Rome with expert guides who bring two thousand years of history to life.",
    specialRequirements: "Comfortable walking shoes recommended.",
  },
  {
    id: "4",
    name: "Tuscany Wine Tasting Experience",
    location: "Tuscany",
    status: "active",
    images: [
      "https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "Full Day",
    durationMinutes: 480,
    bookableFrom: "08:00",
    bookableUntil: "18:00",
    pricePerPerson: 320,
    maxGuests: 10,
    categories: ["Culinary Adventures", "Outdoor Tours"],
    season: "April-October",
    description:
      "A private-estate tour through the Chianti hills with tastings of small-production wines paired with local produce.",
    specialRequirements: "",
  },
  {
    id: "5",
    name: "Amalfi Coast Private Boat Day",
    location: "Amalfi Coast",
    status: "active",
    images: [
      "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "Full Day",
    durationMinutes: 480,
    bookableFrom: "08:00",
    bookableUntil: "18:00",
    pricePerPerson: 480,
    maxGuests: 6,
    categories: ["Outdoor Tours", "One-Day City Escapes"],
    season: "May-September",
    description:
      "Cruise the Amalfi coastline on a private gozzo, with swimming stops in hidden coves and lunch at a cliffside trattoria.",
    specialRequirements: "",
  },
  {
    id: "6",
    name: "Vatican After-Hours Private Access",
    location: "Rome",
    status: "inactive",
    images: [
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "3 Hours",
    durationMinutes: 180,
    bookableFrom: "09:00",
    bookableUntil: "17:00",
    pricePerPerson: 550,
    maxGuests: 8,
    categories: ["History & Culture", "Closed-to-the-Public"],
    season: "Year-round",
    description:
      "Walk the Sistine Chapel and Vatican galleries after public closing, with a private art historian and no crowds.",
    specialRequirements: "Dress code enforced: shoulders and knees covered.",
  },
  {
    id: "7",
    name: "Positano Art Workshop",
    location: "Positano",
    status: "active",
    images: [
      "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    duration: "Half Day",
    durationMinutes: 240,
    bookableFrom: "09:00",
    bookableUntil: "15:00",
    pricePerPerson: 210,
    maxGuests: 10,
    categories: ["At-Home", "Family"],
    season: "April-October",
    description:
      "Create art inspired by the colour and light of Positano, guided by a local painter on a private terrace above the sea.",
    specialRequirements: "",
  },
  // Wishlist demo experiences — ids match the wishlist entries so a
  // wishlisted card lands on this experience's detail page.
  {
    id: "exp-1",
    name: "Vatican VIP Tour",
    location: "Vatican City",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
      "https://images.unsplash.com/photo-1520763185298-1b434c919abe?q=80&w=800",
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800",
      "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?q=80&w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800",
    ],
    duration: "3 Hours",
    durationMinutes: 180,
    bookableFrom: "09:00",
    bookableUntil: "17:00",
    pricePerPerson: 750,
    maxGuests: 8,
    categories: ["History & Culture", "Closed-to-the-Public"],
    season: "Year-round",
    description:
      "Skip the queues for a privately guided tour of the Vatican Museums, Sistine Chapel, and St. Peter's Basilica with an expert art historian.",
    specialRequirements: "Dress code enforced: shoulders and knees covered.",
  },
  {
    id: "exp-2",
    name: "Roman Golf Cart Tour",
    location: "Rome",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
      "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?q=80&w=800",
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
    ],
    duration: "2 Hours",
    durationMinutes: 120,
    bookableFrom: "10:00",
    bookableUntil: "18:00",
    pricePerPerson: 123,
    maxGuests: 4,
    categories: ["History & Culture", "One-Day City Escapes"],
    season: "Year-round",
    description:
      "Glide through Rome's historic center by private golf cart, covering more ground than a walking tour while your guide shares the city's stories.",
    specialRequirements: "",
  },
];

export function findMockExperienceById(id: string): Experience | undefined {
  return MOCK_EXPERIENCES.find((experience) => experience.id === id);
}
