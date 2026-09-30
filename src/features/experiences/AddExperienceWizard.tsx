import { useState } from "react";
import { Upload, X } from "lucide-react";
import {
  EMPTY_EXPERIENCE_FORM_VALUES,
  EXPERIENCE_CATEGORIES,
  MAX_EXPERIENCE_IMAGES,
  MIN_EXPERIENCE_IMAGES,
  timeToMinutes,
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

  // Live inline validation for the bookable window, shown directly under the
  // time inputs as soon as both are set (not only on submit).
  const fromMinutes = timeToMinutes(values.bookableFrom);
  const untilMinutes = timeToMinutes(values.bookableUntil);
  const windowError =
    fromMinutes !== null && untilMinutes !== null && untilMinutes <= fromMinutes
      ? "Bookable-until must be after bookable-from."
      : "";

  // Slot Duration is entered as hours + minutes but stored as a single
  // durationMinutes number.
  const slotHours = Math.floor(values.durationMinutes / 60);
  const slotMinutes = values.durationMinutes % 60;
  const setSlotDuration = (hours: number, minutes: number) => {
    const safeHours = Number.isFinite(hours) ? Math.max(0, hours) : 0;
    const safeMinutes = Number.isFinite(minutes)
      ? Math.min(59, Math.max(0, minutes))
      : 0;
    update("durationMinutes", safeHours * 60 + safeMinutes);
  };

  // Live inline check: the slot can't be longer than the bookable window.
  // Only compared when the window is valid (both times set, until > from);
  // an empty/invalid window applies no cap here and is caught on submit.
  // Equal to the window is allowed (one slot starting at bookable-from).
  const windowLength =
    windowError === "" && fromMinutes !== null && untilMinutes !== null
      ? untilMinutes - fromMinutes
      : null;
  const slotTooLong =
    windowLength !== null && values.durationMinutes > windowLength;
  const slotDurationError = slotTooLong
    ? `Slot duration can't exceed the bookable window (${formatDuration(windowLength)}).`
    : "";

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
    // Accept only up to the remaining slots; ignore extras so a large
    // multi-select can't exceed the cap.
    const remaining = MAX_EXPERIENCE_IMAGES - values.images.length;
    if (remaining <= 0) return;
    const dataUrls = await Promise.all(
      Array.from(files).slice(0, remaining).map(readFileAsDataUrl),
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

    // Slot duration + bookable window. The window must be long enough to hold
    // one slot-length booking; the client booking flow relies on this.
    if (values.durationMinutes <= 0)
      problems.push("Slot duration must be greater than zero.");
    if (fromMinutes === null) problems.push("Set a valid bookable-from time.");
    if (untilMinutes === null)
      problems.push("Set a valid bookable-until time.");
    if (fromMinutes !== null && untilMinutes !== null) {
      if (untilMinutes <= fromMinutes)
        problems.push("Bookable-until must be after bookable-from.");
      else if (
        values.durationMinutes > 0 &&
        untilMinutes - fromMinutes < values.durationMinutes
      )
        problems.push(
          "The bookable window must be at least as long as the slot duration.",
        );
    }

    if (values.pricePerPerson <= 0)
      problems.push("Price per person must be greater than zero.");
    if (values.images.length < MIN_EXPERIENCE_IMAGES)
      problems.push(
        `Add at least ${MIN_EXPERIENCE_IMAGES} images (Imagery step).`,
      );
    return problems;
  };

  // Per-step gates on the Continue button:
  //  - Imagery: needs at least MIN_EXPERIENCE_IMAGES.
  //  - Identity: can't advance while the slot duration exceeds the window
  //    (the inline error under Slot Duration is showing).
  // The rest of the fields are validated on final submit.
  const canLeaveCurrentStep =
    (currentStep !== "imagery" ||
      values.images.length >= MIN_EXPERIENCE_IMAGES) &&
    (currentStep !== "identity" || !slotTooLong);

  const goNext = () => {
    if (!canLeaveCurrentStep) return;
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
    // The free-text `duration` field was removed from the form; derive its
    // display string from the entered slot duration so the saved record's
    // display text stays in sync with the minutes.
    onSubmit({ ...values, duration: formatDuration(values.durationMinutes) });
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

          <Field label="Location">
            <input
              type="text"
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Rome"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Bookable From">
              <input
                type="time"
                value={values.bookableFrom}
                onChange={(e) => update("bookableFrom", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Bookable Until">
              <input
                type="time"
                value={values.bookableUntil}
                onChange={(e) => update("bookableUntil", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          {windowError ? (
            <p className="-mt-2 text-xs text-red-600">{windowError}</p>
          ) : (
            <p className="-mt-2 text-xs text-neutral-500">
              The daily window guests can book within, same every day.
            </p>
          )}

          <Field label="Slot Duration">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={slotHours || ""}
                  onChange={(e) =>
                    setSlotDuration(Number(e.target.value), slotMinutes)
                  }
                  placeholder="0"
                  aria-label="Slot duration hours"
                  className={`${inputClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
                  hh
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={slotMinutes || ""}
                  onChange={(e) =>
                    setSlotDuration(slotHours, Number(e.target.value))
                  }
                  placeholder="0"
                  aria-label="Slot duration minutes"
                  className={`${inputClass} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
                  mm
                </span>
              </div>
            </div>
            {slotDurationError ? (
              <p className="mt-1.5 text-xs text-red-600">{slotDurationError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-neutral-500">
                The exact length of a client's booking. A requested slot equals
                this and must fit inside the bookable window above.
              </p>
            )}
          </Field>

          <Field label="Starting Price Per Person (€)">
            <input
              type="number"
              value={values.pricePerPerson || ""}
              onChange={(e) => update("pricePerPerson", Number(e.target.value))}
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
          <Field
            label={`Experience Images (${MIN_EXPERIENCE_IMAGES}–${MAX_EXPERIENCE_IMAGES}, up to 10MB each)`}
          >
            {values.images.length < MAX_EXPERIENCE_IMAGES ? (
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
            ) : (
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-lg text-xs text-neutral-500">
                Maximum of {MAX_EXPERIENCE_IMAGES} images reached. Remove one to
                add another.
              </div>
            )}
            <p
              className={`mt-1.5 text-xs ${
                values.images.length < MIN_EXPERIENCE_IMAGES
                  ? "text-red-600"
                  : "text-neutral-500"
              }`}
            >
              {values.images.length} of {MAX_EXPERIENCE_IMAGES} added
              {values.images.length < MIN_EXPERIENCE_IMAGES
                ? ` — add at least ${
                    MIN_EXPERIENCE_IMAGES - values.images.length
                  } more`
                : ""}
            </p>
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
                onChange={(e) => update("specialRequirements", e.target.value)}
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
            disabled={!canLeaveCurrentStep}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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

/**
 * Render a minutes count as display text for the `duration` field now that
 * the free-text input is gone. 180 → "3h", 150 → "2h 30m", 45 → "45m".
 */
function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

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
