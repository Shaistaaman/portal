import { AnimatePresence, motion } from "motion/react";
import { Globe, Check } from "lucide-react";
import type { Language } from "@/lib/types";

interface LanguageSelectorProps {
  theme: "dark" | "light";
  language: Language;
  setLanguage: (lang: Language) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  label: string;
  buttonId?: string;
}

const THEME_STYLES: Record<
  LanguageSelectorProps["theme"],
  { button: string; panel: string; option: string; check: string }
> = {
  dark: {
    button: "text-white hover:bg-white/5",
    panel: "bg-neutral-950 border-white/10 shadow-2xl",
    option: "hover:bg-white/5",
    check: "text-white",
  },
  light: {
    button: "text-neutral-800 hover:bg-neutral-100",
    panel: "bg-white border-neutral-200 text-neutral-800 shadow-xl",
    option: "hover:bg-neutral-50",
    check: "text-neutral-800",
  },
};

/**
 * The globe icon + "ENG/ITA" trigger button and its dropdown of language
 * options, shared between the light/expanded header and the dark/standard
 * header (only color classes differ, controlled by `theme`).
 */
export default function LanguageSelector({
  theme,
  language,
  setLanguage,
  isOpen,
  setIsOpen,
  label,
  buttonId,
}: LanguageSelectorProps) {
  const styles = THEME_STYLES[theme];

  return (
    <div className="relative h-full flex items-center">
      <button
        id={buttonId}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-20 px-4 sm:px-6 flex items-center gap-2 transition-colors text-xs sm:text-sm font-sans tracking-widest uppercase font-medium cursor-pointer ${styles.button}`}
      >
        <Globe className="w-3.5 h-3.5 stroke-[1.5]" />
        <span>{label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-[100%] w-40 border rounded-b-lg z-50 py-1 ${styles.panel}`}
            >
              <button
                onClick={() => {
                  setLanguage("en");
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-xs sm:text-sm transition-colors flex items-center justify-between font-sans tracking-wider ${styles.option}`}
              >
                ENGLISH (ENG)
                {language === "en" && (
                  <Check className={`w-3 h-3 ${styles.check}`} />
                )}
              </button>
              <button
                onClick={() => {
                  setLanguage("it");
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-xs sm:text-sm transition-colors flex items-center justify-between font-sans tracking-wider ${styles.option}`}
              >
                ITALIANO (ITA)
                {language === "it" && (
                  <Check className={`w-3 h-3 ${styles.check}`} />
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
