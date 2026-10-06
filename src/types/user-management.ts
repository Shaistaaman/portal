import type { UserRole } from "@/types/auth";

export type ManagedUserStatus = "active" | "inactive";

/**
 * Status a newly created user is saved with.
 *
 * Accounts are created dormant. An inactive user cannot sign in, so account
 * creation is a deliberate two-step: admin fills in the details, then
 * activates from the user list when the person is ready to be onboarded.
 *
 * The welcome email carrying credentials is sent **on activation**, not on
 * creation — otherwise the recipient would get a login that rejects them.
 *
 * UserForm still exposes an Active/Inactive toggle defaulted to this value,
 * so an admin can activate immediately when that is what they want. This
 * constant is the default, not a lock.
 */
export const USER_CREATION_STATUS: ManagedUserStatus = "inactive";

/**
 * A user record as managed from the admin User Management screens. This is
 * distinct from `types/auth.ts`'s `User` (the currently authenticated
 * session's identity) — this type models any user in the system that an
 * admin can view/create/edit, including role-specific fields that only
 * apply to agents.
 */
export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: ManagedUserStatus;
  avatarUrl: string;
  /** Agent-only fields. */
  agencyName?: string;
  licenseNumber?: string;
  aboutAgency?: string;
  /** Agency street address. Required for agents; the coordinates below are optional. */
  address?: string;
  latitude?: string;
  longitude?: string;
  /** Data-URL previews of uploaded agency documents/branding (demo only). */
  agencyLicensePreview?: string;
  brandImagePreview?: string;
  /** Set when an agent application was rejected and is pending resubmission. */
  rejectionReason?: string;
}

export interface UserFormValues {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  agencyName: string;
  licenseNumber: string;
  aboutAgency: string;
  address: string;
  latitude: string;
  longitude: string;
  agencyLicensePreview: string;
  brandImagePreview: string;
}

export const EMPTY_USER_FORM_VALUES: UserFormValues = {
  fullName: "",
  email: "",
  phone: "",
  role: "client",
  password: "",
  agencyName: "",
  licenseNumber: "",
  aboutAgency: "",
  address: "",
  latitude: "",
  longitude: "",
  agencyLicensePreview: "",
  brandImagePreview: "",
};
