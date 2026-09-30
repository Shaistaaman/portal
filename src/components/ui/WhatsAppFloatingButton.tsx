import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import {
  getWhatsAppLink,
  onOpenWhatsAppPopup,
  SUPPORT_CALL_NUMBER,
  SUPPORT_EMAIL,
  WHATSAPP_REPS,
} from "@/utils/whatsapp";

/**
 * Fixed floating button in the bottom-right corner. Clicking it toggles a
 * popup listing the Skylife representatives; each row opens a direct
 * WhatsApp chat with that person. The popup can also be opened from
 * elsewhere (e.g. the header's "Contact Support" menu item) via
 * openWhatsAppPopup(). Visible across all pages.
 */
export default function WhatsAppFloatingButton() {
  const [open, setOpen] = useState(false);

  // Let a "Contact Support" action rendered anywhere open this popup.
  useEffect(() => onOpenWhatsAppPopup(() => setOpen(true)), []);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
          {/* Header */}
          <div className="relative bg-neutral-800 text-white p-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold">Welcome to Skylife!</h2>
            <p className="text-sm text-white/80 mt-1.5 leading-relaxed">
              Click one of our representatives below to chat on WhatsApp or send
              us an email to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="underline hover:text-white"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          {/* Representatives */}
          <div className="divide-y divide-neutral-100">
            {WHATSAPP_REPS.map((rep) => (
              <a
                key={rep.phone}
                href={getWhatsAppLink(rep.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <span className="relative shrink-0">
                  <img
                    src={rep.avatar}
                    alt={rep.name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-neutral-950">
                    {rep.name}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {rep.title}
                  </span>
                </span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-100 text-center text-sm text-neutral-500">
            Call us at{" "}
            <a
              href={`tel:${SUPPORT_CALL_NUMBER.replace(/\s/g, "")}`}
              className="font-semibold text-green-600 hover:text-green-700"
            >
              {SUPPORT_CALL_NUMBER}
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          open ? "Close support popup" : "Contact support via WhatsApp"
        }
        aria-expanded={open}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
          open
            ? "bg-neutral-700 hover:bg-neutral-800 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
