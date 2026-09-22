import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPropertyWizard from "@/features/properties/AddPropertyWizard";
import { findMockPropertyById } from "@/features/properties/mockProperties";

export default function OwnerEditPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const property = id ? findMockPropertyById(id) : undefined;

  if (!property) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/owner/properties")}
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

      {property.status === "rejected" && property.rejectionReason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <p className="font-semibold mb-1">Application rejected</p>
          <p>{property.rejectionReason}</p>
        </div>
      )}

      <AddPropertyWizard
        role="owner"
        mode="edit"
        initialValues={property}
        initialManagementLevel={property.managementLevel}
        onSubmit={() => {
          // TODO(AWS integration): PATCH admin-fn's property endpoint.
          // Per Project_Specification.md §4, editing (including a
          // rejected-property resubmission) resets status to "in_review".
        }}
        onClose={() => navigate("/owner/properties")}
      />
    </div>
  );
}
