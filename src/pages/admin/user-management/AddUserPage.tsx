import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import UserForm from "@/features/user-management/UserForm";

export default function AddUserPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // TODO(AWS integration): POST to admin-fn's user-creation endpoint.
    // New users default to "Inactive" per the info banner in UserForm.
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
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/user-management")}
      />
    </div>
  );
}
