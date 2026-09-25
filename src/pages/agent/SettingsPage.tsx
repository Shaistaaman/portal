import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Upload, X, Check } from "lucide-react";
import {
  isAgentProfileComplete,
  confirmAgentProfileComplete,
} from "@/features/agent/agentProfileState";

/**
 * Agent Settings page - shows profile completion form on first login.
 *
 * Fields displayed (from Admin Add User form):
 * - Photo (upload)
 * - Full Name, Email, Phone
 * - Agency Name, License Number, About Agency
 * - Latitude, Longitude (with map preview)
 * - Agency License, Brand Logo (file uploads)
 *
 * "I Confirm" button marks profile complete, enables menu items, redirects to dashboard.
 */

const inputClass =
  "w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition";

interface AgentProfileForm {
  photo: string;
  fullName: string;
  email: string;
  phone: string;
  agencyName: string;
  licenseNumber: string;
  aboutAgency: string;
  latitude: string;
  longitude: string;
  agencyLicensePreview: string;
  brandImagePreview: string;
}

const DEMO_AGENT_DATA: AgentProfileForm = {
  photo:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
  fullName: "Marco Bianchi",
  email: "marco.bianchi@example.com",
  phone: "+39 02 1234 5678",
  agencyName: "Bianchi Travel & Booking Agency",
  licenseNumber: "IT-AGENT-2023-001",
  aboutAgency: "Premium travel and booking services across Europe.",
  latitude: "45.4642",
  longitude: "9.1900",
  agencyLicensePreview: "",
  brandImagePreview: "/images/logo-black.png",
};

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

export default function AgentSettingsPage() {
  const navigate = useNavigate();
  const profileComplete = isAgentProfileComplete();

  const [values, setValues] = useState<AgentProfileForm>(DEMO_AGENT_DATA);
  const [errors, setErrors] = useState<string[]>([]);

  const update = <K extends keyof AgentProfileForm>(
    key: K,
    value: AgentProfileForm[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    update("photo", dataUrl);
  };

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
    if (!values.agencyName.trim()) problems.push("Agency name is required.");
    if (!values.licenseNumber.trim())
      problems.push("License number is required.");
    if (Number.isNaN(Number.parseFloat(values.latitude)))
      problems.push("Latitude must be a number.");
    if (Number.isNaN(Number.parseFloat(values.longitude)))
      problems.push("Longitude must be a number.");
    return problems;
  };

  const handleConfirm = () => {
    const problems = validate();
    setErrors(problems);
    if (problems.length > 0) return;
    confirmAgentProfileComplete();
    navigate("/agent/dashboard");
  };

  const mapUrl = getMapUrl(values.latitude, values.longitude);

  return (
    <div>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-neutral-950 mb-2">
          Profile Settings
        </h1>
        <p className="text-neutral-600 mb-8">
          {profileComplete
            ? "Update your profile information"
            : "Complete your profile to unlock SkyLife features"}
        </p>

        {errors.length > 0 && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-1">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <form className="space-y-8">
          {/* Photo */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-950 mb-6">
              Profile Photo
            </h2>
            <div className="space-y-4">
              {values.photo && (
                <div className="relative inline-block">
                  <img
                    src={values.photo}
                    alt="Preview"
                    className="w-32 h-40 object-cover rounded-lg border border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => update("photo", "")}
                    className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-lg"
                    aria-label="Delete photo"
                    title="Delete photo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {!values.photo && (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-6 pb-6">
                    <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                    <p className="text-sm font-semibold text-neutral-900 text-center">
                      Upload Photo
                    </p>
                    <p className="text-xs text-neutral-600 text-center mt-1">
                      Click to select an image
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoChange(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-950 mb-4">
              Personal Information
            </h2>
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
            </div>
          </div>

          {/* Agency Details */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-950 mb-4">
              Agency Details
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
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
          </div>

          {/* Location */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-950 mb-4">
              Agency Location
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
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
          </div>

          {/* Documents */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-950 mb-4">
              Documents & Branding
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <FileDropzone
                label="Agency License"
                preview={values.agencyLicensePreview}
                onSelect={(file) =>
                  handleFileChange("agencyLicensePreview", file)
                }
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

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {profileComplete ? "Update Profile" : "I Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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

interface FileDropzoneProps {
  label: string;
  preview: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

function FileDropzone({
  label,
  preview,
  onSelect,
  onRemove,
}: FileDropzoneProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">
        {label}
      </label>
      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt={label}
            className="w-full h-32 object-cover rounded-lg border border-neutral-200"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-6 h-6 text-neutral-400 mb-2" />
            <p className="text-xs text-neutral-600 text-center">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
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
