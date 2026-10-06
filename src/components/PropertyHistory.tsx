/**
 * Property History Component
 *
 * Displays timeline of all property revisions (approved, rejected, and current).
 * Shows revision details, who submitted/approved, when, and rejection reasons.
 * Allows rollback to any approved revision.
 *
 * AWS TODO: Wire to backend endpoint GET /api/admin/properties/:propertyId/revisions
 */

import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { propertyRevisionService } from "@/services/property-revision-service";
import type {
  PropertyRevisionRow,
  TransactionContext,
} from "@/types/property-revision";

interface PropertyHistoryProps {
  propertyId: string;
  revisions: PropertyRevisionRow[];
  currentRevisionId: string;
  onRollback?: (revisionId: string) => void;
}

export default function PropertyHistory({
  propertyId,
  revisions,
  currentRevisionId,
  onRollback,
}: PropertyHistoryProps) {
  const [expandedRevisionId, setExpandedRevisionId] = useState<string | null>(
    null,
  );
  const [rollbackTarget, setRollbackTarget] =
    useState<PropertyRevisionRow | null>(null);

  const handleRollback = async () => {
    if (!rollbackTarget) return;

    try {
      const context: TransactionContext = {
        adminUserId: "admin_1", // AWS TODO: from auth context
        timestamp: new Date(),
        requestId: `req_${Date.now()}`,
        source: "admin_dashboard",
      };

      const result = await propertyRevisionService.rollbackRevision(
        propertyId,
        rollbackTarget.id,
        context,
      );

      if (result.success) {
        alert(
          `✅ Property rolled back to revision ${rollbackTarget.revision_no}. It is now live!`,
        );
        setRollbackTarget(null);
        onRollback?.(rollbackTarget.id);
      } else {
        alert(`❌ Error: ${result.error?.message}`);
      }
    } catch (err) {
      alert(
        `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!revisions || revisions.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500">
        No revision history available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-950">
          Revision History
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {revisions.length} total revision
          {revisions.length !== 1 ? "s" : ""} for this property
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {revisions.map((rev) => {
          const isCurrentLive = rev.id === currentRevisionId;

          return (
            <div
              key={rev.id}
              className={`p-4 border rounded-lg transition-colors ${
                isCurrentLive
                  ? "border-green-300 bg-green-50"
                  : rev.status === "rejected"
                    ? "border-red-200 bg-red-50"
                    : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {/* Revision header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-semibold text-neutral-900">
                      v{rev.revision_no}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        rev.type === "create"
                          ? "bg-blue-100 text-blue-800"
                          : rev.type === "edit"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {rev.type === "create"
                        ? "Created"
                        : rev.type === "edit"
                          ? "Edited"
                          : "Rolled Back"}
                    </span>

                    {isCurrentLive && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                        ✓ LIVE
                      </span>
                    )}

                    {rev.status === "rejected" && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 font-medium">
                        REJECTED
                      </span>
                    )}

                    {rev.status === "approved" && !isCurrentLive && (
                      <span className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-medium">
                        ARCHIVED
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {rev.status === "approved" && !isCurrentLive && (
                    <button
                      onClick={() => setRollbackTarget(rev)}
                      className="text-xs px-3 py-1.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium transition-colors cursor-pointer"
                    >
                      Rollback
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setExpandedRevisionId(
                        expandedRevisionId === rev.id ? null : rev.id,
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-medium transition-colors cursor-pointer"
                  >
                    {expandedRevisionId === rev.id ? "Hide" : "Show"} Details
                  </button>
                </div>
              </div>

              {/* Timeline info */}
              <div className="text-sm text-neutral-600 space-y-1">
                <div>
                  📤 Submitted by {rev.submitted_by} on{" "}
                  {formatDate(rev.submitted_at)}
                </div>

                {rev.status === "approved" && rev.reviewed_by && (
                  <div className="text-green-700">
                    ✅ Approved by {rev.reviewed_by} on{" "}
                    {formatDate(rev.reviewed_at!)}
                  </div>
                )}

                {rev.status === "rejected" && rev.review_note && (
                  <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                    <strong>Rejection reason:</strong> {rev.review_note}
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {expandedRevisionId === rev.id && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-neutral-500">Title</span>
                      <p className="font-medium text-neutral-900 mt-0.5">
                        {rev.title}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-500">Price/night</span>
                      <p className="font-medium text-neutral-900 mt-0.5">
                        €{rev.price_per_night}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-500">
                        Bedrooms/Bathrooms
                      </span>
                      <p className="font-medium text-neutral-900 mt-0.5">
                        {rev.bedrooms} / {rev.bathrooms}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-500">Area (sqm)</span>
                      <p className="font-medium text-neutral-900 mt-0.5">
                        {rev.area_sqm || "—"}
                      </p>
                    </div>
                  </div>

                  {rev.description && (
                    <div>
                      <span className="text-neutral-500 block mb-1">
                        Description
                      </span>
                      <p className="text-neutral-700 line-clamp-3">
                        {rev.description}
                      </p>
                    </div>
                  )}

                  {rev.image_keys && rev.image_keys.length > 0 && (
                    <div>
                      <span className="text-neutral-500 block mb-1">
                        Images
                      </span>
                      <p className="text-neutral-700">
                        {rev.image_keys.length} image
                        {rev.image_keys.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  {rev.amenity_ids && rev.amenity_ids.length > 0 && (
                    <div>
                      <span className="text-neutral-500 block mb-1">
                        Amenities
                      </span>
                      <p className="text-neutral-700">
                        {rev.amenity_ids.length} amenity
                        {rev.amenity_ids.length !== 1 ? "ies" : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rollback Confirmation Modal */}
      {rollbackTarget && (
        <ConfirmModal
          title="Rollback Revision"
          message={`Rollback to revision ${rollbackTarget.revision_no}? This version will become live on the public site.`}
          confirmLabel="Rollback"
          destructive={false}
          onCancel={() => setRollbackTarget(null)}
          onConfirm={handleRollback}
        />
      )}
    </div>
  );
}
