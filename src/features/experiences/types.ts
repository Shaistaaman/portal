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

export type ExperienceStatus = "active" | "in_active";

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
  /** Free text, e.g. "3 Hours" or "Full Day". */
  duration: string;
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
  pricePerPerson: 0,
  maxGuests: 1,
  categories: [],
  season: "",
  description: "",
  specialRequirements: "",
  images: [],
};
