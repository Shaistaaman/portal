import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPackageWizard from "@/features/packages/AddPackageWizard";
import { findMockPackageById } from "@/features/packages/mockPackages";

export default function AdminEditPackagePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pkg = id ? findMockPackageById(id) : undefined;

  if (!pkg) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/packages")}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Packages
        </button>
        <p className="text-neutral-600">
          No package found with id &quot;{id}&quot;.
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
        Edit Package
      </h1>

      <AddPackageWizard
        mode="edit"
        initialValues={pkg}
        onSubmit={() => {
          // TODO(AWS integration): PATCH admin-fn's package endpoint.
        }}
        onClose={() => navigate("/admin/packages")}
      />
    </div>
  );
}
