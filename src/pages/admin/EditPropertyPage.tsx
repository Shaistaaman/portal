import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddPropertyWizard from "@/features/properties/AddPropertyWizard";
import { findPropertyById } from "@/features/properties/properties";

// Mock revision data (AWS TODO: fetch from backend)
const MOCK_PENDING_REVISIONS = [
  {
    id: "rev_1_1",
    revision_no: 1,
    title: "Tiber Luxury Penthouse",
  },
  {
    id: "rev_2_2",
    revision_no: 2,
    title: "Amalfi Coast Villa",
  },
];

export default function AdminEditPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const revisionId = searchParams.get("revisionId");
  const property = id ? findPropertyById(id) : undefined;
  const isReadOnly = !!revisionId; // Read-only mode when viewing a pending revision

  // Get revision metadata for the modal
  const revisionMetadata = revisionId
    ? MOCK_PENDING_REVISIONS.find((r) => r.id === revisionId)
    : undefined;

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
        {isReadOnly ? "Review Property Revision" : "Edit Property"}
      </h1>

      {isReadOnly && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <p className="font-semibold mb-1">Viewing pending revision</p>
          <p>This is the data submitted for review. Fields are read-only.</p>
        </div>
      )}

      <AddPropertyWizard
        role="admin"
        mode="edit"
        isReadOnly={isReadOnly}
        initialValues={property}
        initialManagementLevel={property.managementLevel}
        initialIsFeatured={property.isFeatured}
        initialOwnerId={property.ownerId}
        revisionNo={revisionMetadata?.revision_no}
        revisionTitle={revisionMetadata?.title}
        onSubmit={() => {
          // TODO(AWS integration): PATCH admin-fn's property endpoint.
          // Per Project_Specification.md §4, editing resets status to
          // "in_review" (except a plain active/inactive toggle, which
          // isn't done through this form). isFeatured and ownerId are
          // admin-only and arrive in the second argument.
        }}
        onClose={() => navigate("/admin/properties")}
      />
    </div>
  );
}
