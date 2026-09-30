import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPropertyWizard from "@/features/properties/AddPropertyWizard";
import { PROPERTY_CREATION_STATUS } from "@/features/properties/types";

export default function OwnerAddPropertyPage() {
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
        role="owner"
        onSubmit={(values) => {
          // TODO(AWS integration): POST to admin-fn's property-creation
          // endpoint. Created in "in_review" per Project_Specification.md
          // §4; only an admin can approve it to "active". The wizard's
          // admin-only fields are not sent for an owner submission.
          void { ...values, status: PROPERTY_CREATION_STATUS };
        }}
        onClose={() => navigate("/owner/properties")}
      />
    </div>
  );
}
