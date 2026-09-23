/**
 * Package types, modeled from the add/edit wizard reference designs. Like
 * Experiences, Packages are admin-only (Project_Specification.md §3) with a
 * plain active/in_active status and no approval workflow. There is no
 * Next.js reference implementation for packages (the reference app's
 * packages page was a "coming soon" stub), so this is built fresh from the
 * provided wizard screens.
 */

export type PackageStatus = "active" | "in_active";

/**
 * One "What You Get In This Package?" entry from the wizard's Specifications
 * step — a bespoke service/architectural highlight with its own heading,
 * category, image, and description.
 */
export interface PackageHighlightBlock {
  id: string;
  heading: string;
  category: string;
  /** Data-URL of the uploaded image (demo only). */
  image: string;
  highlights: string;
}

export interface Package {
  id: string;
  name: string;
  status: PackageStatus;
  duration: string;
  /** Base price in USD (reference shows a "$12,500"-style value). */
  basePrice: number;
  guestCapacity: number;
  bestSeason: string;
  description: string;
  /** First entry is the list-view thumbnail and detail hero image. */
  images: string[];
  /** The top-level "Highlights" bullet list on the Specifications step. */
  highlights: string[];
  /** The repeating "What You Get In This Package?" blocks. */
  inclusions: PackageHighlightBlock[];
}

export type PackageFormValues = Pick<
  Package,
  | "name"
  | "duration"
  | "basePrice"
  | "guestCapacity"
  | "bestSeason"
  | "description"
  | "images"
  | "highlights"
  | "inclusions"
>;

export function createHighlightBlock(): PackageHighlightBlock {
  return {
    id: crypto.randomUUID(),
    heading: "",
    category: "",
    image: "",
    highlights: "",
  };
}

export const EMPTY_PACKAGE_FORM_VALUES: PackageFormValues = {
  name: "",
  duration: "",
  basePrice: 0,
  guestCapacity: 1,
  bestSeason: "",
  description: "",
  images: [],
  highlights: [],
  inclusions: [createHighlightBlock()],
};
