import { useState } from "react";
import { Upload, X } from "lucide-react";
import {
  EMPTY_EXPERIENCE_FORM_VALUES,
  EXPERIENCE_CATEGORIES,
  type ExperienceCategory,
  type ExperienceFormValues,
} from "./types";

type WizardStep = "identity" | "imagery" | "details";

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "identity", label: "Identity", number: 1 },
  { id: "imagery", label: "Imagery", number: 2 },
  { id: "details", label: "Details", number: 3 },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface AddExperienceWizardProps {
  mode?: "add" | "edit";
  initialValues?: Partial<ExperienceFormValues>;
  onSubmit: (values: ExperienceFormValues) => void;
  onClose: () => void;
}

/**
 * Add/edit experience wizard. Ported from packages/ui's
 * AddExperienceWizard, which had steps 2-3 unwired, no validation, a
 * "Properties Vault" copy-paste caption, and a submit that never produced
 * data. This version wires all three steps to one ExperienceFormValues
 * object, supports categories as a multi-select (the reference had a
 * single-value select that didn't match the list's `categories` array),
 * and actually calls `onSubmit`.
 */
export default function AddExperienceWizard({
  mode = "add",
  initialValues,
  onSubmit,
  onClose,
}: AddExperienceWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("identity");
  const [values, setValues] = useState<ExperienceFormValues>({
    ...EMPTY_EXPERIENCE_FORM_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = <K extends keyof ExperienceFormValues>(
    key: K,
    value: ExperienceFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const toggleCategory = (category: ExperienceCategory) => {
    update(
      "categories",
      values.categories.includes(category)
        ? values.categories.filter((c) => c !== category)
        : [...values.categories, category],
    );
  };

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const dataUrls = await Promise.all(
      Array.from(files).map(readFileAsDataUrl),
    );
    update("images", [...values.images, ...dataUrls]);
  };

  const removeImage = (index: number) => {
    update(
      "images",
      values.images.filter((_, i) => i !== index),
    );
  };

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!values.name.trim()) problems.push("Experience name is required.");
    if (!values.location.trim()) problems.push("Location is required.");
    if (values.categories.length === 0)
      problems.push("Select at least one category.");
    if (values.pricePerPerson <= 0)
      problems.push("Price per person must be greater than zero.");
    return problems;
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1]!.id);
      return;
    }
    const problems = validate();
    setErrors(problems);
    if (problems.length > 0) {
      setCurrentStep("identity");
      return;
    }
    setShowSuccess(true);
  };

  const goPrevious = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]!.id);
  };

  const handleFinalSubmit = () => {
    onSubmit(values);
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-neutral-950 mb-2">
            {mode === "edit" ? "Saved!" : "Congratulations!"}
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            {mode === "edit"
              ? "Your changes have been saved."
              : "Your experience has been added."}
          </p>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex-1 h-1 rounded-full transition-colors ${
              step.number - 1 <= stepIndex ? "bg-black" : "bg-neutral-200"
            }`}
          />
        ))}
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-1">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {currentStep === "identity" && (
        <div className="space-y-4">
          <Field label="Experience Name">
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Cooking Class with Italian Grandmothers"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location">
              <input
                type="text"
                value={values.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Rome"
                className={inputClass}
              />
            </Field>
            <Field label="Duration">
              <input
                type="text"
                value={values.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="e.g. 3 Hours"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Starting Price Per Person (€)">
            <input
              type="number"
              value={values.pricePerPerson || ""}
              onChange={(e) =>
                update("pricePerPerson", Number(e.target.value))
              }
              placeholder="0"
              className={inputClass}
            />
          </Field>

          <Field label="Categories">
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_CATEGORIES.map((category) => {
                const selected = values.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                      selected
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Narrative Description (recommended: 150-300 words)">
            <textarea
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              placeholder="Describe the soul of this experience — tradition, taste, and the people involved..."
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {currentStep === "imagery" && (
        <div className="space-y-4">
          <Field label="Experience Images (up to 10MB each)">
            <label
              htmlFor="experience-images-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5 mb-1.5" />
              <span className="text-xs">Click to upload</span>
              <input
                id="experience-images-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files)}
              />
            </label>
          </Field>

          {values.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {values.images.map((image, index) => (
                <div
                  key={`${image.slice(0, 32)}-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200"
                >
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStep === "details" && (
        <div className="grid grid-cols-2 gap-6">
          <Field label="Maximum Guests">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  update("maxGuests", Math.max(1, values.maxGuests - 1))
                }
                className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                value={values.maxGuests}
                onChange={(e) => update("maxGuests", Number(e.target.value))}
                min={1}
                className="w-16 text-center px-2 py-2 border border-neutral-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => update("maxGuests", values.maxGuests + 1)}
                className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </Field>

          <Field label="Available Season">
            <input
              type="text"
              value={values.season}
              onChange={(e) => update("season", e.target.value)}
              placeholder="e.g. April-October"
              className={inputClass}
            />
          </Field>

          <div className="col-span-2">
            <Field label="Special Requirements or Notes">
              <textarea
                value={values.specialRequirements}
                onChange={(e) =>
                  update("specialRequirements", e.target.value)
                }
                rows={4}
                placeholder="Any physical requirements, dress code, or notes for guests..."
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200">
        <p className="text-xs text-neutral-400">
          Your progress is not saved until you submit.
        </p>
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goPrevious}
              className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {stepIndex === STEPS.length - 1
              ? mode === "edit"
                ? "Save Changes"
                : "Submit"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
