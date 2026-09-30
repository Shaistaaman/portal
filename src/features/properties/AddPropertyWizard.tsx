import { useMemo, useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import { MOCK_USERS } from "@/features/user-management/mockUsers";
import {
  DEFAULT_ADMIN_ONLY_FIELDS,
  EMPTY_PROPERTY_FORM_VALUES,
  MAX_ICAL_URLS,
  MAX_PROPERTY_IMAGES,
  MIN_PROPERTY_IMAGES,
  PROPERTY_AMENITIES,
  PROPERTY_BENEFITS,
  PROPERTY_CURRENCY_SYMBOL,
  type AdminOnlyPropertyFields,
  type PropertyFormValues,
  type PropertyManagementLevel,
  type PropertyType,
} from "./types";

type WizardStep =
  | "management"
  | "identity"
  | "imagery"
  | "details"
  | "amenities"
  | "financials"
  | "ownership";

interface StepDefinition {
  id: WizardStep;
  label: string;
  number: number;
  /** Rendered only for role="admin". */
  adminOnly?: boolean;
  /** Skipped in edit mode — management level is chosen once, at creation. */
  createOnly?: boolean;
}

const STEPS: StepDefinition[] = [
  { id: "management", label: "Management", number: 0, createOnly: true },
  { id: "identity", label: "Identity", number: 1 },
  { id: "imagery", label: "Imagery", number: 2 },
  { id: "details", label: "Details", number: 3 },
  { id: "amenities", label: "Amenities", number: 4 },
  { id: "financials", label: "Financials", number: 5 },
  { id: "ownership", label: "Ownership", number: 6, adminOnly: true },
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

/**
 * Same OpenStreetMap embed the agent form in features/user-management uses,
 * so coordinates preview identically in both places. Returns null while the
 * coordinates are empty or half-typed rather than rendering a broken map.
 */
function getMapUrl(latitude: string, longitude: string): string | null {
  const lat = Number.parseFloat(latitude);
  const lng = Number.parseFloat(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  const delta = 0.03;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/**
 * Merge caller-supplied initial values over the empty form without letting
 * an explicit `undefined` win.
 *
 * A plain spread would: `{...{address: ""}, ...{address: undefined}}` yields
 * `{address: undefined}`, which defeats the `Required<>` half of
 * PropertyFormValues and puts `undefined` into a controlled input (React
 * then treats it as uncontrolled and logs a warning). Today's mock records
 * simply omit the new keys so a spread happens to be safe, but a real API
 * returning explicit nulls would break it.
 */
function mergeInitialValues(
  initialValues?: Partial<PropertyFormValues>,
): PropertyFormValues {
  const merged = { ...EMPTY_PROPERTY_FORM_VALUES };
  if (!initialValues) return merged;

  for (const [key, value] of Object.entries(initialValues)) {
    if (value === undefined || value === null) continue;
    // Object.entries widens to string; the keys are known to be form keys.
    (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}

export interface AddPropertyWizardProps {
  role: "admin" | "owner";
  mode?: "add" | "edit";
  initialValues?: Partial<PropertyFormValues>;
  initialManagementLevel?: PropertyManagementLevel | "";
  initialIsFeatured?: boolean;
  /** Admin edit only — which owner the property is currently assigned to. */
  initialOwnerId?: string;
  onSubmit: (
    values: PropertyFormValues,
    adminFields: AdminOnlyPropertyFields,
  ) => void;
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
  initialOwnerId = "",
  onSubmit,
  onClose,
}: AddPropertyWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    mode === "edit" ? "identity" : "management",
  );
  const [managementLevel, setManagementLevel] = useState<
    PropertyManagementLevel | ""
  >(initialManagementLevel);
  const [values, setValues] = useState<PropertyFormValues>(() =>
    mergeInitialValues(initialValues),
  );
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [ownerId, setOwnerId] = useState(initialOwnerId);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = <K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  /**
   * The steps this particular render actually walks through. Owners never
   * see the admin-only Ownership step, and edit mode skips Management.
   * All navigation indexes against this list, not the full STEPS array —
   * otherwise an owner would "continue" into a step that renders nothing.
   */
  const activeSteps = useMemo(
    () =>
      STEPS.filter((step) => {
        if (step.adminOnly && role !== "admin") return false;
        if (step.createOnly && mode === "edit") return false;
        return true;
      }),
    [role, mode],
  );

  const stepIndex = activeSteps.findIndex((s) => s.id === currentStep);
  const visibleSteps = activeSteps.filter((s) => s.id !== "management");
  const isLastStep = stepIndex === activeSteps.length - 1;

  const mapUrl = getMapUrl(values.latitude, values.longitude);

  const ownerOptions = useMemo(
    () =>
      // TODO(AWS integration): replace with GET /v1/users?role=owner from
      // admin-fn. Ids line up with mockProperties' ownerId values.
      MOCK_USERS.filter(
        (user) => user.role === "owner" && user.status === "active",
      ),
    [],
  );

  // The Imagery step can't be left until at least MIN_PROPERTY_IMAGES are
  // added. Other steps have no blocking rule here (the management step is
  // gated separately on the Continue button's disabled state).
  const canLeaveCurrentStep =
    currentStep !== "imagery" || values.images.length >= MIN_PROPERTY_IMAGES;

  const goNext = () => {
    if (!canLeaveCurrentStep) return;
    const nextIndex = stepIndex + 1;
    if (nextIndex < activeSteps.length) {
      setCurrentStep(activeSteps[nextIndex]!.id);
    } else {
      setShowSuccess(true);
    }
  };

  const goPrevious = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(activeSteps[prevIndex]!.id);
  };

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Only accept up to the remaining slots; silently ignore any extra so a
    // multi-select of 50 files can't blow past the cap.
    const remaining = MAX_PROPERTY_IMAGES - values.images.length;
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
    // Admin-only fields are forced to their defaults for an owner
    // submission, so a crafted prop can't smuggle a featured flag or an
    // owner reassignment through the owner-facing form. The server must
    // re-check this against the Cognito group claim regardless.
    onSubmit(
      { ...values, managementLevel },
      role === "admin" ? { isFeatured, ownerId } : DEFAULT_ADMIN_ONLY_FIELDS,
    );
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
              title={step.label}
              className={`flex-1 h-1 rounded-full transition-colors ${
                // Index against activeSteps, not STEPS — in edit mode the
                // Management step is filtered out, so the two index spaces
                // diverge and comparing against STEPS leaves the bar empty
                // on the first visible step.
                activeSteps.findIndex((s) => s.id === step.id) <= stepIndex
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
              placeholder="Rome, Italy"
              className={inputClass}
            />
          </Field>
          <Field label="Address">
            <input
              type="text"
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Via del Corso 12, 00186 Roma RM"
              className={inputClass}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Full street address. Not shown publicly — used for guest
              directions and map placement.
            </p>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude (optional)">
              <input
                type="text"
                inputMode="decimal"
                value={values.latitude}
                onChange={(e) => update("latitude", e.target.value)}
                placeholder="41.9028"
                className={inputClass}
              />
            </Field>
            <Field label="Longitude (optional)">
              <input
                type="text"
                inputMode="decimal"
                value={values.longitude}
                onChange={(e) => update("longitude", e.target.value)}
                placeholder="12.4964"
                className={inputClass}
              />
            </Field>
          </div>
          {mapUrl && (
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <iframe
                title="Property location preview"
                src={mapUrl}
                className="h-48 w-full"
                loading="lazy"
              />
            </div>
          )}
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
          <Field
            label={`Property Images (${MIN_PROPERTY_IMAGES}–${MAX_PROPERTY_IMAGES}, up to 10MB each)`}
          >
            {values.images.length < MAX_PROPERTY_IMAGES ? (
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
            ) : (
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-lg text-xs text-neutral-500">
                Maximum of {MAX_PROPERTY_IMAGES} images reached. Remove one to
                add another.
              </div>
            )}
            <p
              className={`mt-1.5 text-xs ${
                values.images.length < MIN_PROPERTY_IMAGES
                  ? "text-red-600"
                  : "text-neutral-500"
              }`}
            >
              {values.images.length} of {MAX_PROPERTY_IMAGES} added
              {values.images.length < MIN_PROPERTY_IMAGES
                ? ` — add at least ${
                    MIN_PROPERTY_IMAGES - values.images.length
                  } more to continue`
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
        </div>
      )}

      {currentStep === "financials" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Property Financial Details
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              All amounts are in euros. Leave a fee at 0 to fall back to the
              Skylife default for that fee.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <MoneyField
              label="Service Fee"
              value={values.serviceFee}
              onChange={(v) => update("serviceFee", v)}
            />
            <MoneyField
              label="Cleaning Fee"
              value={values.cleaningFee}
              onChange={(v) => update("cleaningFee", v)}
            />

            <Field label="Tax %">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={values.taxPct || ""}
                  onChange={(e) => update("taxPct", Number(e.target.value))}
                  placeholder="10"
                  className={`${inputClass} pr-9`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
                  %
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                Percentage applied to the stay subtotal, e.g. 10 for 10%.
              </p>
            </Field>

            <Field label="Bank Account (IBAN)">
              <input
                type="text"
                value={values.bankAccount}
                onChange={(e) =>
                  update("bankAccount", e.target.value.toUpperCase())
                }
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                autoComplete="off"
                spellCheck={false}
                className={`${inputClass} font-mono tracking-wide`}
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Account that receives payouts for this property.
              </p>
            </Field>
          </div>
        </div>
      )}

      {currentStep === "ownership" && role === "admin" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Ownership &amp; Visibility
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Admin-only. Owners submitting their own property never see this
              step.
            </p>
          </div>

          <Field label="Tag Owner">
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Unassigned</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.fullName} — {owner.email}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1.5">
              The owner who will see this property in their portal. Can be
              assigned later if the owner has no account yet.
            </p>
          </Field>

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
            disabled={
              (currentStep === "management" && !managementLevel) ||
              !canLeaveCurrentStep
            }
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLastStep ? "Submit" : "Continue"}
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

/**
 * Euro amount input. The currency symbol is a prefix inside the field
 * rather than part of the label, so it stays visible while typing and the
 * value itself is always a bare number — no parsing of "€150" downstream.
 */
function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
          {PROPERTY_CURRENCY_SYMBOL}
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0"
          className={`${inputClass} pl-9`}
        />
      </div>
    </Field>
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
