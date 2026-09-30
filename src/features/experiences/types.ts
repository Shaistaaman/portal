/**
 * One Experience type used by both the list/detail view and the add/edit
 * wizard. The Next.js reference (packages/ui ExperienceList +
 * AddExperienceWizard) had the same shared-type gap Properties did: the
 * wizard collected 5 loosely-named fields (`experienceName`,
 * `experienceCategory` as a single string, `duration` as free text,
 * `pricePerPerson` as a string, `narrativeDescription`) with steps 2-3
 * unwired, and never produced anything matching the list's `Experience`
 * interface. This reconciles both into one shape the wizard populates and
 * the list renders.
 *
 * Experiences are admin-only (Project_Specification.md §3) — no role prop,
 * no owner/agent scoping, no approval workflow. Status is a plain
 * active/inactive on-off toggle, not the property in_review/rejected cycle.
 */

export type ExperienceStatus = "active" | "inactive";

/**
 * Status a newly created experience is saved with.
 *
 * New experiences are drafts: the marketing site only reads "active"
 * content, so nothing is publicly visible until an admin explicitly
 * switches it on from the experience list. This gives the author a chance
 * to review copy and imagery before it goes live.
 */
export const EXPERIENCE_CREATION_STATUS: ExperienceStatus = "inactive";

/**
 * Image count bounds for an experience listing. Enforced by the add/edit
 * wizard: it stops accepting files at the maximum and blocks submission
 * below the minimum.
 */
export const MIN_EXPERIENCE_IMAGES = 4;
export const MAX_EXPERIENCE_IMAGES = 25;

export type ExperienceCategory =
  | "History & Culture"
  | "Culinary Adventures"
  | "Outdoor Tours"
  | "Closed-to-the-Public"
  | "Family"
  | "At-Home"
  | "One-Day City Escapes";

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  "History & Culture",
  "Culinary Adventures",
  "Outdoor Tours",
  "Closed-to-the-Public",
  "Family",
  "At-Home",
  "One-Day City Escapes",
];

export interface Experience {
  id: string;
  name: string;
  location: string;
  status: ExperienceStatus;
  /** First entry is the list-view thumbnail and detail hero image. */
  images: string[];
  /** Free text, e.g. "3 Hours" or "Full Day". Display only. */
  duration: string;
  /**
   * The experience's actual length in minutes. Unlike `duration` (display
   * text), this is the number the client booking flow uses: a requested
   * slot must be exactly this long and must fit inside the daily bookable
   * window below.
   */
  durationMinutes: number;
  /**
   * Daily bookable window, same every day, as "HH:MM" 24-hour strings.
   * A client may request any slot of length `durationMinutes` that starts
   * at or after `bookableFrom` and ends at or before `bookableUntil`.
   * e.g. window 09:00–17:00 with a 180-minute duration lets a client pick
   * 10:00–13:00, 11:30–14:30, and so on.
   */
  bookableFrom: string;
  bookableUntil: string;
  /** Starting price per person, in euros. */
  pricePerPerson: number;
  maxGuests: number;
  categories: ExperienceCategory[];
  /** Free text, e.g. "April-October" or "Year-round". */
  season: string;
  description: string;
  specialRequirements: string;
}

export type ExperienceFormValues = Pick<
  Experience,
  | "name"
  | "location"
  | "duration"
  | "durationMinutes"
  | "bookableFrom"
  | "bookableUntil"
  | "pricePerPerson"
  | "maxGuests"
  | "categories"
  | "season"
  | "description"
  | "specialRequirements"
  | "images"
>;

export const EMPTY_EXPERIENCE_FORM_VALUES: ExperienceFormValues = {
  name: "",
  location: "",
  duration: "",
  durationMinutes: 0,
  bookableFrom: "",
  bookableUntil: "",
  pricePerPerson: 0,
  maxGuests: 1,
  categories: [],
  season: "",
  description: "",
  specialRequirements: "",
  images: [],
};

/**
 * Parse an "HH:MM" 24-hour string to minutes since midnight, or null if it
 * is empty/malformed. Used to validate the bookable window against the
 * experience duration.
 */
export function timeToMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (hours > 23 || mins > 59) return null;
  return hours * 60 + mins;
}
