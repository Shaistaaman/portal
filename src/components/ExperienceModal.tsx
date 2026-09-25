import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface ExperienceModalProps {
  isOpen: boolean;
  experience: Experience;
  onClose: () => void;
}

export default function ExperienceModal({
  isOpen,
  experience,
  onClose,
}: ExperienceModalProps) {
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
                <h2 className="font-serif text-2xl font-normal text-neutral-900 italic mb-2">
                  Experience Added!
                </h2>
                <p className="text-sm font-light text-neutral-600 mb-6">
                  {experience.title}
                </p>
                <p className="text-lg font-bold text-neutral-900">
                  €{experience.price}
                </p>
                <p className="text-xs font-light text-neutral-500 mt-2 italic">
                  Added to your order
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
