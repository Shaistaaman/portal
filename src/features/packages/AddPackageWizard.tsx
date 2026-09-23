import { useState } from "react";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import {
  EMPTY_PACKAGE_FORM_VALUES,
  createHighlightBlock,
  type PackageFormValues,
  type PackageHighlightBlock,
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

export interface AddPackageWizardProps {
  mode?: "add" | "edit";
  initialValues?: Partial<PackageFormValues>;
  onSubmit: (values: PackageFormValues) => void;
  onClose: () => void;
}

/**
 * Add/edit package wizard, built from the reference designs:
 * Step 1 Identity (name, duration, base price, guest capacity, best season,
 * description), Step 2 Visuals (image upload gallery), Step 3 Package
 * Specifications (a top-level Highlights bullet list plus repeating
 * "What You Get In This Package?" blocks — heading, category, image,
 * highlights text). Produces a real PackageFormValues on submit.
 */
export default function AddPackageWizard({
  mode = "add",
  initialValues,
  onSubmit,
  onClose,
}: AddPackageWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("identity");
  const [values, setValues] = useState<PackageFormValues>({
    ...EMPTY_PACKAGE_FORM_VALUES,
    ...initialValues,
  });
  const [highlightDraft, setHighlightDraft] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = <K extends keyof PackageFormValues>(
    key: K,
    value: PackageFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

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

  const addHighlight = () => {
    const trimmed = highlightDraft.trim();
    if (!trimmed) return;
    update("highlights", [...values.highlights, trimmed]);
    setHighlightDraft("");
  };

  const removeHighlight = (index: number) => {
    update(
      "highlights",
      values.highlights.filter((_, i) => i !== index),
    );
  };

  const updateInclusion = (
    id: string,
    field: keyof PackageHighlightBlock,
    value: string,
  ) => {
    update(
      "inclusions",
      values.inclusions.map((block) =>
        block.id === id ? { ...block, [field]: value } : block,
      ),
    );
  };

  const handleInclusionImage = async (id: string, file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateInclusion(id, "image", dataUrl);
  };

  const addInclusion = () =>
    update("inclusions", [...values.inclusions, createHighlightBlock()]);

  const removeInclusion = (id: string) =>
    update(
      "inclusions",
      values.inclusions.filter((block) => block.id !== id),
    );

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!values.name.trim()) problems.push("Package name is required.");
    if (!values.duration.trim()) problems.push("Duration is required.");
    if (values.basePrice <= 0)
      problems.push("Base price must be greater than zero.");
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
          <h2 className="text-lg font-semibold text-neutral-950 mb-2">
            Package {mode === "edit" ? "Updated" : "Added"}
          </h2>
          <p className="text-sm text-neutral-600 mb-1">Congratulations!</p>
          <p className="text-sm text-neutral-600 mb-6">
            You have successfully {mode === "edit" ? "updated" : "added"} the
            package.
          </p>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="px-8 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
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
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Step 01
            </p>
            <h2 className="text-2xl font-semibold text-neutral-950 mt-1">
              Package Identity
            </h2>
          </div>

          <Field label="Package Name">
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Rome Eternal Elegance"
              className={inputClass}
            />
            <p className="text-xs text-neutral-400 mt-1 italic">
              This name will be featured prominently on the client-facing
              editorial portal.
            </p>
          </Field>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Duration">
              <input
                type="text"
                value={values.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="7 Days"
                className={inputClass}
              />
            </Field>
            <Field label="Base Price ($)">
              <input
                type="number"
                value={values.basePrice || ""}
                onChange={(e) => update("basePrice", Number(e.target.value))}
                placeholder="12500"
                className={inputClass}
              />
            </Field>
            <Field label="Guest Capacity">
              <input
                type="number"
                value={values.guestCapacity || ""}
                onChange={(e) =>
                  update("guestCapacity", Number(e.target.value))
                }
                placeholder="2"
                className={inputClass}
              />
            </Field>
            <Field label="Best Season">
              <input
                type="text"
                value={values.bestSeason}
                onChange={(e) => update("bestSeason", e.target.value)}
                placeholder="March - September"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              placeholder="Craft a compelling narrative about the experience. Describe the atmosphere, the exclusive access, and the unique sensory journey..."
              className={inputClass}
            />
            <p className="text-right text-xs text-neutral-400 mt-1">
              RECOMMENDED: 150-300 WORDS
            </p>
          </Field>
        </div>
      )}

      {currentStep === "imagery" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Step 02
            </p>
            <h2 className="text-2xl font-semibold text-neutral-950 mt-1">
              Visuals
            </h2>
            <p className="text-neutral-600 mt-1">
              High-resolution photographs for the package banner and "At a
              Glance" section.
            </p>
          </div>

          <label
            htmlFor="package-images-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
          >
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-sm">Click to upload or drag and drop</span>
            <span className="text-xs text-neutral-400 mt-1">
              Supported formats: JPG, PNG, PDF (Max 10MB)
            </span>
            <input
              id="package-images-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files)}
            />
          </label>

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
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Step 03
            </p>
            <h2 className="text-2xl font-semibold text-neutral-950 mt-1">
              Package Specifications
            </h2>
            <p className="text-neutral-600 mt-1">
              Define the invisible threads of luxury that separate a stay from
              an experience.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2 block">
              Highlights
            </label>
            {values.highlights.length > 0 && (
              <ul className="mb-3 space-y-2">
                {values.highlights.map((highlight, index) => (
                  <li
                    key={highlight}
                    className="flex items-center justify-between gap-2 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2"
                  >
                    <span>• {highlight}</span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      aria-label={`Remove highlight ${index + 1}`}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={highlightDraft}
                onChange={(e) => setHighlightDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                placeholder="Add a highlight and press Enter"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-950">
              What You Get In This Package?
            </h3>
            <p className="text-neutral-600 text-sm mt-1 mb-4">
              Add the bespoke services and architectural highlights that define
              this package.
            </p>

            <div className="space-y-6">
              {values.inclusions.map((block, index) => (
                <div
                  key={block.id}
                  className="border border-neutral-200 rounded-lg p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Inclusion {index + 1}
                    </span>
                    {values.inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInclusion(block.id)}
                        aria-label={`Remove inclusion ${index + 1}`}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Heading">
                      <input
                        type="text"
                        value={block.heading}
                        onChange={(e) =>
                          updateInclusion(block.id, "heading", e.target.value)
                        }
                        placeholder="Soul In The City"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Category">
                      <input
                        type="text"
                        value={block.category}
                        onChange={(e) =>
                          updateInclusion(block.id, "category", e.target.value)
                        }
                        placeholder="Culture & Gastronomy"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
                        Image
                      </label>
                      {block.image ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-neutral-200">
                          <img
                            src={block.image}
                            alt={block.heading || "Inclusion"}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateInclusion(block.id, "image", "")
                            }
                            aria-label="Remove inclusion image"
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor={`inclusion-image-${block.id}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-xs">Click to upload</span>
                          <input
                            id={`inclusion-image-${block.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleInclusionImage(
                                block.id,
                                e.target.files?.[0] ?? null,
                              )
                            }
                          />
                        </label>
                      )}
                    </div>

                    <Field label="Highlights">
                      <textarea
                        value={block.highlights}
                        onChange={(e) =>
                          updateInclusion(
                            block.id,
                            "highlights",
                            e.target.value,
                          )
                        }
                        rows={5}
                        placeholder="Describe this inclusion..."
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addInclusion}
              className="mt-4 flex items-center gap-1.5 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add another inclusion
            </button>
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
      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
