import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPropertyWizard from "@/features/properties/AddPropertyWizard";

export default function AdminAddPropertyPage() {
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
        Add Property
      </h1>

      <AddPropertyWizard
        role="admin"
        onSubmit={() => {
          // TODO(AWS integration): POST to admin-fn's property-creation
          // endpoint. New properties are created in "in_review" status
          // per Project_Specification.md §4.
        }}
        onClose={() => navigate("/admin/properties")}
      />
    </div>
  );
}
