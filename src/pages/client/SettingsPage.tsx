import { useState, useRef } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/auth/useAuth";

export default function ClientSettingsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "notifications"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "+39 123 456 7890",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    emailNotifications: true,
    promotions: true,
    weeklyDigest: true,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsSaving(false);
  };

  const savePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters!");
      return;
    }
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Password changed successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsSaving(false);
  };

  const saveNotifications = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Notification preferences updated!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsSaving(false);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatar(result);
        setSuccessMessage("Profile photo updated!");
        setTimeout(() => setSuccessMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "profile"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`py-4 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "password"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-4 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "notifications"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="bg-white border border-neutral-200 rounded-lg p-8 space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border border-neutral-200"
                />
                <button
                  onClick={triggerFileInput}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Change Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) =>
                  handleProfileChange("firstName", e.target.value)
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) =>
                  handleProfileChange("lastName", e.target.value)
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                We'll send account updates to this address
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={saveProfile}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="max-w-2xl">
          <div className="bg-white border border-neutral-200 rounded-lg p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                For your security, use a strong password with at least 8
                characters, including uppercase, lowercase, and numbers.
              </p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-950 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={savePassword}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl">
          <div className="bg-white border border-neutral-200 rounded-lg p-8 space-y-6">
            <div className="space-y-4">
              {/* Booking Updates */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-medium text-neutral-950">
                    Booking Updates
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Receive updates about your bookings and reservations
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange("bookingUpdates")}
                  className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                    notifications.bookingUpdates
                      ? "bg-neutral-900"
                      : "bg-neutral-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      notifications.bookingUpdates
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-medium text-neutral-950">
                    Email Notifications
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange("emailNotifications")}
                  className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                    notifications.emailNotifications
                      ? "bg-neutral-900"
                      : "bg-neutral-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      notifications.emailNotifications
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Promotions */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-medium text-neutral-950">
                    Promotional Offers
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Receive special deals and promotions
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange("promotions")}
                  className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                    notifications.promotions
                      ? "bg-neutral-900"
                      : "bg-neutral-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      notifications.promotions
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-950">
                    Weekly Digest
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Get a weekly summary of your activity
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange("weeklyDigest")}
                  className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                    notifications.weeklyDigest
                      ? "bg-neutral-900"
                      : "bg-neutral-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      notifications.weeklyDigest
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveNotifications}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
