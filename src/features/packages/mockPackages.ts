import type { Package } from "./types";

/**
 * Mock packages catalogue. Replace with a real API call once admin-fn
 * exists (see Context_Instruction.md §3/§8). Built fresh from the wizard
 * reference designs — there is no Next.js reference dataset for packages.
 */
export const MOCK_PACKAGES: Package[] = [
  {
    id: "1",
    name: "Rome Eternal Elegance",
    status: "active",
    duration: "7 Days",
    basePrice: 12500,
    guestCapacity: 2,
    bestSeason: "March - September",
    description:
      "A seven-day immersion into the eternal city, pairing a private residence near the Pantheon with curated after-hours access, private dining, and a dedicated concierge throughout.",
    images: [
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    highlights: [
      "Night tour of the Valley of the Temples",
      "Baroque Architecture in Modica",
      "Private dining at a Michelin-starred trattoria",
      "Vatican after-hours private access",
    ],
    inclusions: [
      {
        id: "inc-1",
        heading: "Soul In The City",
        category: "Culture & Gastronomy",
        image:
          "https://images.pexels.com/photos/3935683/pexels-photo-3935683.jpeg?auto=compress&cs=tinysrgb&w=600",
        highlights:
          "Your private tour of Rome starts in its oldest market, Campo de' Fiori, with the opportunity to indulge in the city's long-standing culinary reputation, then explore the baroque palaces and much-loved sites.",
      },
    ],
  },
  {
    id: "2",
    name: "Sicilian Baroque Journey",
    status: "active",
    duration: "10 Days",
    basePrice: 18900,
    guestCapacity: 4,
    bestSeason: "April - October",
    description:
      "A ten-day route through south-eastern Sicily's baroque towns, blending private architecture tours, street-food discovery, and a day on the slopes of Mount Etna.",
    images: [
      "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    highlights: [
      "Night tour of the Valley of the Temples",
      "Baroque Architecture in Modica",
      "Sicilian Cooking Class in Ragusa Ibla",
      "4x4 Tour of Mount Etna",
    ],
    inclusions: [
      {
        id: "inc-2",
        heading: "Soul In The City",
        category: "Culture & Gastronomy",
        image:
          "https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600",
        highlights:
          "Your private tour of Palermo starts in its oldest market, Capo, where you'll have the opportunity to indulge in Palermo's street food, then explore the wide boulevards and baroque palaces.",
      },
    ],
  },
  {
    id: "3",
    name: "Amalfi Coast Escape",
    status: "in_active",
    duration: "5 Days",
    basePrice: 9800,
    guestCapacity: 2,
    bestSeason: "May - September",
    description:
      "Five days along the Amalfi Coast with a private cliffside villa, a chartered boat day, and a hands-on lemon-grove-to-table cooking experience.",
    images: [
      "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    highlights: [
      "Private boat day to hidden coves",
      "Cliffside villa with infinity pool",
      "Lemon-grove cooking experience",
    ],
    inclusions: [
      {
        id: "inc-3",
        heading: "Coastline By Sea",
        category: "Outdoor & Leisure",
        image:
          "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600",
        highlights:
          "A full day aboard a private gozzo along the coastline, with swimming stops in secluded coves and lunch at a family-run cliffside restaurant.",
      },
    ],
  },
];

export function findMockPackageById(id: string): Package | undefined {
  return MOCK_PACKAGES.find((pkg) => pkg.id === id);
}
