import { MessageCircle } from "lucide-react";
import { getWhatsAppSupportLink } from "@/utils/whatsapp";

/**
 * A fixed floating button in the bottom-right corner that opens WhatsApp support.
 * Fixed positioning, so it's visible across all pages. On mobile, ensure it doesn't
 * overlap interactive elements at the screen edges.
 */
export default function WhatsAppFloatingButton() {
  return (
    <a
      href={getWhatsAppSupportLink()}
      target="_blank"
      rel="noopener noreferrer"
      title="Contact support via WhatsApp"
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer z-40"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
