import type { UserRole } from "@/types/auth";

export type ManagedUserStatus = "active" | "inactive";

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
  latitude: "",
  longitude: "",
  agencyLicensePreview: "",
  brandImagePreview: "",
};
