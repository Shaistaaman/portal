import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MoreVertical,
  Plus,
  Search,
  Sun,
  Users,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { MOCK_PACKAGES } from "./mockPackages";
import type { Package, PackageStatus } from "./types";

const ITEMS_PER_PAGE = 5;

const STATUS_STYLES: Record<PackageStatus, string> = {
  active: "bg-green-100 text-green-800",
  in_active: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<PackageStatus, string> = {
  active: "Active",
  in_active: "In Active",
};

function StatusBadge({ status }: { status: PackageStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Admin-only packages list + detail view, mirroring ExperienceList.
 * Packages are admin-exclusive (Project_Specification.md §3), so there is
 * no role prop; status is a plain active/in_active toggle with no approval
 * workflow. Built fresh from the package wizard reference designs.
 */
export default function PackageList() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>(MOCK_PACKAGES);
  const [searchQuery, setSearchQuery] = useState("");

  const visiblePackages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return packages;
    return packages.filter((p) => p.name.toLowerCase().includes(query));
  }, [packages, searchQuery]);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    visiblePackages[0]?.id,
  );
  const selectedPackage =
    visiblePackages.find((p) => p.id === selectedId) ?? visiblePackages[0];

  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(visiblePackages.length / ITEMS_PER_PAGE),
  );
  const paginatedPackages = visiblePackages.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [pendingStatusToggle, setPendingStatusToggle] = useState(false);

  const confirmStatusToggle = () => {
    if (!selectedPackage) return;
    setPackages((current) =>
      current.map((p) =>
        p.id === selectedPackage.id
          ? { ...p, status: p.status === "active" ? "in_active" : "active" }
          : p,
      ),
    );
    setPendingStatusToggle(false);
  };

  if (!selectedPackage) {
    return (
      <div className="w-full h-screen flex flex-col bg-white">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-950">Packages</h1>
          <Link
            to="/admin/packages/add-package"
            aria-label="Add package"
            className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          No packages to show.
        </div>
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
                Packages
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {packages.length} Total Packages
              </p>
            </div>
            <Link
              to="/admin/packages/add-package"
              aria-label="Add package"
              className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Link>
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
              placeholder="Search by package name..."
              aria-label="Search packages by name"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {paginatedPackages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedId(pkg.id)}
              className={`w-full text-left flex gap-3 p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${
                selectedPackage.id === pkg.id
                  ? "bg-neutral-50 border-l-4 border-l-black"
                  : ""
              }`}
            >
              <img
                src={pkg.images[0]}
                alt={pkg.name}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-950 line-clamp-2">
                  {pkg.name}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {pkg.duration} · {pkg.guestCapacity} guests
                </p>
                <div className="mt-2">
                  <StatusBadge status={pkg.status} />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 self-center" />
            </button>
          ))}
          {paginatedPackages.length === 0 && (
            <p className="p-6 text-sm text-neutral-500">No packages match.</p>
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
              {selectedPackage.name}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {selectedPackage.bestSeason}
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen((open) => !open)}
              aria-label="Package actions"
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
                <div className="absolute right-0 mt-1 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      navigate(`/admin/packages/${selectedPackage.id}/edit`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Manage Package
                  </button>
                  <div className="border-t border-neutral-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      setPendingStatusToggle(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    {selectedPackage.status === "active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <DetailStat
            icon={<CalendarDays className="w-4 h-4" />}
            label="Duration"
            value={selectedPackage.duration}
          />
          <DetailStat
            icon={<DollarSign className="w-4 h-4" />}
            label="Base Price"
            value={`$${selectedPackage.basePrice.toLocaleString()}`}
          />
          <DetailStat
            icon={<Users className="w-4 h-4" />}
            label="Guest Capacity"
            value={String(selectedPackage.guestCapacity)}
          />
          <DetailStat
            icon={<Sun className="w-4 h-4" />}
            label="Best Season"
            value={selectedPackage.bestSeason}
          />
        </div>

        <p className="text-neutral-700 leading-relaxed mb-6">
          {selectedPackage.description}
        </p>

        {selectedPackage.highlights.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-950 mb-2">
              Highlights
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
              {selectedPackage.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        <img
          src={selectedPackage.images[0]}
          alt={selectedPackage.name}
          className="w-full max-w-lg rounded-lg object-cover mb-6"
          style={{ aspectRatio: "3/2" }}
        />

        {selectedPackage.inclusions.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-neutral-950 mb-3">
              What You Get In This Package
            </p>
            <div className="space-y-4">
              {selectedPackage.inclusions.map((inclusion) => (
                <div
                  key={inclusion.id}
                  className="flex gap-4 border border-neutral-200 rounded-lg p-4"
                >
                  {inclusion.image && (
                    <img
                      src={inclusion.image}
                      alt={inclusion.heading}
                      className="w-24 h-24 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-950">
                      {inclusion.heading}
                    </p>
                    {inclusion.category && (
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mt-0.5">
                        {inclusion.category}
                      </p>
                    )}
                    <p className="text-sm text-neutral-600 mt-2">
                      {inclusion.highlights}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {pendingStatusToggle && (
        <ConfirmModal
          title="Package Status Change"
          message={`Change this package's status to "${
            selectedPackage.status === "active" ? "In Active" : "Active"
          }"?`}
          confirmLabel="Confirm"
          onCancel={() => setPendingStatusToggle(false)}
          onConfirm={confirmStatusToggle}
        />
      )}
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-neutral-500 mb-1.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
