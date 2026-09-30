import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import UserForm from "@/features/user-management/UserForm";
import {
  USER_CREATION_STATUS,
  type ManagedUserStatus,
  type UserFormValues,
} from "@/features/user-management/types";

export default function AddUserPage() {
  const navigate = useNavigate();

  const handleSubmit = (values: UserFormValues, status: ManagedUserStatus) => {
    // TODO(AWS integration): POST to admin-fn's user-creation endpoint.
    // `status` comes from the form's toggle, which defaults to
    // USER_CREATION_STATUS ("active") — an admin may deliberately create a
    // dormant account instead. Previously this callback took no arguments
    // and silently dropped the chosen status.
    void { ...values, status };
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
        Add New User
      </h1>

      <UserForm
        mode="add"
        initialStatus={USER_CREATION_STATUS}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/user-management")}
      />
    </div>
  );
}
