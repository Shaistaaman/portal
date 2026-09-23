import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddBlogWizard from "@/features/blogs/AddBlogWizard";
import { findMockBlogById } from "@/features/blogs/mockBlogs";

export default function AdminEditBlogPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const blog = id ? findMockBlogById(id) : undefined;

  if (!blog) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/blogs")}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Blogs
        </button>
        <p className="text-neutral-600">
          No blog found with id &quot;{id}&quot;.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-semibold text-neutral-950 mb-8">
        Edit Blog
      </h1>

      <AddBlogWizard
        mode="edit"
        initialValues={blog}
        onSubmit={() => {
          // TODO(AWS integration): PATCH admin-fn's blog endpoint.
        }}
        onClose={() => navigate("/admin/blogs")}
      />
    </div>
  );
}
