import { ChevronLeft, ChevronRight, X, Minus, Plus, Grid } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { MOCK_EXPERIENCES } from "@/features/experiences/mockExperiences";
import {
  experienceSlots,
  formatDurationMinutes,
  type Experience,
} from "@/features/experiences/types";

/**
 * Experience detail page for client and agent (portal), modeled on the
 * marketing ExperienceDetailPage layout but in portal style: breadcrumb,
 * title, duration shown with the description, highlights, image collage,
 * and a Request button that opens a slot picker bounded by the experience's
 * bookableFrom–bookableUntil window (respecting durationMinutes) plus a
 * guest counter.
 *
 * On request it hands the configured experience (slot + guests + computed
 * price) to the RequestExperiencePage grid, where it's pre-added to the
 * order summary.
 */
interface DetailLocationState {
  existingSelections?: Array<Record<string, unknown>>;
}

export default function ExperienceDetailPage() {
  const role = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { experienceId } = useParams<{ experienceId: string }>();

  // Selections already in the order (when arriving from the grid's
  // "Add to Booking"); the new one is merged on top.
  const existingSelections =
    (location.state as DetailLocationState | null)?.existingSelections ?? [];

  const experience = useMemo<Experience | undefined>(
    () => MOCK_EXPERIENCES.find((e) => e.id === experienceId),
    [experienceId],
  );

  const slots = useMemo(
    () => (experience ? experienceSlots(experience) : []),
    [experience],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [guests, setGuests] = useState(1);

  // Lightbox gallery state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!experience) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <p className="text-neutral-600">Experience not found.</p>
        </main>
      </div>
    );
  }

  const durationLabel = formatDurationMinutes(experience.durationMinutes);
  const total = experience.pricePerPerson * guests;

  // 4-image collage, padded by repeating the images the experience has.
  const gallery = Array.from(
    { length: 4 },
    (_, i) =>
      experience.images[i] ??
      experience.images[i % Math.max(1, experience.images.length)] ??
      "",
  );

  const handleRequest = () => {
    if (slots.length > 0 && !selectedSlot) return;

    const configured = {
      id: experience.id,
      title: experience.name,
      price: total,
      pricePerPerson: experience.pricePerPerson,
      image: experience.images[0] ?? "",
      category: experience.categories[0] ?? "Experience",
      location: experience.location,
      slot: selectedSlot,
      guests,
    };

    // Merge with any experiences already in the order (replacing this one
    // if it was configured before), so adding a second doesn't drop the
    // first.
    const merged = [
      ...existingSelections.filter((e) => e.id !== configured.id),
      configured,
    ];

    const gridPath = `/${role}/property/${experience.id}/request-experience`;
    navigate(gridPath, {
      state: {
        selectedExperiences: merged,
        isWishlistFlow: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Breadcrumb */}
        <div className="mb-4 text-xs tracking-tight text-neutral-800 sm:text-sm">
          <span>{experience.location}</span>
          <span className="mx-2 text-neutral-400">/</span>
          <span>{experience.categories[0] ?? "Experience"}</span>
        </div>

        {/* Title + Request */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="mb-2 font-serif text-3xl leading-tight font-normal tracking-tight text-neutral-900 italic sm:text-5xl lg:text-6xl">
              {experience.name}
            </h1>
            <p className="text-sm font-medium text-neutral-900">
              €{experience.pricePerPerson}{" "}
              <span className="font-light text-neutral-500">per guest</span>
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full cursor-pointer bg-black px-10 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-neutral-800 sm:w-auto"
            >
              Request
            </button>
          </div>
        </div>

        {/* Two-column: description + collage */}
        <div className="mb-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <p className="max-w-[680px] text-sm leading-relaxed font-light text-neutral-900 sm:text-base">
                {experience.description}
              </p>
              {/* Duration shown with the description (no rating/star). */}
              {durationLabel && (
                <p className="mt-3 text-sm font-medium text-neutral-700">
                  Duration: {durationLabel}
                </p>
              )}
              {experience.season && (
                <p className="mt-1 text-sm font-light text-neutral-500">
                  Available: {experience.season}
                </p>
              )}
            </div>

            {experience.specialRequirements && (
              <div>
                <h2 className="mb-2 font-serif text-2xl font-normal text-neutral-900 italic">
                  Good to know
                </h2>
                <p className="text-sm font-light text-neutral-700">
                  {experience.specialRequirements}
                </p>
              </div>
            )}
          </div>

          {/* Right: collage */}
          <div className="grid grid-cols-1 gap-3 lg:col-span-7">
            <div className="relative aspect-[2.2/1] w-full overflow-hidden bg-neutral-100">
              {gallery[0] && (
                <img
                  src={gallery[0]}
                  alt={experience.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                {[gallery[1], gallery[2]].map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="relative aspect-[1.3/1] w-full overflow-hidden bg-neutral-100"
                  >
                    {img && (
                      <img
                        src={img}
                        alt={`${experience.name} ${idx + 1}`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="relative h-full min-h-[220px] w-full overflow-hidden bg-neutral-100">
                {gallery[3] && (
                  <img
                    src={gallery[3]}
                    alt={`${experience.name} 3`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {/* "See all photos" button overlay */}
                {experience.images.length > 4 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="absolute right-3 bottom-3 flex cursor-pointer items-center gap-2 rounded-xs border border-neutral-200/80 bg-white/95 px-3.5 py-1.5 font-sans text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-md transition-all hover:bg-black hover:text-white"
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>See all photos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Gallery */}
      <AnimatePresence>
        {isLightboxOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-40 bg-black/95 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Main image */}
              <div className="relative w-full h-full max-h-screen max-w-6xl mx-auto flex items-center justify-center p-4">
                <motion.img
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={experience.images[activeImageIndex]}
                  alt={`${experience.name} ${activeImageIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain"
                />

                {/* Navigation arrows */}
                {experience.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === 0 ? experience.images.length - 1 : prev - 1,
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === experience.images.length - 1 ? 0 : prev + 1,
                        );
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Thumbnails strip */}
                {experience.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm overflow-x-auto max-w-[90vw]">
                    {experience.images.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-12 w-16 shrink-0 cursor-pointer overflow-hidden border-2 transition-all rounded ${
                          activeImageIndex === idx
                            ? "scale-105 border-amber-300"
                            : "border-transparent opacity-50 hover:opacity-75"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Image counter */}
                <div className="absolute top-4 left-4 bg-white/10 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {activeImageIndex + 1} of {experience.images.length}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Request modal: slot picker + guest count */}
      {modalOpen && (
        <>
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-lg bg-white p-8 shadow-2xl rounded-lg">
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="mb-1 font-serif text-2xl font-normal text-neutral-900 italic">
                Request This Experience
              </h3>
              <p className="mb-6 text-xs font-light text-neutral-500">
                {experience.name} · {experience.location}
                {durationLabel ? ` · ${durationLabel}` : ""}
              </p>

              {/* Time slot */}
              <div className="mb-5">
                <label className="mb-2 block text-[11px] font-semibold tracking-wider text-neutral-700 uppercase">
                  Choose a time slot
                </label>
                {slots.length === 0 ? (
                  <p className="text-sm font-light text-neutral-500">
                    No bookable window set for this experience.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot.label)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          selectedSlot === slot.label
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[11px] font-light text-neutral-500">
                  Each slot is {durationLabel || "the full duration"} long,
                  within {experience.bookableFrom}–{experience.bookableUntil}.
                </p>
              </div>

              {/* Guests */}
              <div className="mb-6">
                <label className="mb-2 block text-[11px] font-semibold tracking-wider text-neutral-700 uppercase">
                  Guests (max {experience.maxGuests})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    aria-label="Decrease guests"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {guests}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setGuests((g) => Math.min(experience.maxGuests, g + 1))
                    }
                    className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    aria-label="Increase guests"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Total + submit */}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-4 mb-4">
                <span className="text-sm font-semibold text-neutral-900">
                  Total
                </span>
                <span className="text-xl font-bold text-neutral-900">
                  €{total}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRequest}
                disabled={slots.length > 0 && !selectedSlot}
                className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-[0.2em] uppercase py-4 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Request
              </button>
              {slots.length > 0 && !selectedSlot && (
                <p className="mt-2 text-center text-[11px] text-neutral-500">
                  Select a time slot to continue.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
