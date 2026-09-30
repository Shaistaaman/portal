import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPackageWizard from "@/features/packages/AddPackageWizard";
import { PACKAGE_CREATION_STATUS } from "@/features/packages/types";

export default function AdminAddPackagePage() {
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

      <h1 className="text-3xl font-semibold text-neutral-950 mb-8">
        Add Package
      </h1>

      <AddPackageWizard
        onSubmit={(values) => {
          // TODO(AWS integration): POST to admin-fn's package endpoint.
          // Created inactive (draft) — not visible on the marketing site
          // until an admin switches it on from the package list.
          void { ...values, status: PACKAGE_CREATION_STATUS };
        }}
        onClose={() => navigate("/admin/packages")}
      />
    </div>
  );
}
