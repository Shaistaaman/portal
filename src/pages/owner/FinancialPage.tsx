import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  MoreVertical,
  Search,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useClickOutside } from "@/hooks/useClickOutside";
import { MOCK_FINANCIAL_RECORDS } from "@/features/financials/mockFinancials";
import {
  FINANCIAL_CATEGORIES,
  formatPeriod,
  type FinancialCategory,
  type FinancialRecord,
} from "@/features/financials/types";

const ITEMS_PER_PAGE = 8;

/**
 * Demo-only owner id matching PropertyList and Dashboard scoping.
 */
const DEMO_OWNER_ID = "2";

export default function OwnerFinancialPage() {
  const [records, setRecords] = useState<FinancialRecord[]>(
    MOCK_FINANCIAL_RECORDS,
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    FinancialCategory | "all"
  >("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<FinancialRecord | null>(
    null,
  );

  const categoryRef = useClickOutside<HTMLDivElement>(
    () => setCategoryOpen(false),
    categoryOpen,
  );
  const yearRef = useClickOutside<HTMLDivElement>(
    () => setYearOpen(false),
    yearOpen,
  );
  const menuRef = useClickOutside<HTMLDivElement>(
    () => setActiveMenuId(null),
    activeMenuId !== null,
  );

  // Filter to only records tagged to this owner
  const ownerRecords = useMemo(
    () =>
      records.filter(
        (r) => r.tagUserId === DEMO_OWNER_ID || r.tagUserId === "",
      ),
    [records],
  );

  const years = useMemo(
    () =>
      Array.from(new Set(ownerRecords.map((r) => r.periodYear))).sort(
        (a, b) => b - a,
      ),
    [ownerRecords],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ownerRecords.filter((r) => {
      const matchesSearch =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.fileName.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || r.category === categoryFilter;
      const matchesYear = yearFilter === "all" || r.periodYear === yearFilter;
      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [ownerRecords, search, categoryFilter, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const resetPage = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setRecords((current) => current.filter((r) => r.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">
            Financials
          </h1>
          <p className="text-neutral-600 mt-2">
            Your financial records and documents.
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => resetPage(() => setSearch(e.target.value))}
            placeholder="Search by title or file name..."
            aria-label="Search financial records"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <div className="relative" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setCategoryOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Category:{" "}
              <span className="capitalize">
                {categoryFilter === "all" ? "All" : categoryFilter}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {categoryOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
                {(["all", ...FINANCIAL_CATEGORIES] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      resetPage(() => setCategoryFilter(option));
                      setCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm capitalize transition-colors cursor-pointer ${
                      categoryFilter === option
                        ? "bg-black text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {option === "all" ? "All" : option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year filter */}
          <div className="relative" ref={yearRef}>
            <button
              type="button"
              onClick={() => setYearOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Year: {yearFilter === "all" ? "All" : yearFilter}
              <ChevronDown className="w-4 h-4" />
            </button>
            {yearOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    resetPage(() => setYearFilter("all"));
                    setYearOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    yearFilter === "all"
                      ? "bg-black text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  All
                </button>
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      resetPage(() => setYearFilter(year));
                      setYearOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      yearFilter === year
                        ? "bg-black text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Period</th>
              <th className="px-6 py-3">File</th>
              <th className="px-6 py-3">Uploaded</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((record) => (
              <tr
                key={record.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="font-medium text-neutral-950">
                    {record.title}
                  </div>
                  {record.notes && (
                    <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                      {record.notes}
                    </div>
                  )}
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                    {record.category}
                  </span>
                </td>
                <td className="px-6 py-3 text-neutral-700">
                  {formatPeriod(record.periodMonth, record.periodYear)}
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2 text-neutral-700">
                    <FileSpreadsheet className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-[180px]">
                      {record.fileName}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {record.fileSize}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-neutral-700">
                  <div>{record.uploadedAt}</div>
                  <div className="text-xs text-neutral-500">
                    {record.uploadedBy}
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <div
                    className="relative inline-block"
                    ref={activeMenuId === record.id ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId((c) =>
                          c === record.id ? null : record.id,
                        )
                      }
                      aria-label={`Actions for ${record.title}`}
                      className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenuId === record.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(null)}
                          className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-neutral-500" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setPendingDelete(record);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  No financial records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                page === num
                  ? "bg-black text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this record?"
          message={`"${pendingDelete.title}" and its file will be permanently removed.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
