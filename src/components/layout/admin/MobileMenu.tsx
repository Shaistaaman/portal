import { X, LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS, ADMIN_SETTINGS_ITEM } from "./admin-nav";

interface MobileMenuProps {
  activeHref: string;
  onNavigate: (href: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

const ITEMS = [...ADMIN_NAV_ITEMS, ADMIN_SETTINGS_ITEM];

/**
 * Small-screen nav drawer, anchored under the header's hamburger button.
 * Ported from apps/portal/app/admin/components/MobileMenu.tsx.
 */
export default function MobileMenu({
  activeHref,
  onNavigate,
  onClose,
  onLogout,
}: MobileMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 right-0 w-80 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <span className="text-sm font-semibold text-neutral-950">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="py-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href === activeHref;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => onNavigate(item.href)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
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
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-neutral-100 p-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
