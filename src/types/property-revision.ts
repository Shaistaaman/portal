/**
 * Property Revision Types
 *
 * Shared types for property versioning system used across backend and frontend.
 * Handles approval transactions, rejection workflow, and rollback operations.
 *
 * AWS TODO: These types are currently in frontend; move to shared backend package
 * when backend is created.
 */

// ──────────────── ENUMS ────────────────

export type PropertyRevisionType = "create" | "edit" | "rollback";
export type PropertyRevisionStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected";
export type PropertyStatus = "in_review" | "active" | "inactive" | "rejected";

// ──────────────── DATABASE MODELS ────────────────

/**
 * Property Revision Row (immutable, append-only audit log)
 */
export interface PropertyRevisionRow {
  id: string; // bigint, PK
  property_id: string; // FK → properties
  revision_no: number; // auto-increment per property
  type: PropertyRevisionType; // 'create' | 'edit' | 'rollback'
  status: PropertyRevisionStatus; // 'draft' | 'in_review' | 'approved' | 'rejected'

  // Submitter (owner or admin)
  submitted_by: string; // user_id
  submitted_at: string; // ISO 8601

  // Reviewer (admin only)
  reviewed_by?: string | null; // admin user_id
  reviewed_at?: string | null; // ISO 8601
  review_note?: string | null; // rejection reason

  // Full snapshot (immutable after creation)
  title: string;
  description?: string;
  inside_details?: string;
  terrace_details?: string;
  neighborhood_details?: string;
  size_label?: string;

  property_type?: string;
  management_level?: string;
  bedrooms: number;
  bathrooms: number;
  max_guests?: number;
  area_sqm?: number;
  floor_number?: string;
  listing_url?: string;
  brochure_key?: string;

  currency: string; // 'EUR'
  price_per_night: number;
  cleaning_fee?: number;
  service_fee?: number;
  tax_amount?: number;

  location_label?: string;
  region_id?: string;
  address?: string;
  latitude?: string;
  longitude?: string;

  account_name?: string;
  bank_account?: string;

  // JSON arrays (stored as JSONB in DB, parsed to strings in JS)
  image_keys: string[]; // S3 object keys: ["properties/123/1/hero.jpg", ...]
  amenity_ids: string[]; // Amenity IDs: ["1", "2", "5"]
  benefit_ids: string[]; // Benefit IDs: ["1", "3"]

  created_at: string; // ISO 8601
}

/**
 * Property Row (current state, points to current_revision_id)
 */
export interface PropertyRow {
  id: string;
  slug: string;
  owner_id: string;
  source: string; // 'internal' | 'krossbooking'
  external_ref?: string;
  status: PropertyStatus; // 'in_review' | 'active' | 'inactive' | 'rejected'
  rejection_reason?: string;
  is_featured: boolean;

  current_revision_id: string; // FK → property_revisions
  current_revision_approved_at?: string; // ISO 8601, denormalized

  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Property with current revision data (joined view)
 */
export interface PropertyWithCurrentRevision extends PropertyRow {
  current_revision: PropertyRevisionRow;
}

/**
 * Property with all revisions (for history view)
 */
export interface PropertyWithAllRevisions extends PropertyRow {
  revisions: PropertyRevisionRow[];
  pending_revision?: PropertyRevisionRow; // if exists
}

// ──────────────── API REQUEST/RESPONSE ────────────────

/**
 * Approve a pending revision
 */
export interface ApproveRevisionRequest {
  // Empty body or optional timestamp
  timestamp?: string;
  // Query param: ?archive=true (default)
}

export interface ApproveRevisionResponse {
  success: true;
  revisionId: string;
  propertyId: string;
  newStatus: "approved";
  currentRevisionId: string;
  approvedAt: string; // ISO 8601
  propertyStatus?: PropertyStatus; // if changed (e.g., in_review → active)
  message: string;
}

/**
 * Reject a pending revision
 */
export interface RejectRevisionRequest {
  reviewNote: string; // Required, must not be empty
  timestamp?: string;
}

export interface RejectRevisionResponse {
  success: true;
  revisionId: string;
  propertyId: string;
  newStatus: "rejected";
  reviewNote: string;
  rejectedAt: string; // ISO 8601
  message: string;
}

/**
 * Rollback to a previous approved revision
 */
export interface RollbackRevisionRequest {
  targetRevisionId: string; // The old approved revision to rollback to
  timestamp?: string;
}

export interface RollbackRevisionResponse {
  success: true;
  propertyId: string;
  newRevisionId: string;
  newRevisionNo: number;
  type: "rollback";
  status: "approved";
  rolledBackFrom: string; // target revision ID
  rolledBackFromRevisionNo: number;
  approvedAt: string; // ISO 8601
  imageStatus?: "available" | "expired"; // if images can't be rolled back (>30 days)
  message: string;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: string;
  code: string; // INVALID_REVISION | NOT_ADMIN | CONCURRENT_EDIT | etc.
  details?: Record<string, string>;
}

/**
 * Get pending revisions (for review queue)
 */
export interface GetPendingRevisionsRequest {
  status?: "in_review" | "rejected"; // Filter by status
  page?: number; // default 1
  limit?: number; // default 10, max 100
}

export interface GetPendingRevisionsResponse {
  pending: Array<
    PropertyRevisionRow & {
      property: Pick<PropertyRow, "id" | "slug" | "owner_id">;
    }
  >;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Get all revisions for a property (history)
 */
export interface GetPropertyRevisionsResponse {
  propertyId: string;
  current: PropertyRevisionRow;
  revisions: PropertyRevisionRow[]; // All revisions, newest first
  pendingRevision?: PropertyRevisionRow; // If exists (draft/in_review/rejected)
}

// ──────────────── TRANSACTION CONTEXT ────────────────

/**
 * Context passed to transaction handlers (admin user, timestamps, etc.)
 */
export interface TransactionContext {
  adminUserId: string;
  timestamp: Date;
  requestId: string; // For logging
  source: "api" | "admin_dashboard"; // Where the request came from
}

/**
 * Result of a transaction operation
 */
export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ──────────────── NOTIFICATIONS ────────────────

/**
 * Events triggered by revision transactions
 */
export type RevisionEventType =
  | "property_revision_submitted"
  | "property_revision_approved"
  | "property_revision_rejected"
  | "property_revision_resubmitted"
  | "property_rolled_back";

export interface RevisionEvent {
  type: RevisionEventType;
  propertyId: string;
  revisionId: string;
  revisionNo: number;
  adminUserId?: string;
  ownerId: string;
  timestamp: string; // ISO 8601
  data?: {
    reviewNote?: string; // For rejection
    rolledBackFrom?: string; // For rollback
  };
}

// ──────────────── S3 IMAGE HANDLING ────────────────

/**
 * Image archival strategy
 */
export interface ImageArchivalRequest {
  propertyId: string;
  oldRevisionId: string; // Source revision (being replaced)
  newRevisionId: string; // Target revision (now live)
  oldImageKeys: string[]; // Keys to archive
}

export interface ImageArchivalResult {
  success: boolean;
  archivedKeys: string[]; // Keys successfully moved to archive/
  failedKeys: string[]; // Keys that failed to copy
}

/**
 * Image rollback strategy (within 30 days)
 */
export interface ImageRollbackRequest {
  propertyId: string;
  revisionId: string;
  imageKeys: string[]; // Keys to restore from archive/
}

export interface ImageRollbackResult {
  success: boolean;
  restoredKeys: string[];
  expiredKeys: string[]; // Keys not found in archive (>30 days old)
}

// ──────────────── VALIDATIONS ────────────────

/**
 * Validate approve request
 */
export function validateApproveRequest(
  revision: PropertyRevisionRow,
  userRole: string,
): { valid: boolean; error?: string } {
  if (userRole !== "admin") {
    return {
      valid: false,
      error: "NOT_ADMIN: Only admins can approve revisions",
    };
  }
  if (!["in_review", "rejected"].includes(revision.status)) {
    return {
      valid: false,
      error: `INVALID_STATUS: Cannot approve revision with status=${revision.status}`,
    };
  }
  return { valid: true };
}

/**
 * Validate reject request
 */
export function validateRejectRequest(
  revision: PropertyRevisionRow,
  reviewNote: string,
  userRole: string,
): { valid: boolean; error?: string } {
  if (userRole !== "admin") {
    return { valid: false, error: "NOT_ADMIN" };
  }
  if (revision.status !== "in_review") {
    return {
      valid: false,
      error: `INVALID_STATUS: Cannot reject revision with status=${revision.status}`,
    };
  }
  if (!reviewNote || reviewNote.trim().length === 0) {
    return {
      valid: false,
      error: "EMPTY_REVIEW_NOTE: Review note is required",
    };
  }
  return { valid: true };
}

/**
 * Validate rollback request
 */
export function validateRollbackRequest(
  property: PropertyRow,
  targetRevision: PropertyRevisionRow,
  userRole: string,
  openRevisionExists: boolean,
): { valid: boolean; error?: string } {
  if (userRole !== "admin") {
    return { valid: false, error: "NOT_ADMIN" };
  }
  if (targetRevision.status !== "approved") {
    return {
      valid: false,
      error: `INVALID_TARGET: Target revision must be approved, got ${targetRevision.status}`,
    };
  }
  if (openRevisionExists) {
    return {
      valid: false,
      error:
        "CONCURRENT_EDIT: Cannot rollback while another revision is pending",
    };
  }
  if (!["active", "inactive"].includes(property.status)) {
    return {
      valid: false,
      error: `INVALID_PROPERTY_STATUS: Cannot rollback property with status=${property.status}`,
    };
  }
  return { valid: true };
}
