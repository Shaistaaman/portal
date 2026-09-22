import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronLeft, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import LanguageSelector from "@/components/layout/LanguageSelector";
import MobileMenu from "@/components/layout/admin/MobileMenu";
import NotificationPopup from "@/components/layout/admin/NotificationPopup";
import ProfileMenu from "@/components/layout/admin/ProfileMenu";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SETTINGS_ITEM,
} from "@/components/layout/admin/admin-nav";
import type { Language } from "@/lib/types";

/**
 * Admin shell: collapsible sidebar + header, wrapping every /admin/* route
 * via <Outlet/>. Ported from apps/portal/app/admin/layout.tsx (Next.js
 * reference). usePathname()/next/link/next/navigation are replaced with
 * react-router-dom's useLocation/NavLink/useNavigate.
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const isActive = (href: string) => location.pathname === href;

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
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } shrink-0 border-r border-neutral-200 flex flex-col transition-all duration-300`}
      >
        <div className="h-20 border-b border-neutral-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <span className="text-xl font-serif font-bold text-black truncate">
              SkyLife Admin
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${
                sidebarOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-black text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-white" : "text-neutral-500"
                  }`}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-3 space-y-1">
          <a
            href={ADMIN_SETTINGS_ITEM.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(ADMIN_SETTINGS_ITEM.href);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive(ADMIN_SETTINGS_ITEM.href)
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <ADMIN_SETTINGS_ITEM.icon
              className={`w-5 h-5 shrink-0 ${
                isActive(ADMIN_SETTINGS_ITEM.href)
                  ? "text-white"
                  : "text-neutral-500"
              }`}
            />
            {sidebarOpen && <span className="truncate">Settings</span>}
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-semibold text-neutral-950">
            {ADMIN_NAV_ITEMS.find((item) => isActive(item.href))?.label ??
              "Dashboard"}
          </h1>

          <div className="flex items-center gap-6">
            <LanguageSelector
              theme="light"
              language={language}
              setLanguage={setLanguage}
              isOpen={isLanguageOpen}
              setIsOpen={setIsLanguageOpen}
              label={language === "en" ? "Eng" : "Ita"}
              buttonId="admin-lang-selector-btn"
            />

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
                <NotificationPopup onClose={() => setNotificationOpen(false)} />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={openProfile}
                aria-label="Profile menu"
                className="cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
              </button>
              {profileOpen && (
                <ProfileMenu
                  onClose={() => setProfileOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>

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

        <main className="flex-1 overflow-auto bg-neutral-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
