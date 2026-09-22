import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPropertyWizard from "@/features/properties/AddPropertyWizard";
import { findMockPropertyById } from "@/features/properties/mockProperties";

export default function AdminEditPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const property = id ? findMockPropertyById(id) : undefined;

  if (!property) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/properties")}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Properties
        </button>
        <p className="text-neutral-600">
          No property found with id &quot;{id}&quot;.
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
        Edit Property
      </h1>

      <AddPropertyWizard
        role="admin"
        mode="edit"
        initialValues={property}
        initialManagementLevel={property.managementLevel}
        initialIsFeatured={property.isFeatured}
        onSubmit={() => {
          // TODO(AWS integration): PATCH admin-fn's property endpoint.
          // Per Project_Specification.md §4, editing resets status to
          // "in_review" (except a plain active/inactive toggle, which
          // isn't done through this form). isFeatured is admin-only.
        }}
        onClose={() => navigate("/admin/properties")}
      />
    </div>
  );
}
