import { useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import {
  EMPTY_PROPERTY_FORM_VALUES,
  MAX_ICAL_URLS,
  PROPERTY_AMENITIES,
  PROPERTY_BENEFITS,
  type PropertyFormValues,
  type PropertyManagementLevel,
  type PropertyType,
} from "./types";

type WizardStep =
  "management" | "identity" | "imagery" | "details" | "amenities";

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "management", label: "Management", number: 0 },
  { id: "identity", label: "Identity", number: 1 },
  { id: "imagery", label: "Imagery", number: 2 },
  { id: "details", label: "Details", number: 3 },
  { id: "amenities", label: "Amenities", number: 4 },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "penthouse", label: "Penthouse" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "other", label: "Other" },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface AddPropertyWizardProps {
  role: "admin" | "owner";
  mode?: "add" | "edit";
  initialValues?: Partial<PropertyFormValues>;
  initialManagementLevel?: PropertyManagementLevel | "";
  initialIsFeatured?: boolean;
  onSubmit: (values: PropertyFormValues, isFeatured: boolean) => void;
  onClose: () => void;
}

/**
 * Multi-step add/edit property form. Ported from
 * packages/ui/src/components/AddPropertyWizard.tsx (Next.js reference),
 * with two changes: the trailing "feedback" step (a 1-10 NPS-style rating
 * scale) was dropped — it read as leftover survey scaffolding unrelated to
 * describing a property, not a real field — and `handleSubmit` now
 * actually produces a `PropertyFormValues` object via `onSubmit` instead of
 * only toggling a local "Congratulations" modal with no output.
 */
export default function AddPropertyWizard({
  role,
  mode = "add",
  initialValues,
  initialManagementLevel = "",
  initialIsFeatured = false,
  onSubmit,
  onClose,
}: AddPropertyWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    mode === "edit" ? "identity" : "management",
  );
  const [managementLevel, setManagementLevel] = useState<
    PropertyManagementLevel | ""
  >(initialManagementLevel);
  const [values, setValues] = useState<PropertyFormValues>({
    ...EMPTY_PROPERTY_FORM_VALUES,
    ...initialValues,
  });
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = <K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const visibleSteps = STEPS.filter((s) => s.id !== "management");

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]!.id);
    } else {
      setShowSuccess(true);
    }
  };

  const firstStepIndex = mode === "edit" ? 1 : 0;

  const goPrevious = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= firstStepIndex) setCurrentStep(STEPS[prevIndex]!.id);
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

  const handleBrochureSelect = async (file: File | null) => {
    if (!file) return;
    setBrochureFile(file);
    update("brochureUrl", await readFileAsDataUrl(file));
  };

  const addIcalUrl = () => {
    if (values.icalUrls.length >= MAX_ICAL_URLS) return;
    update("icalUrls", [...values.icalUrls, ""]);
  };

  const updateIcalUrl = (index: number, value: string) => {
    update(
      "icalUrls",
      values.icalUrls.map((url, i) => (i === index ? value : url)),
    );
  };

  const removeIcalUrl = (index: number) => {
    update(
      "icalUrls",
      values.icalUrls.filter((_, i) => i !== index),
    );
  };

  const toggleAmenity = (amenity: string) => {
    update(
      "amenities",
      values.amenities.includes(amenity)
        ? values.amenities.filter((a) => a !== amenity)
        : [...values.amenities, amenity],
    );
  };

  const toggleBenefit = (benefit: string) => {
    update(
      "benefits",
      values.benefits.includes(benefit)
        ? values.benefits.filter((b) => b !== benefit)
        : [...values.benefits, benefit],
    );
  };

  const handleFinalSubmit = () => {
    onSubmit({ ...values, managementLevel }, role === "admin" && isFeatured);
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-neutral-950 mb-2">
            Congratulations!
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Your property has been submitted for review.
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
      {currentStep !== "management" && (
        <div className="flex items-center gap-2 mb-8">
          {visibleSteps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 h-1 rounded-full transition-colors ${
                STEPS.findIndex((s) => s.id === step.id) <= stepIndex
                  ? "bg-black"
                  : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      )}

      {currentStep === "management" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-950 mb-4">
            How should we manage this property?
          </h2>
          {(
            [
              {
                value: "full-service" as const,
                title: "Full-Service Management",
                description:
                  "Skylife handles bookings, guest communication, cleaning coordination, and pricing.",
              },
              {
                value: "marketing-only" as const,
                title: "Marketing Only",
                description:
                  "Skylife lists and markets the property; the owner handles bookings and operations directly.",
              },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setManagementLevel(option.value)}
              className={`w-full text-left p-5 border rounded-lg transition-colors cursor-pointer ${
                managementLevel === option.value
                  ? "border-black bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-950">
                {option.title}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {currentStep === "identity" && (
        <div className="space-y-4">
          <Field label="Property Name">
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Location">
            <input
              type="text"
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description (recommended: 150-300 words)">
            <textarea
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              className={inputClass}
            />
          </Field>
          <Field label="Property Brochure (optional)">
            <label
              htmlFor="brochure-upload"
              className="flex items-center gap-2 px-4 py-3 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {brochureFile ? brochureFile.name : "Click to upload (PDF/DOC)"}
              <input
                id="brochure-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) =>
                  handleBrochureSelect(e.target.files?.[0] ?? null)
                }
              />
            </label>
          </Field>

          <Field label={`iCal Links (optional, up to ${MAX_ICAL_URLS})`}>
            <div className="space-y-2">
              {values.icalUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateIcalUrl(index, e.target.value)}
                    placeholder="https://calendar.example.com/feed.ics"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeIcalUrl(index)}
                    aria-label={`Remove iCal link ${index + 1}`}
                    className="shrink-0 p-3 text-neutral-400 hover:text-red-600 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {values.icalUrls.length < MAX_ICAL_URLS && (
                <button
                  type="button"
                  onClick={addIcalUrl}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add iCal link
                </button>
              )}
            </div>
          </Field>
        </div>
      )}

      {currentStep === "imagery" && (
        <div className="space-y-4">
          <Field label="Property Images (up to 10MB each)">
            <label
              htmlFor="images-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5 mb-1.5" />
              <span className="text-xs">Click to upload</span>
              <input
                id="images-upload"
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
          <div className="space-y-4">
            <Stepper
              label="Bedrooms"
              value={values.bedrooms}
              min={1}
              max={12}
              onChange={(v) => update("bedrooms", v)}
            />
            <Field label="Area (sqm)">
              <input
                type="number"
                value={values.areaSqm || ""}
                onChange={(e) => update("areaSqm", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Property Type">
              <div className="space-y-2">
                {PROPERTY_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      checked={values.propertyType === type.value}
                      onChange={() => update("propertyType", type.value)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <div className="space-y-4">
            <Stepper
              label="Bathrooms"
              value={values.bathrooms}
              min={1}
              max={12}
              onChange={(v) => update("bathrooms", v)}
            />
            <Field label="Floor Number (optional)">
              <input
                type="text"
                value={values.floorNumber}
                onChange={(e) => update("floorNumber", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Management Benefits">
              <div className="space-y-2">
                {PROPERTY_BENEFITS.map((benefit) => (
                  <label
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={values.benefits.includes(benefit)}
                      onChange={() => toggleBenefit(benefit)}
                    />
                    {benefit}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Listing URL (optional)">
              <input
                type="url"
                value={values.listingUrl}
                onChange={(e) => update("listingUrl", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}

      {currentStep === "amenities" && (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-3">
            {PROPERTY_AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 text-sm text-neutral-700 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={values.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>

          {role === "admin" && (
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-sm font-semibold text-neutral-950 mb-1">
                Do you want this property to be featured?
              </p>
              <p className="text-xs text-neutral-500 mb-3">
                Only 6 featured properties are shown per city in the Collection
                section on the marketing site's landing page.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeatured(true)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    isFeatured
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeatured(false)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    !isFeatured
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200">
        <p className="text-xs text-neutral-400">
          Your progress is not saved until you submit.
        </p>
        <div className="flex gap-3">
          {stepIndex > firstStepIndex && (
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
            disabled={currentStep === "management" && !managementLevel}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {stepIndex === STEPS.length - 1 ? "Submit" : "Continue"}
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

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="w-16 text-center px-2 py-2 border border-neutral-300 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </Field>
  );
}
