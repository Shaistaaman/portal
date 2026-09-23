import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronLeft, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import MobileMenu from "@/components/layout/admin/MobileMenu";
import NotificationPopup from "@/components/layout/admin/NotificationPopup";
import ProfileMenu from "@/components/layout/admin/ProfileMenu";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import { isAgentProfileComplete } from "@/features/agent/agentProfileState";

/**
 * Agent layout: collapsible sidebar + header, wrapping agent routes.
 * Mirrors OwnerLayout and AdminLayout structure.
 *
 * Profile completion gating:
 * - If profile incomplete: all menu items disabled/grayed except Settings and SignOut
 * - If profile complete: all menu items enabled
 */
export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileComplete = isAgentProfileComplete();

  const handleLogout = () => {
    logout();
    navigate("/agent/login");
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

  // Agent nav items (Dashboard, Calendar, Financial disabled if profile incomplete)
  const AGENT_NAV_ITEMS = [
    {
      href: "/agent/dashboard",
      label: "Dashboard",
      icon: "LayoutDashboard",
      disabled: false,
    },
    {
      href: "/agent/calendar",
      label: "Calendar",
      icon: "Calendar",
      disabled: !profileComplete,
    },
    {
      href: "/agent/financial",
      label: "Financial",
      icon: "DollarSign",
      disabled: !profileComplete,
    },
  ];

  // Dynamic icon rendering
  const getIcon = (iconName: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      LayoutDashboard: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      ),
      Calendar: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      DollarSign: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      Settings: (
        <svg
          className="w-5 h-5"
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
      ),
    };
    return icons[iconName] || null;
  };

  const getPageTitle = () => {
    const item = AGENT_NAV_ITEMS.find((i) => isActive(i.href));
    if (item) return item.label;
    if (isActive("/agent/settings")) return "Settings";
    return "Dashboard";
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
              SkyLife Agent
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
          {AGENT_NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                if (!item.disabled) {
                  navigate(item.href);
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                item.disabled
                  ? "opacity-50 cursor-not-allowed text-neutral-400"
                  : isActive(item.href)
                    ? "bg-black text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span
                className={`w-5 h-5 shrink-0 ${
                  item.disabled
                    ? "text-neutral-300"
                    : isActive(item.href)
                      ? "text-white"
                      : "text-neutral-500"
                }`}
              >
                {getIcon(item.icon)}
              </span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-3 space-y-1">
          <a
            href="/agent/settings"
            onClick={(e) => {
              e.preventDefault();
              navigate("/agent/settings");
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive("/agent/settings")
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {getIcon("Settings") && (
              <span
                className={`w-5 h-5 shrink-0 ${
                  isActive("/agent/settings")
                    ? "text-white"
                    : "text-neutral-500"
                }`}
              >
                {getIcon("Settings")}
              </span>
            )}
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
            {getPageTitle()}
          </h1>

          <div className="flex items-center gap-6">
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
                  role="agent"
                />
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
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
              </button>
              {profileOpen && (
                <ProfileMenu
                  onClose={() => setProfileOpen(false)}
                  onLogout={handleLogout}
                  role="agent"
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

      {/* WhatsApp support floating button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
