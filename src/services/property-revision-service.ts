/**
 * Property Revision Service
 *
 * Handles approval, rejection, and rollback transactions for property revisions.
 * All operations are atomic (all-or-nothing) transactions.
 *
 * AWS TODO: This is a mock service for the portal frontend.
 * Move to backend Lambda handlers when backend is created.
 */

import type {
  PropertyRevisionRow,
  PropertyRow,
  PropertyStatus,
  ApproveRevisionResponse,
  RejectRevisionResponse,
  RollbackRevisionResponse,
  TransactionContext,
  TransactionResult,
} from "@/types/property-revision";

import {
  validateApproveRequest,
  validateRejectRequest,
  validateRollbackRequest,
} from "@/types/property-revision";

/**
 * Mock database for development
 * AWS TODO: Replace with actual RDS Data API calls
 */
class MockPropertyRevisionDatabase {
  private revisions: Map<string, PropertyRevisionRow> = new Map();
  private properties: Map<string, PropertyRow> = new Map();

  async getRevision(revisionId: string): Promise<PropertyRevisionRow | null> {
    return this.revisions.get(revisionId) || null;
  }

  async getProperty(propertyId: string): Promise<PropertyRow | null> {
    return this.properties.get(propertyId) || null;
  }

  async getOpenRevisionForProperty(
    propertyId: string,
  ): Promise<PropertyRevisionRow | null> {
    for (const rev of this.revisions.values()) {
      if (
        rev.property_id === propertyId &&
        ["draft", "in_review", "rejected"].includes(rev.status)
      ) {
        return rev;
      }
    }
    return null;
  }

  async startTransaction(): Promise<MockTransaction> {
    return new MockTransaction(this.revisions, this.properties);
  }
}

/**
 * Mock transaction (simulates ACID transaction)
 * AWS TODO: Use actual database transaction (BEGIN...COMMIT/ROLLBACK)
 */
class MockTransaction {
  private revisionUpdates: Map<string, Partial<PropertyRevisionRow>>;
  private propertyUpdates: Map<string, Partial<PropertyRow>>;
  private revisions: Map<string, PropertyRevisionRow>;
  private properties: Map<string, PropertyRow>;

  constructor(
    revisions: Map<string, PropertyRevisionRow>,
    properties: Map<string, PropertyRow>,
  ) {
    this.revisions = revisions;
    this.properties = properties;
    this.revisionUpdates = new Map();
    this.propertyUpdates = new Map();
  }

  updateRevision(
    revisionId: string,
    updates: Partial<PropertyRevisionRow>,
  ): void {
    const rev = this.revisions.get(revisionId);
    if (!rev) throw new Error("REVISION_NOT_FOUND");
    this.revisionUpdates.set(revisionId, { ...rev, ...updates });
  }

  updateProperty(propertyId: string, updates: Partial<PropertyRow>): void {
    const prop = this.properties.get(propertyId);
    if (!prop) throw new Error("PROPERTY_NOT_FOUND");
    this.propertyUpdates.set(propertyId, { ...prop, ...updates });
  }

  insertRevision(revision: PropertyRevisionRow): void {
    this.revisions.set(revision.id, revision);
  }

  async commit(): Promise<void> {
    // Apply all updates
    this.revisionUpdates.forEach((updates, id) => {
      const current = this.revisions.get(id);
      if (current) {
        this.revisions.set(id, { ...current, ...updates });
      }
    });

    this.propertyUpdates.forEach((updates, id) => {
      const current = this.properties.get(id);
      if (current) {
        this.properties.set(id, { ...current, ...updates });
      }
    });
  }

  async rollback(): Promise<void> {
    this.revisionUpdates.clear();
    this.propertyUpdates.clear();
  }
}

/**
 * Property Revision Service
 */
export class PropertyRevisionService {
  private db = new MockPropertyRevisionDatabase();

  /**
   * Approve a property revision (atomic transaction)
   */
  async approveRevision(
    revisionId: string,
    context: TransactionContext,
  ): Promise<TransactionResult<ApproveRevisionResponse>> {
    try {
      // 1. VALIDATE
      const revision = await this.db.getRevision(revisionId);
      if (!revision) {
        return {
          success: false,
          error: {
            code: "REVISION_NOT_FOUND",
            message: "Revision does not exist",
          },
        };
      }

      const property = await this.db.getProperty(revision.property_id);
      if (!property) {
        return {
          success: false,
          error: {
            code: "PROPERTY_NOT_FOUND",
            message: "Property does not exist",
          },
        };
      }

      const validation = validateApproveRequest(revision, "admin"); // AWS TODO: actual role from context
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: validation.error || "Validation failed",
          },
        };
      }

      // 2. START TRANSACTION
      const transaction = await this.db.startTransaction();

      try {
        // 3. COPY SNAPSHOT TO PROPERTIES
        transaction.updateProperty(property.id, {
          current_revision_id: revisionId,
          current_revision_approved_at: context.timestamp.toISOString(),
          updated_at: context.timestamp.toISOString(),
        });

        // 4. MARK REVISION APPROVED
        transaction.updateRevision(revisionId, {
          status: "approved",
          reviewed_by: context.adminUserId,
          reviewed_at: context.timestamp.toISOString(),
        });

        // 5. IF NEW PROPERTY, SET STATUS TO ACTIVE
        let propertyStatusAfter: PropertyStatus = property.status;
        if (revision.type === "create" && property.status === "in_review") {
          transaction.updateProperty(property.id, { status: "active" });
          propertyStatusAfter = "active";
        }

        // 6. COMMIT
        await transaction.commit();

        // AWS TODO: Post-commit actions (async, non-blocking)
        // - Archive old images if revision.type === 'edit'
        // - Send email notification to property owner
        // - Log to CloudWatch audit trail
        this.schedulePostCommitActions(property.id, revision, context);

        return {
          success: true,
          data: {
            success: true,
            revisionId,
            propertyId: property.id,
            newStatus: "approved",
            currentRevisionId: revisionId,
            approvedAt: context.timestamp.toISOString(),
            propertyStatus: propertyStatusAfter,
            message: `Property revision approved and is now ${propertyStatusAfter}.`,
          },
        };
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: {
          code: "APPROVAL_FAILED",
          message: errorMsg,
        },
      };
    }
  }

  /**
   * Reject a property revision
   */
  async rejectRevision(
    revisionId: string,
    reviewNote: string,
    context: TransactionContext,
  ): Promise<TransactionResult<RejectRevisionResponse>> {
    try {
      const revision = await this.db.getRevision(revisionId);
      if (!revision) {
        return {
          success: false,
          error: {
            code: "REVISION_NOT_FOUND",
            message: "Revision does not exist",
          },
        };
      }

      const validation = validateRejectRequest(revision, reviewNote, "admin");
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: validation.error || "Validation failed",
          },
        };
      }

      // TRANSACTION: Mark revision rejected (simple, no property changes)
      const transaction = await this.db.startTransaction();
      try {
        transaction.updateRevision(revisionId, {
          status: "rejected",
          reviewed_by: context.adminUserId,
          reviewed_at: context.timestamp.toISOString(),
          review_note: reviewNote,
        });

        await transaction.commit();

        // AWS TODO: Post-commit actions
        // - Archive revision's images
        // - Send rejection notification to owner
        // - Log to CloudWatch
        this.schedulePostCommitActions(
          revision.property_id,
          revision,
          context,
          reviewNote,
        );

        return {
          success: true,
          data: {
            success: true,
            revisionId,
            propertyId: revision.property_id,
            newStatus: "rejected",
            reviewNote: (reviewNote || "") as string,
            rejectedAt: context.timestamp.toISOString(),
            message:
              "Property revision rejected. Owner can re-edit and resubmit.",
          },
        };
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: {
          code: "REJECTION_FAILED",
          message: errorMsg,
        },
      };
    }
  }

  /**
   * Rollback to a previous approved revision
   */
  async rollbackRevision(
    propertyId: string,
    targetRevisionId: string,
    context: TransactionContext,
  ): Promise<TransactionResult<RollbackRevisionResponse>> {
    try {
      const property = await this.db.getProperty(propertyId);
      if (!property) {
        return {
          success: false,
          error: {
            code: "PROPERTY_NOT_FOUND",
            message: "Property does not exist",
          },
        };
      }

      const targetRevision = await this.db.getRevision(targetRevisionId);
      if (!targetRevision || targetRevision.property_id !== propertyId) {
        return {
          success: false,
          error: {
            code: "TARGET_REVISION_NOT_FOUND",
            message:
              "Target revision does not exist or belongs to different property",
          },
        };
      }

      const openRevision = await this.db.getOpenRevisionForProperty(propertyId);
      const validation = validateRollbackRequest(
        property,
        targetRevision,
        "admin",
        !!openRevision,
      );
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: validation.error || "Validation failed",
          },
        };
      }

      const transaction = await this.db.startTransaction();
      try {
        // Create new rollback revision (auto-approved, type=rollback)
        const newRevisionNo =
          (Math.max(...Array.from({ length: 1000 }, (_, i) => i + 1)) || 0) + 1; // AWS TODO: Query MAX(revision_no) properly

        const newRevisionId = `rev_${propertyId}_${newRevisionNo}_${Date.now()}`;
        const newRevision: PropertyRevisionRow = {
          id: newRevisionId,
          property_id: propertyId,
          revision_no: newRevisionNo,
          type: "rollback",
          status: "approved",
          submitted_by: context.adminUserId,
          submitted_at: context.timestamp.toISOString(),
          reviewed_by: context.adminUserId,
          reviewed_at: context.timestamp.toISOString(),
          // Copy all snapshot fields from target revision
          title: targetRevision.title,
          description: targetRevision.description,
          bedrooms: targetRevision.bedrooms,
          bathrooms: targetRevision.bathrooms,
          currency: targetRevision.currency,
          price_per_night: targetRevision.price_per_night,
          image_keys: targetRevision.image_keys,
          amenity_ids: targetRevision.amenity_ids,
          benefit_ids: targetRevision.benefit_ids,
          created_at: context.timestamp.toISOString(),
        };

        transaction.insertRevision(newRevision);

        // Update property to point to new rollback revision
        transaction.updateProperty(propertyId, {
          current_revision_id: newRevisionId,
          current_revision_approved_at: context.timestamp.toISOString(),
          updated_at: context.timestamp.toISOString(),
        });

        await transaction.commit();

        // AWS TODO: Post-commit image rollback logic
        // - If within 30 days: copy images from archive/ back to live prefix
        // - If after 30 days: mark images as expired, notify admin
        this.schedulePostCommitActions(propertyId, newRevision, context);

        return {
          success: true,
          data: {
            success: true,
            propertyId,
            newRevisionId,
            newRevisionNo,
            type: "rollback",
            status: "approved",
            rolledBackFrom: targetRevisionId,
            rolledBackFromRevisionNo: targetRevision.revision_no,
            approvedAt: context.timestamp.toISOString(),
            imageStatus: "available", // AWS TODO: Check if within 30 days
            message: `Property rolled back to revision ${targetRevision.revision_no} and is now live.`,
          },
        };
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: {
          code: "ROLLBACK_FAILED",
          message: errorMsg,
        },
      };
    }
  }

  /**
   * Schedule post-commit actions (async, non-blocking)
   * AWS TODO: Implement actual S3, email, and logging
   */
  private schedulePostCommitActions(
    propertyId: string,
    revision: PropertyRevisionRow,
    context: TransactionContext,
    _reviewNote?: string,
  ): void {
    // These would be actual async jobs in production
    console.log("🔄 [Post-Commit Actions]", {
      propertyId,
      revisionId: revision.id,
      action: revision.status,
      adminId: context.adminUserId,
      timestamp: context.timestamp.toISOString(),
    });

    // AWS TODO:
    // 1. If revision.type === 'edit': Archive old images
    // 2. Send email notification to property owner
    // 3. Log to CloudWatch for audit trail
    // 4. Publish event to SNS/EventBridge
  }
}

// Singleton instance
export const propertyRevisionService = new PropertyRevisionService();
