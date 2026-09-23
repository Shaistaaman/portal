import type { Blog } from "./types";

/**
 * Mock blogs. Replace with a real API call once admin-fn exists (see
 * Context_Instruction.md §3/§8).
 */
export const MOCK_BLOGS: Blog[] = [
  {
    id: "1",
    title: "A Weekend in Eternal Rome",
    subtitle: "How to experience the city like a local, beyond the crowds.",
    status: "active",
    bannerImage:
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=1200",
    highlights: [
      "Where to find Rome's best hidden trattorias",
      "After-hours access to the Vatican",
      "A morning at Campo de' Fiori market",
    ],
    sections: [
      {
        id: "sec-1",
        heading: "Soul In The City",
        category: "Culture & Gastronomy",
        image:
          "https://images.pexels.com/photos/3935683/pexels-photo-3935683.jpeg?auto=compress&cs=tinysrgb&w=600",
        content:
          "Rome rewards the unhurried. Begin your morning at Campo de' Fiori, where the market has run for centuries, then wander the baroque backstreets toward the Pantheon before the tour groups arrive.",
      },
    ],
  },
  {
    id: "2",
    title: "The Quiet Luxury of the Amalfi Coast",
    subtitle: "Slow travel along Italy's most storied coastline.",
    status: "active",
    bannerImage:
      "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1200",
    highlights: [
      "Chartering a private gozzo for the day",
      "The best cliffside tables in Positano",
    ],
    sections: [
      {
        id: "sec-2",
        heading: "Coastline By Sea",
        category: "Outdoor & Leisure",
        image:
          "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600",
        content:
          "The coast is best understood from the water. A private boat lets you slip into coves the roads never reach, dropping anchor for a swim before a long lunch ashore.",
      },
    ],
  },
  {
    id: "3",
    title: "Baroque Sicily, Town by Town",
    subtitle: "A route through the south-east's golden-stone cities.",
    status: "in_active",
    bannerImage:
      "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1200",
    highlights: [
      "Modica, Ragusa Ibla, and Noto in three days",
      "A cooking class in a restored palazzo",
    ],
    sections: [
      {
        id: "sec-3",
        heading: "Golden Stone",
        category: "Architecture",
        image:
          "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600",
        content:
          "Rebuilt after the 1693 earthquake, south-eastern Sicily's towns share a single, unified baroque language — best appreciated on foot, in the low light of late afternoon.",
      },
    ],
  },
];

export function findMockBlogById(id: string): Blog | undefined {
  return MOCK_BLOGS.find((blog) => blog.id === id);
}
