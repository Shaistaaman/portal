/**
 * WhatsApp support representatives shown in the floating popup. Each row
 * opens a direct wa.me chat with that person's number.
 */
export interface WhatsAppRep {
  name: string;
  title: string;
  /** Display phone, e.g. "+39 331 799 5308". */
  phone: string;
  /** Avatar path under /public. */
  avatar: string;
}

export const WHATSAPP_REPS: WhatsAppRep[] = [
  {
    name: "Pietro Toti",
    title: "COO & Co-Founder",
    phone: "+39 331 799 5308",
    avatar: "/images/pietro.jpg",
  },
  {
    name: "Tancredi De Sanctis",
    title: "CEO & Co-Founder",
    // Note: the image file is named "tancrdei.jpg" in /public/images.
    phone: "+39 366 170 7510",
    avatar: "/images/tancrdei.jpg",
  },
];

/** Support email shown in the popup header. */
export const SUPPORT_EMAIL = "info@skylifemanagement.com";

/** Phone shown in the popup's "Call us at" footer. */
export const SUPPORT_CALL_NUMBER = "+39 366 170 7510";

/** The message pre-filled in every rep's WhatsApp chat. */
const SUPPORT_MESSAGE =
  "Hi, I'd like to connect with the Skylife support team.";

/**
 * Strip everything except digits, as wa.me requires (no "+", spaces,
 * dashes, or brackets).
 */
function toWaNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * WhatsApp deep link that opens a direct chat with a specific number,
 * pre-filled with the support message.
 */
export function getWhatsAppLink(phone: string): string {
  const encoded = encodeURIComponent(SUPPORT_MESSAGE);
  return `https://wa.me/${toWaNumber(phone)}?text=${encoded}`;
}

/**
 * Tiny module-level event channel so a "Contact Support" menu item rendered
 * anywhere (e.g. the header ProfileMenu) can open the WhatsApp popup that
 * lives inside the floating button component, without threading state
 * through every layout.
 */
const OPEN_EVENT = "skylife:open-whatsapp-popup";

/** Ask the floating WhatsApp popup to open. */
export function openWhatsAppPopup(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Subscribe to open requests; returns an unsubscribe function. */
export function onOpenWhatsAppPopup(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
