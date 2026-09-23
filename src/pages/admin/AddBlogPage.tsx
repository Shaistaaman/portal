import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddBlogWizard from "@/features/blogs/AddBlogWizard";

export default function AdminAddBlogPage() {
  const navigate = useNavigate();

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

      <h1 className="text-3xl font-semibold text-neutral-950 mb-8">Add Blog</h1>

      <AddBlogWizard
        onSubmit={() => {
          // TODO(AWS integration): POST to admin-fn's blog endpoint.
        }}
        onClose={() => navigate("/admin/blogs")}
      />
    </div>
  );
}
