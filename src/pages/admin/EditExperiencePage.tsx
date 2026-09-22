import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddExperienceWizard from "@/features/experiences/AddExperienceWizard";
import { findMockExperienceById } from "@/features/experiences/mockExperiences";

export default function AdminEditExperiencePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const experience = id ? findMockExperienceById(id) : undefined;

  if (!experience) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/experiences")}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Experiences
        </button>
        <p className="text-neutral-600">
          No experience found with id &quot;{id}&quot;.
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
        Edit Experience
      </h1>

      <AddExperienceWizard
        mode="edit"
        initialValues={experience}
        onSubmit={() => {
          // TODO(AWS integration): PATCH admin-fn's experience endpoint.
        }}
        onClose={() => navigate("/admin/experiences")}
      />
    </div>
  );
}
