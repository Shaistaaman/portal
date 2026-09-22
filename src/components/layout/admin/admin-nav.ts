import {
  Home,
  Users,
  Building2,
  Briefcase,
  Package,
  Calendar,
  DollarSign,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

/**
 * Primary sidebar nav items, shared by the desktop sidebar and the mobile
 * menu drawer. Reviews and Messages are intentionally left out — the
 * reference Next.js admin (apps/portal/app/admin/layout.tsx) has both
 * routes stubbed as "coming soon" and their nav links commented out;
 * re-add them here once those pages are real.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "User Management", href: "/admin/user-management" },
  { icon: Building2, label: "Properties", href: "/admin/properties" },
  { icon: Briefcase, label: "Experiences", href: "/admin/experiences" },
  { icon: Package, label: "Packages", href: "/admin/packages" },
  { icon: Calendar, label: "Calendar", href: "/admin/calendar" },
  { icon: DollarSign, label: "Financial", href: "/admin/financial" },
];

export const ADMIN_SETTINGS_ITEM: AdminNavItem = {
  icon: Settings,
  label: "Settings",
  href: "/admin/settings",
};
