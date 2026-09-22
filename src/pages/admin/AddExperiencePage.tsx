import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddExperienceWizard from "@/features/experiences/AddExperienceWizard";

export default function AdminAddExperiencePage() {
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

      <h1 className="text-3xl font-semibold text-neutral-950 mb-2">
        Add Experience
      </h1>
      <p className="text-neutral-600 mb-8">
        Step-by-step wizard to add a new experience to the portfolio.
      </p>

      <AddExperienceWizard
        onSubmit={() => {
          // TODO(AWS integration): POST to admin-fn's experience endpoint.
        }}
        onClose={() => navigate("/admin/experiences")}
      />
    </div>
  );
}
