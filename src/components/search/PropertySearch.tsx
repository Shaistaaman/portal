import { Calendar, MapPin, Search, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import CalendarMonthGrid from "./CalendarMonthGrid";
import FieldDivider from "./FieldDivider";
import GuestCounterRow from "./GuestCounterRow";
import SearchCapsuleField from "./SearchCapsuleField";

interface Destination {
  id: string;
  name: string;
  region: string;
  description: string;
  suggestedNights: number;
}

const DESTINATIONS: Destination[] = [
  {
    id: "como",
    name: "Lake Como",
    region: "Italy",
    description: "Breathtaking historic villas and peaceful alpine waters.",
    suggestedNights: 5,
  },
  {
    id: "amalfi",
    name: "Amalfi Coast",
    region: "Italy",
    description: "Dramatic cliffs, colorful vertical towns, and ocean vistas.",
    suggestedNights: 7,
  },
  {
    id: "florence",
    name: "Florence",
    region: "Italy",
    description: "Renaissance art, historic bridges, and riverside elegance.",
    suggestedNights: 4,
  },
  {
    id: "tuscany",
    name: "Tuscany",
    region: "Italy",
    description:
      "Rolling hills, world-class private vineyards, and historic castles.",
    suggestedNights: 6,
  },
  {
    id: "venice",
    name: "Venice",
    region: "Italy",
    description:
      "Historic private palazzos, secret canals, and majestic waterways.",
    suggestedNights: 4,
  },
  {
    id: "rome",
    name: "Rome",
    region: "Italy",
    description:
      "Ancient heritage, exquisite private penthouses, and vibrant culture.",
    suggestedNights: 4,
  },
  {
    id: "sicily",
    name: "Sicily",
    region: "Italy",
    description:
      "Sun-drenched seaside estates, baroque architecture, and Mount Etna.",
    suggestedNights: 7,
  },
  {
    id: "milan",
    name: "Milan",
    region: "Italy",
    description:
      "Design capital with elegant penthouses and iconic fashion district.",
    suggestedNights: 3,
  },
  {
    id: "capri",
    name: "Capri",
    region: "Italy",
    description:
      "Dramatic cliffs, crystal waters, and exclusive island luxury.",
    suggestedNights: 5,
  },
  {
    id: "positano",
    name: "Positano",
    region: "Italy",
    description: "Charming clifftop villas with panoramic Mediterranean views.",
    suggestedNights: 5,
  },
  {
    id: "turin",
    name: "Turin",
    region: "Italy",
    description: "Historic city with elegant palaces and refined architecture.",
    suggestedNights: 4,
  },
  {
    id: "chianti",
    name: "Chianti",
    region: "Tuscany",
    description:
      "World-class vineyards, wine estates, and rolling countryside.",
    suggestedNights: 6,
  },
  {
    id: "portofino",
    name: "Portofino",
    region: "Liguria",
    description:
      "Charming coastal village with colorful villas and private beach access.",
    suggestedNights: 4,
  },
];

interface PropertySearchProps {
  location: string;
  setLocation: (loc: string) => void;
  checkIn: Date | null;
  setCheckIn: (date: Date | null) => void;
  checkOut: Date | null;
  setCheckOut: (date: Date | null) => void;
  guests: Guests;
  setGuests: React.Dispatch<React.SetStateAction<Guests>>;
  onSearch?: () => void;
  disabled?: boolean;
}

export interface Guests {
  adults: number;
  children: number;
  infants: number;
}

const getFormattedDate = (
  date: Date | null,
  placeholder: string = "Add date",
): string => {
  if (!date) return placeholder;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function PropertySearch({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  onSearch,
  disabled = false,
}: PropertySearchProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePopup, setActivePopup] = useState<
    "location" | "guests" | "dates" | null
  >(null);

  const today = useMemo(() => new Date(), []);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePopup(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMonthPrev = () => {
    setMonthOffset((prev) => Math.max(0, prev - 1));
  };

  const handleMonthNext = () => {
    setMonthOffset((prev) => Math.min(10, prev + 1));
  };

  const handleDateClick = (clickedDate: Date) => {
    const midnightToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    if (clickedDate < midnightToday) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clickedDate);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (clickedDate.getTime() >= checkIn.getTime()) {
        setCheckOut(clickedDate);
      } else {
        setCheckIn(clickedDate);
        setCheckOut(null);
      }
    }
  };

  const handleSearch = () => {
    // Build search params
    const params = new URLSearchParams();

    if (location) params.append("location", location);
    if (checkIn) params.append("checkIn", checkIn.toISOString().slice(0, 10));
    if (checkOut)
      params.append("checkOut", checkOut.toISOString().slice(0, 10));
    params.append("adults", guests.adults.toString());
    params.append("children", guests.children.toString());
    params.append("infants", guests.infants.toString());

    // Navigate based on role (agent or client)
    const userRole = user?.role === "agent" ? "agent" : "client";
    const searchPath = `/${userRole}/search`;
    navigate(`${searchPath}?${params.toString()}`);

    // Call external callback if provided
    onSearch?.();
  };

  const getTotalGuestCount = () =>
    guests.adults + guests.children + guests.infants;

  const leftMonthDate = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  );
  const rightMonthDate = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset + 1,
    1,
  );

  return (
    <div className="w-full relative">
      {/* Main Capsule Frame */}
      <div
        className={`w-full bg-white border border-neutral-300 rounded-[2rem] md:rounded-full p-4 md:p-2 md:pl-8 md:pr-2 flex flex-col md:flex-row md:items-center justify-between relative shadow-lg gap-2 md:gap-0 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <SearchCapsuleField
          icon={<MapPin className="w-4 h-4 stroke-[1.5]" />}
          label="Location"
          value={location || "Where going?"}
          onClick={() =>
            !disabled &&
            setActivePopup(activePopup === "location" ? null : "location")
          }
          truncateValue
          disabled={disabled}
        />

        <FieldDivider />

        <SearchCapsuleField
          icon={<Calendar className="w-4 h-4 stroke-[1.5]" />}
          label="Check In"
          value={getFormattedDate(checkIn)}
          onClick={() =>
            !disabled &&
            setActivePopup(activePopup === "dates" ? null : "dates")
          }
          disabled={disabled}
        />

        <FieldDivider />

        <SearchCapsuleField
          icon={<Calendar className="w-4 h-4 stroke-[1.5]" />}
          label="Check Out"
          value={getFormattedDate(checkOut)}
          onClick={() =>
            !disabled &&
            setActivePopup(activePopup === "dates" ? null : "dates")
          }
          disabled={disabled}
        />

        <FieldDivider />

        <SearchCapsuleField
          icon={<UserPlus className="w-4 h-4 stroke-[1.5]" />}
          label="Guests"
          value={
            getTotalGuestCount() > 0
              ? `${guests.adults} Ad, ${guests.children} Ch` +
                (guests.infants > 0 ? `, ${guests.infants} Inf` : "")
              : "Add guests"
          }
          onClick={() =>
            !disabled &&
            setActivePopup(activePopup === "guests" ? null : "guests")
          }
          disabled={disabled}
        />

        {/* Circular Action Search Button */}
        <button
          id="search-action-btn"
          onClick={handleSearch}
          disabled={disabled}
          className={`h-12 w-full md:w-12 rounded-full bg-black border border-white/30 text-white hover:bg-white hover:text-black flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 self-center md:mx-2 mt-2 md:mt-0 group shrink-0 shadow-lg active:scale-95 ${disabled ? "opacity-50 cursor-not-allowed hover:bg-black hover:text-white" : ""}`}
          aria-label="Search"
        >
          <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="md:hidden font-sans font-medium text-xs tracking-widest uppercase">
            Search Properties
          </span>
        </button>
      </div>

      {/* BACKDROP TO DETECT CLICK OUTSIDE */}
      {activePopup && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setActivePopup(null)}
        />
      )}

      {/* POPOVERS CONTAINER */}
      <AnimatePresence>
        {/* A. Location Selection Popover */}
        {activePopup === "location" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 md:left-4 md:right-auto md:w-[480px] top-[105%] bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xl z-50 font-sans"
          >
            <div className="flex items-center justify-between mb-4 border-b border-neutral-200 pb-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                Italian Luxury Destinations
              </span>
              <button
                onClick={() => setActivePopup(null)}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => {
                    setLocation(dest.name);
                    setActivePopup("dates");
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    location.startsWith(dest.name)
                      ? "bg-neutral-100 border border-neutral-300"
                      : "hover:bg-neutral-50 border border-transparent"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-neutral-500 mt-1" />
                  <div className="text-left">
                    <span className="font-serif italic text-neutral-900 text-sm font-medium">
                      {dest.name}
                    </span>
                    <p className="text-xs text-neutral-600 font-light mt-0.5">
                      {dest.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Or type custom destination..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-neutral-400 font-sans"
              />
            </div>
          </motion.div>
        )}

        {/* B. Date Range Picker Popover */}
        {activePopup === "dates" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 md:-left-10 lg:left-8 md:w-[660px] top-[105%] bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-2xl z-50 font-sans"
          >
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-200">
              <span className="text-xs uppercase tracking-widest text-neutral-600 font-medium">
                Select Dates
              </span>
              <button
                onClick={() => setActivePopup(null)}
                className="text-neutral-500 hover:text-neutral-900 p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TWO MONTHS CALENDAR GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CalendarMonthGrid
                year={leftMonthDate.getFullYear()}
                month={leftMonthDate.getMonth()}
                today={today}
                checkIn={checkIn}
                checkOut={checkOut}
                onDateClick={handleDateClick}
                showPrev
                onPrev={handleMonthPrev}
                prevDisabled={monthOffset === 0}
              />
              <CalendarMonthGrid
                year={rightMonthDate.getFullYear()}
                month={rightMonthDate.getMonth()}
                today={today}
                checkIn={checkIn}
                checkOut={checkOut}
                onDateClick={handleDateClick}
                showNext
                onNext={handleMonthNext}
                nextDisabled={monthOffset >= 10}
              />
            </div>

            {/* FOOTER BAR */}
            <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-neutral-600 font-light text-center sm:text-left">
                {checkIn && checkOut ? (
                  <span>
                    Selected:{" "}
                    <strong className="text-neutral-900 font-semibold">
                      {getFormattedDate(checkIn)} – {getFormattedDate(checkOut)}
                    </strong>
                  </span>
                ) : checkIn ? (
                  <span>Select check-out date</span>
                ) : (
                  <span>Select check-in &amp; check-out dates</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {(checkIn || checkOut) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckIn(null);
                      setCheckOut(null);
                    }}
                    className="text-neutral-600 hover:text-neutral-900 underline text-xs font-medium cursor-pointer"
                  >
                    Clear dates
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActivePopup(null)}
                  className="bg-black text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* C. Guest Counter Popover */}
        {activePopup === "guests" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 left-0 md:left-auto md:right-4 md:w-[320px] top-[105%] bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xl z-50 font-sans"
          >
            <div className="flex items-center justify-between mb-4 border-b border-neutral-200 pb-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                Select Guests
              </span>
              <button
                onClick={() => setActivePopup(null)}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <GuestCounterRow
                label="Adults"
                sublabel="Age 13 or above"
                value={guests.adults}
                onDecrement={() =>
                  setGuests((prev) => ({
                    ...prev,
                    adults: Math.max(1, prev.adults - 1),
                  }))
                }
                onIncrement={() =>
                  setGuests((prev) => ({ ...prev, adults: prev.adults + 1 }))
                }
              />
              <GuestCounterRow
                label="Children"
                sublabel="Ages 2 – 12"
                value={guests.children}
                onDecrement={() =>
                  setGuests((prev) => ({
                    ...prev,
                    children: Math.max(0, prev.children - 1),
                  }))
                }
                onIncrement={() =>
                  setGuests((prev) => ({
                    ...prev,
                    children: prev.children + 1,
                  }))
                }
              />
              <GuestCounterRow
                label="Infants"
                sublabel="Under 2"
                value={guests.infants}
                onDecrement={() =>
                  setGuests((prev) => ({
                    ...prev,
                    infants: Math.max(0, prev.infants - 1),
                  }))
                }
                onIncrement={() =>
                  setGuests((prev) => ({ ...prev, infants: prev.infants + 1 }))
                }
              />
            </div>

            <button
              onClick={() => setActivePopup(null)}
              className="w-full mt-6 bg-black hover:bg-neutral-900 text-white py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Apply Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
