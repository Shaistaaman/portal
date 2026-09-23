import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { MOCK_BLOGS } from "./mockBlogs";
import type { Blog, BlogStatus } from "./types";

const ITEMS_PER_PAGE = 5;

const STATUS_STYLES: Record<BlogStatus, string> = {
  active: "bg-green-100 text-green-800",
  in_active: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<BlogStatus, string> = {
  active: "Active",
  in_active: "In Active",
};

function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Admin-only blogs list + detail view, mirroring PackageList /
 * ExperienceList. Plain active/in_active status toggle, no approval
 * workflow.
 */
export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>(MOCK_BLOGS);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return blogs;
    return blogs.filter((b) => b.title.toLowerCase().includes(query));
  }, [blogs, searchQuery]);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    visibleBlogs[0]?.id,
  );
  const selectedBlog =
    visibleBlogs.find((b) => b.id === selectedId) ?? visibleBlogs[0];

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(visibleBlogs.length / ITEMS_PER_PAGE));
  const paginatedBlogs = visibleBlogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [pendingStatusToggle, setPendingStatusToggle] = useState(false);

  const confirmStatusToggle = () => {
    if (!selectedBlog) return;
    setBlogs((current) =>
      current.map((b) =>
        b.id === selectedBlog.id
          ? { ...b, status: b.status === "active" ? "in_active" : "active" }
          : b,
      ),
    );
    setPendingStatusToggle(false);
  };

  if (!selectedBlog) {
    return (
      <div className="w-full h-screen flex flex-col bg-white">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-950">Blogs</h1>
          <Link
            to="/admin/blogs/add-blog"
            aria-label="Add blog"
            className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          No blogs to show.
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
              <h1 className="text-xl font-semibold text-neutral-950">Blogs</h1>
              <p className="text-sm text-neutral-500 mt-1">
                {blogs.length} Total Blogs
              </p>
            </div>
            <Link
              to="/admin/blogs/add-blog"
              aria-label="Add blog"
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
              placeholder="Search by blog title..."
              aria-label="Search blogs by title"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {paginatedBlogs.map((blog) => (
            <button
              key={blog.id}
              type="button"
              onClick={() => setSelectedId(blog.id)}
              className={`w-full text-left flex gap-3 p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${
                selectedBlog.id === blog.id
                  ? "bg-neutral-50 border-l-4 border-l-black"
                  : ""
              }`}
            >
              <img
                src={blog.bannerImage}
                alt={blog.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-950 line-clamp-2">
                  {blog.title}
                </p>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                  {blog.subtitle}
                </p>
                <div className="mt-2">
                  <StatusBadge status={blog.status} />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 self-center" />
            </button>
          ))}
          {paginatedBlogs.length === 0 && (
            <p className="p-6 text-sm text-neutral-500">No blogs match.</p>
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
              {selectedBlog.title}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {selectedBlog.subtitle}
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen((open) => !open)}
              aria-label="Blog actions"
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
                      navigate(`/admin/blogs/${selectedBlog.id}/edit`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Manage Blog
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
                    {selectedBlog.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <img
          src={selectedBlog.bannerImage}
          alt={selectedBlog.title}
          className="w-full rounded-lg object-cover mb-6"
          style={{ aspectRatio: "16/6" }}
        />

        {selectedBlog.highlights.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-950 mb-2">
              Highlights
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
              {selectedBlog.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        {selectedBlog.sections.length > 0 && (
          <div className="space-y-4">
            {selectedBlog.sections.map((section) => (
              <div
                key={section.id}
                className="flex gap-4 border border-neutral-200 rounded-lg p-4"
              >
                {section.image && (
                  <img
                    src={section.image}
                    alt={section.heading}
                    className="w-24 h-24 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-neutral-950">
                    {section.heading}
                  </p>
                  {section.category && (
                    <p className="text-xs text-neutral-500 uppercase tracking-wide mt-0.5">
                      {section.category}
                    </p>
                  )}
                  <p className="text-sm text-neutral-600 mt-2">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingStatusToggle && (
        <ConfirmModal
          title="Blog Status Change"
          message={`Change this blog's status to "${
            selectedBlog.status === "active" ? "In Active" : "Active"
          }"?`}
          confirmLabel="Confirm"
          onCancel={() => setPendingStatusToggle(false)}
          onConfirm={confirmStatusToggle}
        />
      )}
    </div>
  );
}
