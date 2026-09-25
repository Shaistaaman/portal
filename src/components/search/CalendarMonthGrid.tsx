import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarMonthGridProps {
  year: number;
  month: number; // 0-indexed
  today: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  onDateClick: (date: Date) => void;
  /** Show the "prev" arrow (only the left-most month in a multi-month view) */
  showPrev?: boolean;
  /** Show the "next" arrow (only the right-most month in a multi-month view) */
  showNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

/**
 * Renders a single month's calendar grid with range selection styling.
 */
export default function CalendarMonthGrid({
  year,
  month,
  today,
  checkIn,
  checkOut,
  onDateClick,
  showPrev = false,
  showNext = false,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
}: CalendarMonthGridProps) {
  const mDate = new Date(year, month, 1);
  const monthName = mDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const midnightToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const isSameDay = (d1: Date | null, d2: Date): boolean => {
    if (!d1) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBetweenDays = (
    date: Date,
    start: Date | null,
    end: Date | null,
  ): boolean => {
    if (!start || !end) return false;
    return date > start && date < end;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        {showPrev ? (
          <button
            type="button"
            onClick={onPrev}
            disabled={prevDisabled}
            className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors cursor-pointer disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}

        <span className="font-semibold text-xs sm:text-sm text-neutral-900 tracking-widest uppercase">
          {monthName}
        </span>

        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors cursor-pointer disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center text-xs">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`blank-${idx}`} className="h-9" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
          const dayDate = new Date(year, month, dayNum);
          const isBeforeToday = dayDate < midnightToday;

          const isStart = isSameDay(checkIn, dayDate);
          const isEnd = isSameDay(checkOut, dayDate);
          const inRange = isBetweenDays(dayDate, checkIn, checkOut);

          let cellStyle =
            "text-neutral-700 hover:bg-neutral-200 rounded-full font-medium";
          let wrapperStyle = "";

          if (isBeforeToday) {
            cellStyle =
              "text-neutral-300 cursor-not-allowed pointer-events-none";
          } else if (isStart && isEnd) {
            cellStyle =
              "bg-black text-white font-bold rounded-full shadow-md z-10 relative";
          } else if (isStart) {
            cellStyle =
              "bg-black text-white font-bold rounded-full shadow-md z-10 relative";
            wrapperStyle = checkOut ? "bg-neutral-200 rounded-l-full" : "";
          } else if (isEnd) {
            cellStyle =
              "bg-black text-white font-bold rounded-full shadow-md z-10 relative";
            wrapperStyle = "bg-neutral-200 rounded-r-full";
          } else if (inRange) {
            cellStyle = "text-neutral-700 font-semibold";
            wrapperStyle = "bg-neutral-200";
          }

          return (
            <div
              key={dayNum}
              className={`h-9 flex items-center justify-center ${wrapperStyle}`}
            >
              <button
                type="button"
                onClick={() => !isBeforeToday && onDateClick(dayDate)}
                disabled={isBeforeToday}
                className={`w-8 h-8 flex items-center justify-center text-xs transition-all cursor-pointer ${cellStyle}`}
              >
                {dayNum}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
