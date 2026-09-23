import { useState } from "react";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import {
  EMPTY_BLOG_FORM_VALUES,
  createBlogSection,
  type BlogFormValues,
  type BlogSection,
} from "./types";

type WizardStep = "identity" | "details";

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "identity", label: "Identity", number: 1 },
  { id: "details", label: "Blog Details", number: 2 },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface AddBlogWizardProps {
  mode?: "add" | "edit";
  initialValues?: Partial<BlogFormValues>;
  onSubmit: (values: BlogFormValues) => void;
  onClose: () => void;
}

/**
 * Add/edit blog wizard — 2 steps:
 *   Step 1 Identity: banner image, title, subtitle.
 *   Step 2 Blog Details: a highlights bullet list + repeating
 *     heading/category/image/content sections, mirroring the Packages
 *     wizard's Specifications step.
 */
export default function AddBlogWizard({
  mode = "add",
  initialValues,
  onSubmit,
  onClose,
}: AddBlogWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("identity");
  const [values, setValues] = useState<BlogFormValues>({
    ...EMPTY_BLOG_FORM_VALUES,
    ...initialValues,
  });
  const [highlightDraft, setHighlightDraft] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = <K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleBannerSelect = async (file: File | null) => {
    if (!file) return;
    update("bannerImage", await readFileAsDataUrl(file));
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

  const updateSection = (
    id: string,
    field: keyof BlogSection,
    value: string,
  ) => {
    update(
      "sections",
      values.sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    );
  };

  const handleSectionImage = async (id: string, file: File | null) => {
    if (!file) return;
    updateSection(id, "image", await readFileAsDataUrl(file));
  };

  const addSection = () =>
    update("sections", [...values.sections, createBlogSection()]);

  const removeSection = (id: string) =>
    update(
      "sections",
      values.sections.filter((section) => section.id !== id),
    );

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!values.title.trim()) problems.push("Blog title is required.");
    if (!values.subtitle.trim()) problems.push("Subtitle is required.");
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
            Blog {mode === "edit" ? "Updated" : "Added"}
          </h2>
          <p className="text-sm text-neutral-600 mb-1">Congratulations!</p>
          <p className="text-sm text-neutral-600 mb-6">
            You have successfully {mode === "edit" ? "updated" : "added"} the
            blog.
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
              Blog Identity
            </h2>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 block">
              Banner Image
            </label>
            {values.bannerImage ? (
              <div className="relative w-full rounded-lg overflow-hidden border border-neutral-200" style={{ aspectRatio: "16/6" }}>
                <img
                  src={values.bannerImage}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => update("bannerImage", "")}
                  aria-label="Remove banner image"
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="banner-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
              >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-sm">Click to upload banner image</span>
                <span className="text-xs text-neutral-400 mt-1">
                  Supported formats: JPG, PNG (Max 10MB)
                </span>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleBannerSelect(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            )}
          </div>

          <Field label="Title">
            <input
              type="text"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. A Weekend in Eternal Rome"
              className={inputClass}
            />
          </Field>

          <Field label="Subtitle">
            <input
              type="text"
              value={values.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="A short line summarizing the blog"
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {currentStep === "details" && (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Step 02
            </p>
            <h2 className="text-2xl font-semibold text-neutral-950 mt-1">
              Blog Details
            </h2>
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
              Content Sections
            </h3>
            <p className="text-neutral-600 text-sm mt-1 mb-4">
              Add the sections that make up the body of this blog.
            </p>

            <div className="space-y-6">
              {values.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="border border-neutral-200 rounded-lg p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Section {index + 1}
                    </span>
                    {values.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        aria-label={`Remove section ${index + 1}`}
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
                        value={section.heading}
                        onChange={(e) =>
                          updateSection(section.id, "heading", e.target.value)
                        }
                        placeholder="Soul In The City"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Category">
                      <input
                        type="text"
                        value={section.category}
                        onChange={(e) =>
                          updateSection(section.id, "category", e.target.value)
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
                      {section.image ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-neutral-200">
                          <img
                            src={section.image}
                            alt={section.heading || "Section"}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSection(section.id, "image", "")
                            }
                            aria-label="Remove section image"
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor={`section-image-${section.id}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-xs">Click to upload</span>
                          <input
                            id={`section-image-${section.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleSectionImage(
                                section.id,
                                e.target.files?.[0] ?? null,
                              )
                            }
                          />
                        </label>
                      )}
                    </div>

                    <Field label="Content">
                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSection(section.id, "content", e.target.value)
                        }
                        rows={5}
                        placeholder="Write this section's content..."
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSection}
              className="mt-4 flex items-center gap-1.5 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add another section
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
