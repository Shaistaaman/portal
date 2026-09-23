/**
 * One Property type used by both the list/detail view and the add/edit
 * wizard. The Next.js reference (packages/ui/src/components/PropertyList.tsx
 * + AddPropertyWizard.tsx) had no shared type at all — the wizard collected
 * fields (`propertyName`, `beds`, `areaSqft` as a string, `amenities`,
 * `benefits`, `managementLevel`, `listingUrl`) that didn't map onto the
 * list's `Property` interface (`name`, `bedrooms`, `bathrooms`, `area` as a
 * number, single `image`, `ownerName` as a plain string) at all, and a
 * submission never actually produced one. This type reconciles both into
 * one shape a real submission can populate and the list/detail can render.
 */

export type PropertyStatus =
  "in_review" | "active" | "in_inactive" | "rejected";

export type PropertyManagementLevel = "full-service" | "marketing-only";

export type PropertyType = "penthouse" | "villa" | "apartment" | "other";

export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  status: PropertyStatus;
  /** Required when status is "rejected"; the admin's reason, shown to the owner. */
  rejectionReason?: string;
  /**
   * Admin-only. The marketing site's landing-page Collection section shows
   * up to 6 featured properties per city, so this is a deliberately scarce
   * flag admin sets — never part of the owner-facing form. See
   * AddPropertyWizard's "featured" question (admin role only).
   */
  isFeatured: boolean;

  propertyType: PropertyType | "";
  managementLevel: PropertyManagementLevel | "";
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  floorNumber: string;
  listingUrl: string;

  /** First entry is used as the list-view thumbnail and detail hero image. */
  images: string[];
  brochureUrl?: string;

  /** External iCal feed URLs for availability sync. Max 3 (see MAX_ICAL_URLS). */
  icalUrls: string[];

  amenities: string[];
  benefits: string[];

  /** Owner is a linked record (id + display fields), not just a name string. */
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string;
}

/**
 * The subset of Property fields the add/edit wizard actually collects.
 * Everything else (id, status, rejectionReason, ownerId/ownerName) is
 * assigned by the caller — the owner submitting a property doesn't set
 * their own id, and nobody sets status directly (it's derived from the
 * action taken, per the lifecycle in Project_Specification.md §4).
 */
export type PropertyFormValues = Pick<
  Property,
  | "name"
  | "location"
  | "description"
  | "propertyType"
  | "managementLevel"
  | "bedrooms"
  | "bathrooms"
  | "areaSqm"
  | "floorNumber"
  | "listingUrl"
  | "images"
  | "brochureUrl"
  | "icalUrls"
  | "amenities"
  | "benefits"
>;

export const DEFAULT_IS_FEATURED = false;

/** A property may have at most this many iCal feed URLs. */
export const MAX_ICAL_URLS = 3;

export const EMPTY_PROPERTY_FORM_VALUES: PropertyFormValues = {
  name: "",
  location: "",
  description: "",
  propertyType: "",
  managementLevel: "",
  bedrooms: 1,
  bathrooms: 1,
  areaSqm: 0,
  floorNumber: "",
  listingUrl: "",
  images: [],
  brochureUrl: undefined,
  icalUrls: [],
  amenities: [],
  benefits: [],
};

export const PROPERTY_AMENITIES = [
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

export const PROPERTY_BENEFITS = [
  "Luxury positioning",
  "Restyling and branding",
  "Premium guest matching",
  "Dedicated account manager",
];
