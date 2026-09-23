import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCheck } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "./mockNotifications";
import {
  NOTIFICATION_ACTION_COLORS,
  NOTIFICATION_ACTION_LABELS,
  type Notification,
} from "./types";

const ITEMS_PER_PAGE = 10;

export default function NotificationsList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(
    MOCK_NOTIFICATIONS,
  );
  const [page, setPage] = useState(1);
  const [showUnread, setShowUnread] = useState(false);

  // Filter: show unread if toggled, otherwise all
  const filtered = useMemo(() => {
    if (!showUnread) return notifications;
    return notifications.filter((n) => !n.isRead);
  }, [notifications, showUnread]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
    setShowUnread(false);
  };

  const formatTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">
            Notifications
          </h1>
          <p className="text-neutral-600 mt-2">
            Stay updated on property onboarding, bookings, payments, and system
            events.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="px-5 py-3 text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 inline mr-1" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Unread filter toggle */}
      <div className="flex items-center gap-2 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnread}
            onChange={(e) => {
              setShowUnread(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded border-neutral-300 cursor-pointer"
          />
          <span className="text-sm font-medium text-neutral-700">
            Unread only {unreadCount > 0 && `(${unreadCount})`}
          </span>
        </label>
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 border border-neutral-200 rounded-lg">
            {showUnread ? "No unread notifications" : "No notifications"}
          </div>
        ) : (
          paginated.map((notif) => {
            const colors = NOTIFICATION_ACTION_COLORS[notif.actionType];
            const label = NOTIFICATION_ACTION_LABELS[notif.actionType];
            return (
              <div
                key={notif.id}
                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  notif.isRead
                    ? "border-neutral-200 bg-white hover:bg-neutral-50"
                    : "border-blue-200 bg-blue-50 hover:bg-blue-100"
                }`}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif.id);
                  if (notif.actionUrl) navigate(notif.actionUrl);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <div className="mt-1 w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3
                          className={`text-sm font-semibold ${
                            notif.isRead
                              ? "text-neutral-950"
                              : "text-neutral-950"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>

                      {/* Badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${colors}`}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-neutral-500 mt-2">
                      {formatTime(notif.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                page === num
                  ? "bg-black text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
