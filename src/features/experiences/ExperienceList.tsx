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
import { MOCK_EXPERIENCES } from "./mockExperiences";
import type { Experience, ExperienceStatus } from "./types";

const ITEMS_PER_PAGE = 5;

const STATUS_STYLES: Record<ExperienceStatus, string> = {
  active: "bg-green-100 text-green-800",
  in_active: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<ExperienceStatus, string> = {
  active: "Active",
  in_active: "In Active",
};

function StatusBadge({ status }: { status: ExperienceStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Admin-only experiences list + detail view. Ported from
 * packages/ui/src/components/ExperienceList.tsx. Unlike PropertyList this
 * takes no role prop (experiences are admin-exclusive per
 * Project_Specification.md §3) and has a plain active/in_active status
 * toggle with no approval workflow. Uses the shared ConfirmModal and adds
 * a search box for consistency with the properties list.
 */
export default function ExperienceList() {
  const navigate = useNavigate();
  const [experiences, setExperiences] =
    useState<Experience[]>(MOCK_EXPERIENCES);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleExperiences = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return experiences;
    return experiences.filter((e) => e.name.toLowerCase().includes(query));
  }, [experiences, searchQuery]);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    visibleExperiences[0]?.id,
  );
  const selectedExperience =
    visibleExperiences.find((e) => e.id === selectedId) ??
    visibleExperiences[0];

  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(visibleExperiences.length / ITEMS_PER_PAGE),
  );
  const paginatedExperiences = visibleExperiences.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [pendingStatusToggle, setPendingStatusToggle] = useState(false);

  const confirmStatusToggle = () => {
    if (!selectedExperience) return;
    setExperiences((current) =>
      current.map((e) =>
        e.id === selectedExperience.id
          ? {
              ...e,
              status: e.status === "active" ? "in_active" : "active",
            }
          : e,
      ),
    );
    setPendingStatusToggle(false);
  };

  if (!selectedExperience) {
    return (
      <div className="w-full h-screen flex flex-col bg-white">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-950">
            Experiences
          </h1>
          <Link
            to="/admin/experiences/add-experience"
            aria-label="Add experience"
            className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          No experiences to show.
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
                Experiences
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {experiences.length} Total Experiences
              </p>
            </div>
            <Link
              to="/admin/experiences/add-experience"
              aria-label="Add experience"
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
              placeholder="Search by experience name..."
              aria-label="Search experiences by name"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {paginatedExperiences.map((experience) => (
            <button
              key={experience.id}
              type="button"
              onClick={() => setSelectedId(experience.id)}
              className={`w-full text-left flex gap-3 p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${
                selectedExperience.id === experience.id
                  ? "bg-neutral-50 border-l-4 border-l-black"
                  : ""
              }`}
            >
              <img
                src={experience.images[0]}
                alt={experience.name}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-950 line-clamp-2">
                  {experience.name}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  📍 {experience.location}
                </p>
                <div className="mt-2">
                  <StatusBadge status={experience.status} />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 self-center" />
            </button>
          ))}
          {paginatedExperiences.length === 0 && (
            <p className="p-6 text-sm text-neutral-500">
              No experiences match.
            </p>
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
              {selectedExperience.name}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              📍 {selectedExperience.location}
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen((open) => !open)}
              aria-label="Experience actions"
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
                      navigate(
                        `/admin/experiences/${selectedExperience.id}/edit`,
                      );
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Manage Experience
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
                    {selectedExperience.status === "active"
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
            value={selectedExperience.duration}
          />
          <DetailStat
            icon={<DollarSign className="w-4 h-4" />}
            label="Per Person"
            value={`€${selectedExperience.pricePerPerson}`}
          />
          <DetailStat
            icon={<Users className="w-4 h-4" />}
            label="Max Guests"
            value={String(selectedExperience.maxGuests)}
          />
          <DetailStat
            icon={<Sun className="w-4 h-4" />}
            label="Season"
            value={selectedExperience.season}
          />
        </div>

        {selectedExperience.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedExperience.categories.map((category) => (
              <span
                key={category}
                className="inline-block px-3 py-1 bg-neutral-100 text-neutral-800 text-xs font-medium rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <p className="text-neutral-700 leading-relaxed mb-6">
          {selectedExperience.description}
        </p>

        {selectedExperience.specialRequirements && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-950 mb-1">
              Special requirements
            </p>
            <p className="text-sm text-neutral-600">
              {selectedExperience.specialRequirements}
            </p>
          </div>
        )}

        <img
          src={selectedExperience.images[0]}
          alt={selectedExperience.name}
          className="w-full max-w-lg rounded-lg object-cover"
          style={{ aspectRatio: "3/2" }}
        />
      </div>

      {pendingStatusToggle && (
        <ConfirmModal
          title="Experience Status Change"
          message={`Change this experience's status to "${
            selectedExperience.status === "active" ? "In Active" : "Active"
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
