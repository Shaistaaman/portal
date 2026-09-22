import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bath,
  Bed,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MoreVertical,
  Plus,
  Search,
  Star,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { MOCK_PROPERTIES } from "./mockProperties";
import type { Property, PropertyStatus } from "./types";

export type PropertyListRole = "admin" | "owner" | "agent";

const ITEMS_PER_PAGE = 5;

/**
 * The marketing site's landing-page Collection section shows up to this
 * many featured properties per city (see AddPropertyWizard's admin-only
 * "featured" question, and Project_Specification.md §3/§4).
 */
const MAX_FEATURED_PER_CITY = 6;

/**
 * Demo-only stand-in for "the properties owned by the current session's
 * owner". Real owner-scoping comes from the authenticated user's linked
 * owner record once auth is real (see Context_Instruction.md §6) — there
 * is no such link in the mocked session user today, so this hardcodes the
 * mock catalogue's first owner for demo purposes.
 */
const DEMO_OWNER_ID = "2";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  active: "bg-green-100 text-green-800",
  in_review: "bg-orange-100 text-orange-800",
  in_inactive: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  active: "Active",
  in_review: "In Review",
  in_inactive: "In Inactive",
  rejected: "Rejected",
};

function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      <Star className="w-3 h-3 fill-current" />
      Featured
    </span>
  );
}

/**
 * Shared property list + detail view for admin, owner, and agent. Ported
 * from packages/ui/src/components/PropertyList.tsx (Next.js reference,
 * admin/owner only) and widened to a third `role="agent"` mode per the
 * decision recorded in Project_Specification.md §3/§4: agent gets
 * view-only access to `active` properties, no action menu at all.
 */
export default function PropertyList({ role }: { role: PropertyListRole }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

  const [searchQuery, setSearchQuery] = useState("");

  const roleScopedProperties = useMemo(() => {
    if (role === "admin") return properties;
    if (role === "owner") {
      return properties.filter((p) => p.ownerId === DEMO_OWNER_ID);
    }
    // agent: view-only, active listings only
    return properties.filter((p) => p.status === "active");
  }, [properties, role]);

  const visibleProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return roleScopedProperties;
    return roleScopedProperties.filter((p) =>
      p.name.toLowerCase().includes(query),
    );
  }, [roleScopedProperties, searchQuery]);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    visibleProperties[0]?.id,
  );
  const selectedProperty =
    visibleProperties.find((p) => p.id === selectedId) ?? visibleProperties[0];

  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(visibleProperties.length / ITEMS_PER_PAGE),
  );
  const paginatedProperties = visibleProperties.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [statusChange, setStatusChange] = useState<{
    newStatus: PropertyStatus;
    rejectionReason: string;
  } | null>(null);
  const [featureLimitNotice, setFeatureLimitNotice] = useState<{
    city: string;
  } | null>(null);

  const canManage = role === "admin" || role === "owner";

  const featuredCountByCity = (city: string) =>
    properties.filter((p) => p.location === city && p.isFeatured).length;

  const toggleFeatured = () => {
    if (!selectedProperty) return;
    setActionMenuOpen(false);

    if (!selectedProperty.isFeatured) {
      const currentCount = featuredCountByCity(selectedProperty.location);
      if (currentCount >= MAX_FEATURED_PER_CITY) {
        setFeatureLimitNotice({ city: selectedProperty.location });
        return;
      }
    }

    setProperties((current) =>
      current.map((p) =>
        p.id === selectedProperty.id ? { ...p, isFeatured: !p.isFeatured } : p,
      ),
    );
  };

  const openStatusChange = (newStatus: PropertyStatus) => {
    setActionMenuOpen(false);
    setStatusChange({ newStatus, rejectionReason: "" });
  };

  const confirmStatusChange = () => {
    if (!statusChange || !selectedProperty) return;
    setProperties((current) =>
      current.map((p) =>
        p.id === selectedProperty.id
          ? {
              ...p,
              status: statusChange.newStatus,
              rejectionReason:
                statusChange.newStatus === "rejected"
                  ? statusChange.rejectionReason
                  : undefined,
            }
          : p,
      ),
    );
    setStatusChange(null);
  };

  if (!selectedProperty) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-neutral-500">
        No properties to show.
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex bg-white">
      {/* Left panel: list */}
      <div className="w-96 border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-950">
                Properties
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {roleScopedProperties.length}{" "}
                {role === "owner"
                  ? "Total"
                  : role === "agent"
                    ? "Active"
                    : "Total"}{" "}
                Properties
              </p>
            </div>
            {canManage && (
              <Link
                to={`/${role}/properties/add-property`}
                aria-label="Add property"
                className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by property name..."
              aria-label="Search properties by name"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {paginatedProperties.map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => setSelectedId(property.id)}
              className={`w-full text-left flex gap-3 p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${
                selectedProperty.id === property.id
                  ? "bg-neutral-50 border-l-4 border-l-black"
                  : ""
              }`}
            >
              <img
                src={property.images[0]}
                alt={property.name}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-950 line-clamp-2">
                  {property.name}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  📍 {property.location}
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <StatusBadge status={property.status} />
                  {property.isFeatured && <FeaturedBadge />}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 self-center" />
            </button>
          ))}
          {paginatedProperties.length === 0 && (
            <p className="p-6 text-sm text-neutral-500">No properties match.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-neutral-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">
              {selectedProperty.name}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              📍 {selectedProperty.location}
            </p>
          </div>
          {canManage && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setActionMenuOpen((open) => !open)}
                aria-label="Property actions"
                className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {actionMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActionMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActionMenuOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Property Calendar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionMenuOpen(false);
                        navigate(
                          `/${role}/properties/${selectedProperty.id}/edit`,
                        );
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Manage Property
                    </button>
                    {role === "admin" && (
                      <button
                        type="button"
                        onClick={toggleFeatured}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        {selectedProperty.isFeatured ? (
                          "Un-feature"
                        ) : (
                          <>
                            Feature{" "}
                            <span className="text-neutral-400">
                              ({featuredCountByCity(selectedProperty.location)}/
                              {MAX_FEATURED_PER_CITY} in{" "}
                              {selectedProperty.location})
                            </span>
                          </>
                        )}
                      </button>
                    )}
                    <div className="border-t border-neutral-100" />

                    {role === "admin" &&
                      selectedProperty.status === "in_review" && (
                        <>
                          <button
                            type="button"
                            onClick={() => openStatusChange("active")}
                            className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusChange("rejected")}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                    {(selectedProperty.status === "active" ||
                      selectedProperty.status === "in_inactive") && (
                      <button
                        type="button"
                        onClick={() =>
                          openStatusChange(
                            selectedProperty.status === "active"
                              ? "in_inactive"
                              : "active",
                          )
                        }
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        {selectedProperty.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mb-4 text-neutral-700">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{selectedProperty.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{selectedProperty.bathrooms} baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm">{selectedProperty.areaSqm} sqm</span>
          </div>
        </div>

        <p className="text-neutral-700 leading-relaxed mb-4">
          {selectedProperty.description}
        </p>

        <div className="flex items-center gap-3 mb-6">
          <img
            src={selectedProperty.ownerAvatarUrl}
            alt={selectedProperty.ownerName}
            className="w-9 h-9 rounded-full object-cover border border-neutral-200"
          />
          <div>
            <p className="text-sm font-medium text-neutral-950">
              {selectedProperty.ownerName}
            </p>
            <p className="text-xs text-neutral-500">Owner</p>
          </div>
        </div>

        <img
          src={selectedProperty.images[0]}
          alt={selectedProperty.name}
          className="w-full max-w-lg rounded-lg object-cover mb-6"
          style={{ aspectRatio: "3/2" }}
        />

        {selectedProperty.status === "rejected" &&
          selectedProperty.rejectionReason && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-1">
                Rejection reason
              </p>
              <p className="text-sm text-red-700">
                {selectedProperty.rejectionReason}
              </p>
            </div>
          )}

        {role === "owner" && selectedProperty.status === "rejected" && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/owner/properties/${selectedProperty.id}/edit`)
              }
              className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Edit &amp; Resubmit
            </button>
          </div>
        )}
      </div>

      {statusChange && (
        <ConfirmModal
          title="Property Status Change"
          message={
            statusChange.newStatus === "rejected"
              ? "Reject this property? A reason is required and will be shown to the owner."
              : `Change this property's status to "${STATUS_LABELS[statusChange.newStatus]}"?`
          }
          confirmLabel={
            statusChange.newStatus === "rejected" ? "Reject" : "Confirm"
          }
          destructive={statusChange.newStatus === "rejected"}
          confirmDisabled={
            statusChange.newStatus === "rejected" &&
            statusChange.rejectionReason.trim().length === 0
          }
          onCancel={() => setStatusChange(null)}
          onConfirm={confirmStatusChange}
        >
          {statusChange.newStatus === "rejected" && (
            <div>
              <label
                htmlFor="rejection-reason"
                className="text-xs font-semibold text-neutral-700 mb-1.5 block"
              >
                Rejection reason
              </label>
              <textarea
                id="rejection-reason"
                value={statusChange.rejectionReason}
                onChange={(e) =>
                  setStatusChange((current) =>
                    current
                      ? { ...current, rejectionReason: e.target.value }
                      : current,
                  )
                }
                rows={3}
                className="w-full px-3 py-2 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
                placeholder="Explain why this property is being rejected..."
              />
            </div>
          )}
        </ConfirmModal>
      )}

      {featureLimitNotice && (
        <ConfirmModal
          title="Featured limit reached"
          message={`Already 6 properties featured in ${featureLimitNotice.city}. Please un-feature a property before featuring another one.`}
          cancelLabel="OK"
          hideConfirm
          onCancel={() => setFeatureLimitNotice(null)}
          onConfirm={() => setFeatureLimitNotice(null)}
        />
      )}
    </div>
  );
}
