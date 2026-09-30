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

export type PropertyStatus = "in_review" | "active" | "inactive" | "rejected";

/**
 * Status a newly created property is saved with — always "in_review",
 * whether an admin or an owner submitted it, per the lifecycle in
 * Project_Specification.md §4. Only an admin moves it to "active"
 * (approve) or "rejected" (reject, reason required).
 *
 * This also applies to an edit: re-submitting a property returns it to
 * review. The plain active ↔ inactive visibility toggle is done from the
 * property list, not through the wizard, and does not re-trigger review.
 */
export const PROPERTY_CREATION_STATUS: PropertyStatus = "in_review";

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

  /**
   * Street address, collected in the wizard's Identity step ahead of the
   * optional coordinates. `location` remains the short display label
   * ("Rome, Italy") that the list and marketing cards render; `address` is
   * the full postal address used for geocoding and guest directions.
   */
  address?: string;
  /**
   * Optional map coordinates. Strings, not numbers, to match how the agent
   * form in features/user-management already collects them — a partially
   * typed "43." must not become NaN mid-edit. Parse at the boundary.
   */
  latitude?: string;
  longitude?: string;

  /**
   * Per-property financial terms, collected in the wizard's Financials
   * step. All monetary amounts are in euros (see PROPERTY_CURRENCY) — this
   * is an Italian portal and no other currency is supported.
   *
   * These override the org-wide defaults when set. Org defaults live in
   * the calendar feature's OrgFees (cleaning 150, service 75, taxes 10%).
   */
  serviceFee?: number;
  cleaningFee?: number;
  /** Tax rate as a percentage, e.g. 10 means 10% — not a fraction. */
  taxPct?: number;
  /** IBAN the property's payouts are sent to. */
  bankAccount?: string;

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
> &
  /**
   * Optional on `Property` because records created before these fields
   * existed won't have them, but always present on the form — the wizard
   * collects every one of them, defaulting to "" or 0.
   */
  Required<
    Pick<
      Property,
      | "address"
      | "latitude"
      | "longitude"
      | "serviceFee"
      | "cleaningFee"
      | "taxPct"
      | "bankAccount"
    >
  >;

/**
 * The two fields only an admin may set, kept in one object so the wizard's
 * onSubmit signature doesn't grow a new positional boolean every time an
 * admin-only control is added.
 *
 * - `isFeatured` — capped at 6 per city on the marketing landing page.
 * - `ownerId` — which owner the property belongs to. An owner submitting
 *   their own property is implicitly the owner, so this is admin-only.
 *   Empty string means "not yet assigned", which is allowed: an admin may
 *   add a property before the owner's account exists.
 */
export interface AdminOnlyPropertyFields {
  isFeatured: boolean;
  ownerId: string;
}

export const DEFAULT_ADMIN_ONLY_FIELDS: AdminOnlyPropertyFields = {
  isFeatured: false,
  ownerId: "",
};

export const DEFAULT_IS_FEATURED = false;

/**
 * Every price in this portal is euros. Skylife is an Italian operation and
 * multi-currency is explicitly out of scope — see Documents/database-design.md
 * §2.5 and §9.4, where the one stray "USD" reference in the packages feature
 * is recorded as a code comment error rather than a real requirement.
 */
export const PROPERTY_CURRENCY = "EUR";
export const PROPERTY_CURRENCY_SYMBOL = "€";

/** A property may have at most this many iCal feed URLs. */
export const MAX_ICAL_URLS = 3;

/**
 * Image count bounds for a property listing. A listing needs enough photos
 * to be credible (min) but not so many that the gallery and upload payload
 * become unwieldy (max). The wizard blocks leaving the Imagery step below
 * the minimum and stops accepting files at the maximum.
 */
export const MIN_PROPERTY_IMAGES = 4;
export const MAX_PROPERTY_IMAGES = 40;

export const EMPTY_PROPERTY_FORM_VALUES: PropertyFormValues = {
  name: "",
  location: "",
  address: "",
  latitude: "",
  longitude: "",
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
  serviceFee: 0,
  cleaningFee: 0,
  taxPct: 0,
  bankAccount: "",
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
