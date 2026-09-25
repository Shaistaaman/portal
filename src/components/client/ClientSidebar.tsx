import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";
import { useState } from "react";

export default function ClientSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    navigate("/login");
  };

  const isActive = (href: string) => location.pathname === href;

  // Client nav items
  const CLIENT_NAV_ITEMS = [
    {
      href: "/client/dashboard",
      label: "Dashboard",
      icon: "LayoutDashboard",
    },
    {
      href: "/client/bookings",
      label: "My Bookings",
      icon: "Bookmark",
    },
    {
      href: "/client/wishlist",
      label: "Wishlist",
      icon: "Heart",
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
      Bookmark: (
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
            d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z"
          />
        </svg>
      ),
      Heart: (
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
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

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } shrink-0 border-r border-neutral-200 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="h-20 border-b border-neutral-200 flex items-center justify-between px-4">
        {sidebarOpen && (
          <span className="text-lg font-serif font-bold text-black truncate">
            SKYLIFE
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {CLIENT_NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.href);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive(item.href)
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <span
              className={`w-5 h-5 shrink-0 ${
                isActive(item.href) ? "text-white" : "text-neutral-500"
              }`}
            >
              {getIcon(item.icon)}
            </span>
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Sign Out (at bottom) */}
      <div className="border-t border-neutral-200 p-3 space-y-1">
        <a
          href="/client/settings"
          onClick={(e) => {
            e.preventDefault();
            navigate("/client/settings");
          }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            isActive("/client/settings")
              ? "bg-black text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          <svg
            className={`w-5 h-5 shrink-0 ${
              isActive("/client/settings") ? "text-white" : "text-neutral-500"
            }`}
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
          {sidebarOpen && <span className="truncate">Settings</span>}
        </a>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {sidebarOpen && <span className="truncate">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
