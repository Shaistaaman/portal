/**
 * WhatsApp contact info for support.
 */
export const WHATSAPP_SUPPORT_NUMBERS = ["+39 366 170 7510", "+39 331 799 5308"];

/**
 * Generate a WhatsApp link with a pre-filled message listing both support contacts.
 * Opens WhatsApp Web (on desktop) or the mobile app with a message inviting the user
 * to reach out to the support team.
 */
export function getWhatsAppSupportLink(): string {
  const message = `Hi, I'd like to connect with the Skylife support team. Contact the group: ${WHATSAPP_SUPPORT_NUMBERS.join(", ")}`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/?text=${encoded}`;
}
