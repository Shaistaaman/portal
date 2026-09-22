import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import UserForm from "@/features/user-management/UserForm";
import { findMockUserById } from "@/features/user-management/mockUsers";

/**
 * Reads the user id from a path param (/admin/user-management/edit-user/:id)
 * rather than the reference Next.js app's `?id=` query string — cleaner
 * and more conventional for react-router, and avoids that version's silent
 * fallback to a hardcoded "1" when no id was present.
 */
export default function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = id ? findMockUserById(id) : undefined;

  if (!user) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/user-management")}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to User Management
        </button>
        <p className="text-neutral-600">
          No user found with id &quot;{id}&quot;.
        </p>
      </div>
    );
  }

  const handleSubmit = () => {
    // TODO(AWS integration): PATCH admin-fn's user endpoint with the
    // updated fields and status.
    navigate("/admin/user-management");
  };

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
        Edit User
      </h1>

      <UserForm
        mode="edit"
        initialValues={{
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          agencyName: user.agencyName ?? "",
          licenseNumber: user.licenseNumber ?? "",
          aboutAgency: user.aboutAgency ?? "",
          latitude: user.latitude ?? "",
          longitude: user.longitude ?? "",
          agencyLicensePreview: user.agencyLicensePreview ?? "",
          brandImagePreview: user.brandImagePreview ?? "",
        }}
        initialStatus={user.status}
        rejectionReason={user.rejectionReason}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/user-management")}
      />
    </div>
  );
}
