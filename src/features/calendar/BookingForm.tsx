import { useMemo, useState, type FormEvent } from "react";
import {
  MOCK_PROPERTIES,
  nightlyRateFor,
} from "@/features/properties/mockProperties";
import { MOCK_BOOKINGS } from "./mockBookings";
import {
  BOOKING_TYPE_LABELS,
  DEFAULT_ORG_FEES,
  computePrice,
  emptyBookingFormValues,
  nightsBetween,
  BOOKING_TYPES_BY_ROLE,
  type BookingFormValues,
} from "./types";
import type { UserRole } from "@/types/auth";

/** Demo-only owner scoping — same approach as PropertyList / Calendar. */
const DEMO_OWNER_ID = "2";

export type { BookingFormValues };

export interface BookingFormProps {
  role: UserRole;
  initialValues?: Partial<BookingFormValues>;
  submitLabel: string;
  /** Booking id being edited, so its own dates are excluded from overlap check. */
  currentBookingId?: string;
  onSubmit: (values: BookingFormValues) => void;
  onCancel: () => void;
}

/**
 * Shared add/edit booking form. Booking type is filtered per role (admin
 * self/guest/maintenance; owner self/maintenance; agent self/guest). Contact
 * fields + adults/children are recorded for every booking type/role (per
 * §4.5). Price = base price × nights + org fees. Overlap warns-but-allows.
 */
export default function BookingForm({
  role,
  initialValues,
  submitLabel,
  currentBookingId,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const availableTypes = BOOKING_TYPES_BY_ROLE[role];

  // Only `active` properties are bookable (in_review / rejected /
  // in_inactive are never offered).
  const properties = useMemo(() => {
    const bookable = MOCK_PROPERTIES.filter((p) => p.status === "active");
    if (role === "owner") {
      return bookable.filter((p) => p.ownerId === DEMO_OWNER_ID);
    }
    return bookable;
  }, [role]);

  const [values, setValues] = useState<BookingFormValues>({
    ...emptyBookingFormValues(role),
    ...initialValues,
  });
  const [errors, setErrors] = useState<string[]>([]);

  const update = <K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const selectedProperty = properties.find((p) => p.id === values.propertyId);
  const nightlyRate = nightlyRateFor(values.propertyId);

  const nights = nightsBetween(values.checkIn, values.checkOut);
  const price = computePrice(nightlyRate, nights, DEFAULT_ORG_FEES);

  // Overlap: any existing booking on the same property whose range
  // intersects [checkIn, checkOut). Warn but allow.
  const overlaps = useMemo(() => {
    if (!values.propertyId || !values.checkIn || !values.checkOut) return [];
    return MOCK_BOOKINGS.filter(
      (b) =>
        b.id !== currentBookingId &&
        b.propertyId === values.propertyId &&
        b.checkIn < values.checkOut &&
        b.checkOut > values.checkIn,
    );
  }, [values.propertyId, values.checkIn, values.checkOut, currentBookingId]);

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!values.propertyId) problems.push("Select a property.");
    if (!values.checkIn) problems.push("Select a check-in date.");
    if (!values.checkOut) problems.push("Select a check-out date.");
    if (values.checkIn && values.checkOut && nights <= 0) {
      problems.push("Check-out must be after check-in.");
    }
    if (!values.guestName.trim()) problems.push("Contact name is required.");
    if (!values.guestPhone.trim()) problems.push("Contact phone is required.");
    if (!values.guestEmail.trim()) {
      problems.push("Contact email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.guestEmail)) {
      problems.push("Enter a valid contact email.");
    }
    return problems;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (problems.length > 0) return;
    onSubmit(values);
  };

  const showGuestCounts = values.bookingType !== "maintenance";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-1">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <Field label="Property">
        <select
          value={values.propertyId}
          onChange={(e) => update("propertyId", e.target.value)}
          className={inputClass}
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Booking Type">
        <div className="flex gap-2">
          {availableTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("bookingType", type)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                values.bookingType === type
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {BOOKING_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Check-in">
          <input
            type="date"
            value={values.checkIn}
            onChange={(e) => update("checkIn", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Check-out">
          <input
            type="date"
            value={values.checkOut}
            onChange={(e) => update("checkOut", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {overlaps.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Heads up: this property already has {overlaps.length} booking
          {overlaps.length > 1 ? "s" : ""} overlapping these dates. You can
          still proceed.
        </div>
      )}

      {/* Contact details — recorded for every booking type/role */}
      <div className="space-y-4">
        <Field label="Contact Name">
          <input
            type="text"
            value={values.guestName}
            onChange={(e) => update("guestName", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Phone">
            <input
              type="tel"
              value={values.guestPhone}
              onChange={(e) => update("guestPhone", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact Email">
            <input
              type="email"
              value={values.guestEmail}
              onChange={(e) => update("guestEmail", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {showGuestCounts && (
        <div className="grid grid-cols-2 gap-4">
          <Stepper
            label="Adults"
            value={values.adults}
            min={1}
            onChange={(v) => update("adults", v)}
          />
          <Stepper
            label="Children"
            value={values.children}
            min={0}
            onChange={(v) => update("children", v)}
          />
        </div>
      )}

      {values.bookingType === "maintenance" && (
        <Field label="Maintenance Note">
          <textarea
            value={values.maintenanceNote}
            onChange={(e) => update("maintenanceNote", e.target.value)}
            rows={3}
            placeholder="Reason for blocking these dates..."
            className={inputClass}
          />
        </Field>
      )}

      {/* Price breakdown */}
      {selectedProperty && nights > 0 && (
        <div className="border border-neutral-200 rounded-lg p-4 text-sm">
          <div className="flex justify-between py-1 text-neutral-600">
            <span>
              ${nightlyRate.toLocaleString()} × {nights} night
              {nights > 1 ? "s" : ""}
            </span>
            <span>${price.roomTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 text-neutral-600">
            <span>Cleaning fee</span>
            <span>${price.cleaningFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 text-neutral-600">
            <span>Service fee</span>
            <span>${price.serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 text-neutral-600">
            <span>Taxes</span>
            <span>${price.taxes.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 mt-2 border-t border-neutral-200 font-semibold text-neutral-950">
            <span>Total</span>
            <span>${price.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </Field>
  );
}
