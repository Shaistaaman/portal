import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}

/**
 * Dummy notification data, ported from
 * apps/portal/app/admin/components/NotificationPopup.tsx. Replace with a
 * real notifications API once notify-fn exists (see Context_Instruction.md).
 */
const NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "success",
    title: "Property Approved",
    message: "Villa Toscana has been approved and is now live.",
    timestamp: "5 minutes ago",
  },
  {
    id: "notif-2",
    type: "warning",
    title: "Booking Request Pending",
    message: "A new booking request is awaiting your review.",
    timestamp: "1 hour ago",
  },
  {
    id: "notif-3",
    type: "info",
    title: "New Owner Application",
    message: "Marco Bianchi submitted a property owner application.",
    timestamp: "3 hours ago",
  },
  {
    id: "notif-4",
    type: "success",
    title: "Payment Received",
    message: "Payment for booking #SKY-4821 has been confirmed.",
    timestamp: "Yesterday",
  },
];

const ICON_BY_TYPE = {
  success: { Icon: CheckCircle, className: "text-green-600" },
  warning: { Icon: AlertCircle, className: "text-yellow-600" },
  info: { Icon: Info, className: "text-blue-600" },
} as const;

export default function NotificationPopup({
  onClose,
  role = "admin",
}: {
  onClose: () => void;
  role?: "admin" | "owner" | "agent";
}) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate(`/${role}/notifications`);
    onClose();
  };
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 right-0 w-96 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <span className="text-sm font-semibold text-neutral-950">
            Notifications
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="p-1 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {NOTIFICATIONS.map((notification) => {
            const { Icon, className } = ICON_BY_TYPE[notification.type];
            return (
              <div
                key={notification.id}
                className="flex gap-3 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${className}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-950">
                    {notification.title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleViewAll}
            className="w-full py-2 text-xs font-semibold text-center text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}
