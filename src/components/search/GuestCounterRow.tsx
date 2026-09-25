import { Minus, Plus } from "lucide-react";

interface GuestCounterRowProps {
  label: string;
  sublabel: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

/**
 * A single "label + sublabel + minus/count/plus" row used in the guest
 * picker popover (Adults / Children / Infants).
 */
export default function GuestCounterRow({
  label,
  sublabel,
  value,
  onDecrement,
  onIncrement,
}: GuestCounterRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <h5 className="text-sm font-semibold text-neutral-900">{label}</h5>
        <p className="text-[10px] text-neutral-500">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 text-neutral-900 active:bg-neutral-200"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-sm font-medium w-4 text-center text-neutral-900">
          {value}
        </span>
        <button
          onClick={onIncrement}
          className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 text-neutral-900 active:bg-neutral-200"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
