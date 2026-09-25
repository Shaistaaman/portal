import type React from "react";

interface SearchCapsuleFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
  truncateValue?: boolean;
  disabled?: boolean;
}

/**
 * A single field in the capsule search bar (icon + label + value, click to
 * open its popover). Used for Location / Check-in / Check-out / Guests.
 */
export default function SearchCapsuleField({
  icon,
  label,
  value,
  onClick,
  truncateValue = false,
  disabled = false,
}: SearchCapsuleFieldProps) {
  return (
    <div
      onClick={onClick}
      className={`flex-1 px-4 py-3 md:py-2 flex items-center gap-3.5 hover:bg-neutral-100 rounded-2xl md:rounded-full cursor-pointer transition-colors group select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`p-2.5 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition-colors text-neutral-900 ${disabled ? "group-hover:bg-neutral-100" : ""}`}
      >
        {icon}
      </div>
      <div className="text-left">
        <h4 className="font-sans font-medium text-xs tracking-wider uppercase text-neutral-900">
          {label}
        </h4>
        <p
          className={`font-sans font-light text-xs text-neutral-500 mt-0.5 ${
            truncateValue ? "truncate max-w-[150px]" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
