import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Booking Number to display, e.g. "BK-2026-04-017". */
  bookingNumber?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  bookingNumber,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Success Icon */}
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 px-8 py-12 flex justify-center">
                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center animate-pulse">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-10 text-center">
                <h2 className="font-serif text-2xl font-normal text-neutral-900 italic mb-4">
                  Thank You for the Reservation Request.
                </h2>
                <p className="text-sm font-light text-neutral-600 leading-relaxed mb-6">
                  You'll be contacted by a Skylife concierge within 24 hours to
                  confirm your stay.
                </p>

                {bookingNumber && (
                  <div className="mb-8 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <p className="text-[11px] font-light uppercase tracking-wide text-neutral-500">
                      Booking Number
                    </p>
                    <p className="font-mono text-base font-semibold text-neutral-900">
                      {bookingNumber}
                    </p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
