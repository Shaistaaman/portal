import { useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import type { UserRole } from "@/types/auth";
import { EMPTY_USER_FORM_VALUES, type UserFormValues } from "./types";

const ROLES: UserRole[] = ["admin", "client", "owner", "agent"];

export interface UserFormProps {
  mode: "add" | "edit";
  initialValues?: Partial<UserFormValues>;
  /** Only shown/editable in "edit" mode. */
  initialStatus?: "active" | "inactive";
  rejectionReason?: string;
  onSubmit: (values: UserFormValues, status: "active" | "inactive") => void;
  onCancel: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMapUrl(latitude: string, longitude: string): string | null {
  const lat = Number.parseFloat(latitude);
  const lng = Number.parseFloat(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  const delta = 0.03;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/**
 * Shared add/edit user form. Ported from apps/portal's two near-identical
 * pages (add-user/page.tsx, edit-user/page.tsx) which duplicated this
 * entire form, its validation, and the agency-details block — collapsed
 * here into one component parameterized by `mode`, matching the
 * shared-vs-exclusive UI convention established for admin/owner property
 * views (see Context_Instruction.md §2 rule 5).
 */
export default function UserForm({
  mode,
  initialValues,
  initialStatus = "active",
  rejectionReason,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>({
    ...EMPTY_USER_FORM_VALUES,
    ...initialValues,
  });
  const [status, setStatus] = useState<"active" | "inactive">(initialStatus);
  const [errors, setErrors] = useState<string[]>([]);

  const update = <K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleFileChange = async (
    key: "agencyLicensePreview" | "brandImagePreview",
    file: File | null,
  ) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    update(key, dataUrl);
  };

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!values.fullName.trim()) problems.push("Full name is required.");
    if (!values.email.trim()) {
      problems.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      problems.push("Enter a valid email address.");
    }
    if (!values.phone.trim()) problems.push("Phone number is required.");
    if (mode === "add" && !values.password.trim()) {
      problems.push("Password is required.");
    }
    if (values.role === "agent") {
      if (!values.agencyName.trim()) problems.push("Agency name is required.");
      if (!values.licenseNumber.trim())
        problems.push("License number is required.");
      if (Number.isNaN(Number.parseFloat(values.latitude)))
        problems.push("Latitude must be a number.");
      if (Number.isNaN(Number.parseFloat(values.longitude)))
        problems.push("Longitude must be a number.");
    }
    return problems;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (problems.length > 0) return;
    onSubmit(values, status);
  };

  const mapUrl = getMapUrl(values.latitude, values.longitude);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-1">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {mode === "add" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          New users are created with an <strong>Inactive</strong> status
          until reviewed.
        </div>
      )}

      {rejectionReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <p className="font-semibold mb-1">Application rejected</p>
          <p>{rejectionReason}</p>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-neutral-700 mb-2 block">
          Role
        </label>
        <div className="grid grid-cols-4 gap-2 max-w-md">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => update("role", role)}
              className={`px-3 py-2.5 text-xs font-semibold tracking-wide uppercase rounded-lg transition-all cursor-pointer ${
                values.role === role
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name">
          <input
            type="text"
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label={
            mode === "edit" ? "Password (leave empty to keep current)" : "Password"
          }
        >
          <input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder={mode === "edit" ? "Leave empty to keep current password" : ""}
            className={inputClass}
          />
        </Field>
      </div>

      {values.role === "agent" && (
        <div className="border border-neutral-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-950">
            Agency Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Agency Name">
              <input
                type="text"
                value={values.agencyName}
                onChange={(e) => update("agencyName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="License Number">
              <input
                type="text"
                value={values.licenseNumber}
                onChange={(e) => update("licenseNumber", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="About Agency">
            <textarea
              value={values.aboutAgency}
              onChange={(e) => update("aboutAgency", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input
                type="text"
                value={values.latitude}
                onChange={(e) => update("latitude", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Longitude">
              <input
                type="text"
                value={values.longitude}
                onChange={(e) => update("longitude", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {mapUrl && (
            <iframe
              title="Agency location preview"
              src={mapUrl}
              className="w-full h-56 border border-neutral-200 rounded-lg"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FileDropzone
              label="Agency License"
              preview={values.agencyLicensePreview}
              onSelect={(file) => handleFileChange("agencyLicensePreview", file)}
              onRemove={() => update("agencyLicensePreview", "")}
            />
            <FileDropzone
              label="Brand Logo"
              preview={values.brandImagePreview}
              onSelect={(file) => handleFileChange("brandImagePreview", file)}
              onRemove={() => update("brandImagePreview", "")}
            />
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div>
          <label className="text-xs font-semibold text-neutral-700 mb-2 block">
            Account Status
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus("active")}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                status === "active"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => setStatus("inactive")}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                status === "inactive"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {mode === "add" ? "Create User" : "Save Changes"}
        </button>
      </div>
    </form>
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

function FileDropzone({
  label,
  preview,
  onSelect,
  onRemove,
}: {
  label: string;
  preview: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputId = `file-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
        {label}
      </label>
      {preview ? (
        <div className="relative w-full h-32 rounded-lg border border-neutral-200 overflow-hidden">
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-neutral-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
        >
          <Upload className="w-5 h-5 mb-1.5" />
          <span className="text-xs">Click to upload</span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(file);
            }}
          />
        </label>
      )}
    </div>
  );
}
