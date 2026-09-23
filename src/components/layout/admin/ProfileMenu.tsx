import { X, MessageCircle, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { getWhatsAppSupportLink } from "@/utils/whatsapp";

interface ProfileMenuProps {
  onClose: () => void;
  onLogout: () => void;
}

/**
 * Ported from apps/portal/app/admin/components/ProfileMenu.tsx. Unlike the
 * reference, this reads the current user from AuthContext instead of a
 * hardcoded name/avatar, since AuthContext already carries a matching
 * DEMO_ADMIN fixture — no reason to duplicate it here.
 */
export default function ProfileMenu({
  onClose,
  onLogout,
  role = "admin",
}: ProfileMenuProps & { role?: "admin" | "owner" | "agent" }) {
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
                {user.role}
              </p>
            </div>
          </div>
        )}

        <div className="py-2">
          <button
            type="button"
            onClick={() => {
              navigate(`/${role}/settings`);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-neutral-500 shrink-0" />
            Settings
          </button>
          <a
            href={getWhatsAppSupportLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
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
