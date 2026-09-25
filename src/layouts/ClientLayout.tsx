import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, Bell, LogOut, X } from "lucide-react";
import ClientSidebar from "@/components/client/ClientSidebar";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import MobileMenu from "@/components/layout/admin/MobileMenu";
import NotificationPopup from "@/components/layout/admin/NotificationPopup";
import { useAuth } from "@/auth/useAuth";
import { getWhatsAppSupportLink } from "@/utils/whatsapp";

export default function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      "/client/dashboard": "Dashboard",
      "/client/bookings": "My Bookings",
      "/client/wishlist": "Wishlist",
      "/client/settings": "Settings",
    };
    return pathMap[location.pathname] || "Dashboard";
  };

  const openNotifications = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    setNotificationOpen((open) => !open);
  };

  const openProfile = () => {
    setNotificationOpen(false);
    setMobileMenuOpen(false);
    setProfileOpen((open) => !open);
  };

  const openMobileMenu = () => {
    setNotificationOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen((open) => !open);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <ClientSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-semibold text-neutral-950">
            {getPageTitle()}
          </h1>

          <div className="flex items-center gap-6">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={openNotifications}
                aria-label="Notifications"
                className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notificationOpen && (
                <NotificationPopup
                  onClose={() => setNotificationOpen(false)}
                  role="client"
                />
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={openProfile}
                aria-label="Profile menu"
                className="cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
              </button>
              {profileOpen && (
                <ProfileMenuClient
                  onClose={() => setProfileOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Mobile Menu */}
            <div className="relative lg:hidden">
              <button
                type="button"
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              {mobileMenuOpen && (
                <MobileMenu
                  activeHref={location.pathname}
                  onNavigate={(href) => {
                    setMobileMenuOpen(false);
                    navigate(href);
                  }}
                  onClose={() => setMobileMenuOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-neutral-50 p-8">
          <Outlet />
        </main>
      </div>

      {/* WhatsApp support floating button */}
      <WhatsAppFloatingButton />
    </div>
  );
}

/**
 * Client-specific profile menu (no Settings in sidebar navigation for client)
 */
function ProfileMenuClient({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 right-0 w-64 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <span className="text-sm font-semibold text-neutral-950">
            Account
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile menu"
            className="p-1 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-950 truncate">
                {user.name}
              </p>
              <p className="text-xs text-neutral-500 capitalize truncate">
                Client
              </p>
            </div>
          </div>
        )}

        <div className="py-2">
          <button
            type="button"
            onClick={() => {
              navigate("/client/settings");
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-neutral-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
          <a
            href={getWhatsAppSupportLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer block"
          >
            <svg
              className="w-4 h-4 text-green-500 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.869 1.23c-2.868 1.684-4.74 5.063-4.74 8.498 0 .71.109 1.417.32 2.102l.54 1.713-1.823.909 1.542-4.431c.151.58.433 1.159.873 1.697 1.816 2.26 5.152 3.595 8.157 3.595 4.443 0 8.05-2.468 8.05-5.5 0-1.312-.308-2.569-.89-3.723-1.385-2.773-4.157-4.691-7.158-4.691z" />
            </svg>
            Contact Support (WhatsApp)
          </a>
        </div>

        <div className="border-t border-neutral-100 p-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
