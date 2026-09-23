import { useState, type FormEvent } from "react";
import { useAuth } from "@/auth/useAuth";
import type { UserRole } from "@/types/auth";

/**
 * Shared account-settings screen for all four roles. Per
 * Project_Specification.md §3, "Own profile / account settings" is ✅ for
 * every role, so the Profile / Change Password / Notification sections are
 * common. Agent additionally gets an Agency Details block (mirrors the
 * agent fields in User Management).
 *
 * All saves are local-only today (no persistence) — see the
 * TODO(AWS integration) notes; wire to admin-fn / a profile endpoint once
 * the backend exists.
 */
export default function AccountSettings({ role }: { role: UserRole }) {
  const { user } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  const handleAvatarSelect = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const [agency, setAgency] = useState({
    agencyName: "",
    licenseNumber: "",
    aboutAgency: "",
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState({
    email: true,
  });

  // Admin-only org-level booking fees, applied to booking price estimates
  // (base price x nights + these). See Project_Specification.md §4.5.
  const [fees, setFees] = useState({
    cleaningFee: "150",
    serviceFee: "75",
    taxesPct: "10",
  });

  const [savedSection, setSavedSection] = useState<string | null>(null);

  const flashSaved = (section: string) => {
    // TODO(AWS integration): replace with real save calls per section.
    setSavedSection(section);
    window.setTimeout(() => setSavedSection(null), 2000);
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    flashSaved("profile");
  };

  const handleAgencySubmit = (e: FormEvent) => {
    e.preventDefault();
    flashSaved("agency");
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!password.current || !password.next) {
      setPasswordError("Enter your current and new password.");
      return;
    }
    if (password.next.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (password.next !== password.confirm) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setPassword({ current: "", next: "", confirm: "" });
    flashSaved("password");
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-950">Settings</h1>
        <p className="text-neutral-600 mt-2 capitalize">
          Manage your {role} account.
        </p>
      </div>

      {/* Profile */}
      <Section
        title="Profile"
        description="Your personal details."
        saved={savedSection === "profile"}
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt={user?.name ?? "Avatar"}
              className="w-16 h-16 rounded-full object-cover border border-neutral-200"
            />
            <label
              htmlFor="avatar-upload"
              className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Change photo
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleAvatarSelect(e.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name">
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Last Name">
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <SaveButton>Save Profile</SaveButton>
        </form>
      </Section>

      {/* Agent-only: Agency Details */}
      {role === "agent" && (
        <Section
          title="Agency Details"
          description="Information about your agency."
          saved={savedSection === "agency"}
        >
          <form onSubmit={handleAgencySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Agency Name">
                <input
                  type="text"
                  value={agency.agencyName}
                  onChange={(e) =>
                    setAgency({ ...agency, agencyName: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="License Number">
                <input
                  type="text"
                  value={agency.licenseNumber}
                  onChange={(e) =>
                    setAgency({ ...agency, licenseNumber: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="About Agency">
              <textarea
                value={agency.aboutAgency}
                onChange={(e) =>
                  setAgency({ ...agency, aboutAgency: e.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </Field>
            <SaveButton>Save Agency Details</SaveButton>
          </form>
        </Section>
      )}

      {/* Change Password */}
      <Section
        title="Change Password"
        description="Update the password you use to sign in."
        saved={savedSection === "password"}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {passwordError}
            </div>
          )}
          <Field label="Current Password">
            <input
              type="password"
              value={password.current}
              onChange={(e) =>
                setPassword({ ...password, current: e.target.value })
              }
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="New Password">
              <input
                type="password"
                value={password.next}
                onChange={(e) =>
                  setPassword({ ...password, next: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Confirm New Password">
              <input
                type="password"
                value={password.confirm}
                onChange={(e) =>
                  setPassword({ ...password, confirm: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <SaveButton>Update Password</SaveButton>
        </form>
      </Section>

      {/* Notifications */}
      <Section
        title="Notification Preferences"
        description="Choose how Skylife contacts you."
        saved={savedSection === "notifications"}
      >
        <div className="space-y-3">
          <ToggleRow
            label="Email notifications"
            description="Booking updates, approvals, and account activity."
            checked={notifications.email}
            onChange={(v) => setNotifications({ ...notifications, email: v })}
          />
          <div className="pt-2">
            <button
              type="button"
              onClick={() => flashSaved("notifications")}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </Section>

      {/* Admin-only: Booking Fees (applied to booking price estimates) */}
      {role === "admin" && (
        <Section
          title="Booking Fees"
          description="Org-level fees added on top of a property's nightly rate when estimating a booking total. Admins only."
          saved={savedSection === "fees"}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Cleaning Fee ($)">
                <input
                  type="number"
                  value={fees.cleaningFee}
                  onChange={(e) =>
                    setFees({ ...fees, cleaningFee: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Service Fee ($)">
                <input
                  type="number"
                  value={fees.serviceFee}
                  onChange={(e) =>
                    setFees({ ...fees, serviceFee: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Taxes (%)">
                <input
                  type="number"
                  value={fees.taxesPct}
                  onChange={(e) =>
                    setFees({ ...fees, taxesPct: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
            <p className="text-xs text-neutral-500">
              Booking total = (nightly rate × nights) + cleaning fee + service
              fee + taxes.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => flashSaved("fees")}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save Booking Fees
              </button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition";

function Section({
  title,
  description,
  saved,
  children,
}: {
  title: string;
  description: string;
  saved: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-neutral-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        </div>
        {saved && (
          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            Saved
          </span>
        )}
      </div>
      {children}
    </section>
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

function SaveButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-neutral-900">
          {label}
        </span>
        <span className="block text-xs text-neutral-500 mt-0.5">
          {description}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-black" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}
