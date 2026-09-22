import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import NavLinks from "./NavLinks";
import type { Language } from "@/lib/types";

const TRANSLATIONS = {
  en: {
    lang: "Eng",
    bookYourStay: "Book Your Stay",
  },
  it: {
    lang: "Ita",
    bookYourStay: "Prenota il Soggiorno",
  },
};

export default function PublicHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const translation = TRANSLATIONS[language];

  const handleNavigate = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* BACKDROP DETECTOR FOR SIDEBAR/EXPANDED HEADER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      {isSidebarOpen ? (
        /* LIGHT-THEMED EXPANDED NAVIGATION BAR */
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 w-full border-b border-neutral-200 z-50 bg-[#FAF9F6] text-neutral-900"
        >
          <div className="flex items-center justify-between w-full h-20 max-w-[1440px] mx-auto">
            {/* Left: Monogram Logo */}
            <Link
              to="/"
              onClick={() => {
                setIsSidebarOpen(false);
              }}
              className="h-20 px-4 sm:px-6 md:px-8 flex items-center cursor-pointer hover:bg-neutral-100 transition-colors shrink-0"
            >
              <img
                src="/images/logo-black.png"
                alt="Skylife"
                width={80}
                height={28}
                className="object-contain transition-opacity duration-300 hover:opacity-80"
              />
            </Link>

            {/* Center Links (desktop) */}
            <NavLinks variant="desktop" onNavigate={handleNavigate} />

            {/* Right Controls (desktop) */}
            <div className="hidden lg:flex items-center h-full">
              <LanguageSelector
                theme="light"
                language={language}
                setLanguage={setLanguage}
                isOpen={isLanguageOpen}
                setIsOpen={setIsLanguageOpen}
                label={translation.lang}
                buttonId="lang-selector-btn-light"
              />

              <button
                id="book-your-stay-btn-light"
                onClick={() => {
                  setIsSidebarOpen(false);
                }}
                className="h-20 px-5 sm:px-8 border-l border-neutral-200 flex items-center justify-center font-sans font-semibold tracking-widest text-xs sm:text-sm uppercase cursor-pointer hover:bg-neutral-900 hover:text-white transition-all duration-350 select-none text-neutral-900 whitespace-nowrap"
              >
                {translation.bookYourStay}
              </button>
            </div>

            {/* Mobile / Tablet: Close menu button */}
            <div className="lg:hidden flex items-center h-full">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="h-20 px-6 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Mobile/Tablet Expanded Sub-Navigation */}
          <div className="lg:hidden block bg-[#FAF9F6] border-t border-neutral-100 px-6 py-8 space-y-6">
            <NavLinks variant="mobile" onNavigate={handleNavigate} />

            {/* Divider */}
            <div className="h-[1px] bg-neutral-200 w-full my-6" />

            <div className="space-y-5">
              {/* Language Selector (pill style inside drawer) */}
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs tracking-widest uppercase text-neutral-400 font-medium">
                  Language
                </span>
                <div className="flex border border-neutral-200 rounded-none overflow-hidden bg-white">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-4 py-1.5 text-xs font-sans tracking-wider font-semibold transition-all ${
                      language === "en"
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    ENGLISH
                  </button>
                  <button
                    onClick={() => setLanguage("it")}
                    className={`px-4 py-1.5 text-xs font-sans tracking-wider font-semibold transition-all ${
                      language === "it"
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    ITALIANO
                  </button>
                </div>
              </div>

              {/* Book Your Stay */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                }}
                className="w-full py-4 bg-neutral-900 hover:bg-black text-white font-sans font-semibold tracking-widest text-xs sm:text-sm uppercase rounded-none transition-all duration-300 shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{translation.bookYourStay}</span>
              </button>
            </div>
          </div>
        </motion.header>
      ) : (
        /* STANDARD DARK MINIMAL HEADER */
        <header className="fixed top-0 left-0 w-full border-b border-white/10 z-50 bg-black/65 backdrop-blur-md">
          <div className="flex items-center justify-between w-full h-20 max-w-[1440px] mx-auto relative">
            {/* Left: Hamburger Menu Icon */}
            <button
              id="nav-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              className="h-20 px-6 sm:px-8 flex items-center justify-center border-r border-white/10 text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer z-10"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5 stroke-[1.25]" />
            </button>

            {/* Center: Monogram Logo */}
            <Link
              to="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-0"
            >
              <img
                src="/images/logo-beige.png"
                alt="Skylife"
                width={80}
                height={28}
                className="object-contain transition-opacity duration-300 hover:opacity-80"
              />
            </Link>

            {/* Right Controls */}
            <div className="hidden lg:flex items-center h-full z-10">
              <LanguageSelector
                theme="light"
                language={language}
                setLanguage={setLanguage}
                isOpen={isLanguageOpen}
                setIsOpen={setIsLanguageOpen}
                label={translation.lang}
                buttonId="lang-selector-btn"
              />
            </div>
          </div>
        </header>
      )}
    </>
  );
}
