/**
 * Property Review Queue Component
 *
 * Shows pending property revisions requiring decisions.
 * - Admin: all pending property revisions with approve/reject actions
 * - Owner: only their own pending revisions (read-only, no actions)
 *
 * AWS TODO: Currently mocked with frontend data. Wire to backend endpoints when available:
 * - GET /api/admin/property-revisions/pending
 * - GET /api/owner/property-revisions/pending
 * - POST /api/admin/property-revisions/:revisionId/approve
 * - POST /api/admin/property-revisions/:revisionId/reject
 */

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { propertyRevisionService } from "@/services/property-revision-service";
import type {
  PropertyRevisionRow,
  PropertyRevisionStatus,
  TransactionContext,
} from "@/types/property-revision";

const ITEMS_PER_PAGE = 8;

/**
 * Pending revision with property context
 */
interface PendingRevisionDisplay extends PropertyRevisionRow {
  propertyName: string;
  ownerName: string;
  propertyStatus: string;
}

interface PropertyReviewQueueProps {
  role: "admin" | "owner";
}

export default function PropertyReviewQueue({
  role,
}: PropertyReviewQueueProps) {
  const navigate = useNavigate();

  // AWS TODO: Replace with API call based on role
  // Admin: GET /api/admin/property-revisions/pending
  // Owner: GET /api/owner/property-revisions/pending
  const [pendingRevisions] = useState<PendingRevisionDisplay[]>([
    {
      id: "rev_1_1",
      property_id: "1",
      revision_no: 1,
      type: "create",
      status: "in_review" as PropertyRevisionStatus,
      title: "Tiber Luxury Penthouse",
      description:
        "Stunning penthouse in Rome with panoramic views of the city",
      bedrooms: 3,
      bathrooms: 2,
      currency: "EUR",
      price_per_night: 850,
      image_keys: [
        "/images/penthouse.jpg",
        "/images/scenic-view.jpg",
        "/images/people2.jpg",
        "/images/logo-black.png",
      ],
      amenity_ids: ["1", "2", "3", "4"],
      benefit_ids: ["1", "2"],
      submitted_by: "owner_1",
      submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      propertyName: "Tiber Luxury Penthouse",
      ownerName: "Marco Rossi",
      propertyStatus: "in_review",
      created_at: new Date().toISOString(),
    },
    {
      id: "rev_2_2",
      property_id: "2",
      revision_no: 2,
      type: "edit",
      status: "in_review" as PropertyRevisionStatus,
      title: "Amalfi Coast Villa",
      description:
        "Updated description and pricing for this stunning Amalfi villa",
      bedrooms: 4,
      bathrooms: 3,
      currency: "EUR",
      price_per_night: 1200,
      image_keys: [
        "/images/propty.jpg",
        "/images/collectionmain.jpg",
        "/images/people3.jpg",
        "/images/itlay.jpg",
      ],
      amenity_ids: ["1", "3", "5", "6"],
      benefit_ids: ["1", "3"],
      submitted_by: "owner_2",
      submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      propertyName: "Amalfi Coast Villa",
      ownerName: "Giulia Romano",
      propertyStatus: "active",
      created_at: new Date().toISOString(),
    },
  ]);

  // Filter by role
  const filteredRevisions = useMemo(() => {
    let filtered = pendingRevisions.filter((r) =>
      ["in_review", "rejected"].includes(r.status),
    );

    // For owner, show only their own properties
    if (role === "owner") {
      filtered = filtered.filter((r) => r.submitted_by === "owner_2"); // AWS TODO: from auth context
    }

    return filtered;
  }, [pendingRevisions, role]);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRevisions.length / ITEMS_PER_PAGE),
  );
  const paginatedRevisions = filteredRevisions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const [selectedRevision, setSelectedRevision] =
    useState<PendingRevisionDisplay | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const handlePropertyNameClick = (revision: PendingRevisionDisplay) => {
    // Navigate to edit view with pending revision data
    navigate(
      `/${role}/properties/${revision.property_id}/edit?revisionId=${revision.id}`,
    );
  };

  const handleApprove = async () => {
    if (!selectedRevision) return;

    try {
      const context: TransactionContext = {
        adminUserId: "admin_1", // AWS TODO: from auth context
        timestamp: new Date(),
        requestId: `req_${Date.now()}`,
        source: "admin_dashboard",
      };

      const result = await propertyRevisionService.approveRevision(
        selectedRevision.id,
        context,
      );

      if (result.success) {
        // AWS TODO: Refresh pending revisions list from API
        alert("✅ Revision approved and is now live!");
        setAction(null);
        setSelectedRevision(null);
      } else {
        alert(`❌ Error: ${result.error?.message}`);
      }
    } catch (err) {
      alert(
        `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleReject = async () => {
    if (!selectedRevision || !reviewNote.trim()) {
      alert("Review note is required");
      return;
    }

    try {
      const context: TransactionContext = {
        adminUserId: "admin_1", // AWS TODO: from auth context
        timestamp: new Date(),
        requestId: `req_${Date.now()}`,
        source: "admin_dashboard",
      };

      const result = await propertyRevisionService.rejectRevision(
        selectedRevision.id,
        reviewNote,
        context,
      );

      if (result.success) {
        // AWS TODO: Refresh pending revisions list from API
        alert("✅ Revision rejected. Owner can re-edit and resubmit.");
        setAction(null);
        setSelectedRevision(null);
        setReviewNote("");
      } else {
        alert(`❌ Error: ${result.error?.message}`);
      }
    } catch (err) {
      alert(
        `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">
            Review Queue
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {filteredRevisions.length} pending decision
            {filteredRevisions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        {paginatedRevisions.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No pending revisions to review.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Property Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Owner Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Version
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Status
                </th>
                {role === "admin" && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedRevisions.map((rev) => (
                <tr
                  key={rev.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handlePropertyNameClick(rev)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer text-left"
                    >
                      {rev.propertyName}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-neutral-900">
                      {rev.ownerName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
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
                        ? "New Property"
                        : rev.type === "edit"
                          ? "Edited"
                          : "Resubmitted"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-neutral-900">
                      {rev.revision_no}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        rev.status === "in_review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rev.status === "in_review"
                        ? "Pending Review"
                        : "Rejected"}
                    </span>
                  </td>
                  {role === "admin" && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRevision(rev);
                          setAction("approve");
                        }}
                        className="text-xs px-3 py-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRevision(rev);
                          setAction("reject");
                        }}
                        className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-neutral-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {role === "admin" && action && selectedRevision && (
        <ConfirmModal
          title={action === "approve" ? "Approve Revision" : "Reject Revision"}
          message={`${action === "approve" ? "Approve" : "Reject"} revision ${selectedRevision.revision_no} for "${selectedRevision.propertyName}"?`}
          confirmLabel={action === "approve" ? "Approve" : "Reject"}
          destructive={action === "reject"}
          confirmDisabled={action === "reject" && !reviewNote.trim()}
          onCancel={() => {
            setAction(null);
            setSelectedRevision(null);
            setReviewNote("");
          }}
          onConfirm={action === "approve" ? handleApprove : handleReject}
        >
          {action === "reject" && (
            <div>
              <label
                htmlFor="review-note"
                className="text-xs font-semibold text-neutral-700 mb-1.5 block"
              >
                Reason for rejection (required)
              </label>
              <textarea
                id="review-note"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Explain why this revision is being rejected..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
              />
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
