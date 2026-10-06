import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useRole } from "../../hooks/useRole";
import { nextBookingNumberForMonth } from "@/types/calendar";
import { MOCK_BOOKINGS } from "@/features/calendar/mockBookings";

interface LocationState {
  property?: {
    id: string;
    title: string;
    /** Payout account shown on the payment panel; falls back if unset. */
    accountName?: string;
    bankAccount?: string;
  };
  startDate?: Date | null;
  endDate?: Date | null;
  /** Itemized reservation breakdown (property-only booking flow). */
  nightlyRate?: number;
  numberOfNights?: number;
  totalNightly?: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  totalPrice?: number;
  /** Experience lines (experience checkout flow). */
  experiences?: Array<{
    id: string;
    title: string;
    price: number;
    slot?: string;
    guests?: number;
  }>;
  /** True when checking out experiences with no property booking. */
  experienceOnly?: boolean;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  checkInTime: string;
  otherRequests: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  checkInTime?: string;
}

export default function ContactInfoPage() {
  const role = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const {
    property,
    startDate,
    endDate,
    nightlyRate,
    numberOfNights,
    totalNightly,
    cleaningFee,
    serviceFee,
    taxes,
    totalPrice,
    experiences = [],
    experienceOnly = false,
  } = state;

  // Booking Number is generated on confirm and shown in the success modal.
  // In production the server assigns this at creation (BK-YYYY-MM-NNN).
  const [bookingNumber, setBookingNumber] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    checkInTime: "14:00",
    otherRequests: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for floating effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Validate phone number (numbers only)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d+$/.test(phone);
    return phoneRegex && phone.length > 0;
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return emailRegex;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Contact name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (numbers only)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!experienceOnly && !formData.checkInTime) {
      newErrors.checkInTime = "Check-in time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    // Booking Number for the current month: BK-<thisYear>-<thisMonth>-<NNN>,
    // where NNN is the next count after existing bookings in this month.
    // TODO(AWS integration): POST the property booking to admin-fn; the
    // server assigns this number by counting the current month's rows and
    // returning the next value, then we use the server-returned number here.
    setBookingNumber(nextBookingNumberForMonth(MOCK_BOOKINGS));
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmation(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
    // Navigate back to dashboard after confirmation
    const dashboardPath =
      role === "agent" ? "/agent/dashboard" : "/client/dashboard";
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header - Outside Grid */}
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-normal text-neutral-900 italic">
            Contact Information
          </h1>
          <p className="text-sm font-light text-neutral-500 italic">
            Complete your reservation request
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left Column - Form */}
          <div className="lg:col-span-3">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* CONTACT DETAILS SECTION */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Your Details
                </h2>

                {/* Contact Name */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-neutral-700 mb-2">
                    CONTACT NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:border-transparent transition-all ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-neutral-300 focus:ring-neutral-900"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Contact Phone + Email in one row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wide text-neutral-700 mb-2">
                      CONTACT PHONE
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className={`w-full px-4 py-3 border rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:border-transparent transition-all ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-neutral-300 focus:ring-neutral-900"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-wide text-neutral-700 mb-2">
                      CONTACT EMAIL
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-3 border rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:border-transparent transition-all ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-neutral-300 focus:ring-neutral-900"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CHECK-IN TIME SECTION — property stays only, not experiences */}
              <div className="space-y-4">
                {!experienceOnly && (
                  <>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Check In Time
                    </h2>
                    <div>
                      <input
                        type="time"
                        name="checkInTime"
                        value={formData.checkInTime}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg font-light text-neutral-900 focus:outline-none focus:ring-1 focus:border-transparent transition-all ${
                          errors.checkInTime
                            ? "border-red-500 focus:ring-red-500"
                            : "border-neutral-300 focus:ring-neutral-900"
                        }`}
                      />
                      {errors.checkInTime && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.checkInTime}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Other Requests */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-neutral-700 mb-2">
                    OTHER REQUESTS
                  </label>
                  <textarea
                    name="otherRequests"
                    value={formData.otherRequests}
                    onChange={handleInputChange}
                    placeholder="Type additional information here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* PAYMENT INFO SECTION */}
              <div className="space-y-4 bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Payment Info
                </h2>

                {totalPrice && (
                  <>
                    <p className="text-sm text-neutral-600">
                      A payment of{" "}
                      <span className="font-semibold">€{totalPrice}</span> is
                      required
                    </p>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                          Bank Transfer
                        </h3>
                        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                          Payment via bank transfer. Your reservation will be
                          confirmed once the completion of the payment. To
                          complete your reservation please make a bank transfer
                          for 50% of the total amount using the following
                          details:
                        </p>

                        <div className="bg-neutral-100 p-3 rounded text-xs font-mono text-neutral-800 mb-4 space-y-1">
                          <div>
                            ACCOUNT NAME:{" "}
                            {property?.accountName || "SKYLIFE ITALY"}
                          </div>
                          <div>
                            IBAN:{" "}
                            {property?.bankAccount ||
                              "IT34H0300889898000050708893"}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                          Once the payment has been received, please send the
                          proof of payment to{" "}
                          <span className="font-semibold">
                            hello@skylifemanagement.com
                          </span>
                          , including your full name
                        </p>

                        <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                          This reservation will be considered confirmed only
                          upon receipt of both the payment and the corresponding
                          receipt within 48 hours of the request.
                        </p>

                        <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                          Please note that the price does not include the
                          deposit tax of €13 per person per night (10 to
                          example). All must be paid in cash upon arrival.
                        </p>

                        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                          We look forward to welcoming you soon!
                        </p>

                        <p className="text-xs text-neutral-600 font-semibold">
                          Best regards,
                          <br />
                          The Skylife Management Team
                        </p>

                        <p className="text-xs text-neutral-500 mt-4 pt-4 border-t border-neutral-200">
                          Your reservation will be held for 2 days starting from
                          today. If your payment is not received before this
                          time, your reservation will be cancelled.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Confirm Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 hover:bg-black text-white text-sm font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Floating Summary */}
          <div className="lg:col-span-2">
            <div
              style={{
                transform: `translateY(${scrollY}px)`,
                transition: "transform 0.1s ease-out",
              }}
              className="border border-neutral-200 bg-white p-8 shadow-sm rounded-lg"
            >
              <h3 className="border-b border-neutral-200 pb-4 font-serif text-2xl font-normal text-neutral-900 italic mb-6">
                Reservation Summary
              </h3>

              {/* Property Name */}
              {property && (
                <div className="mb-6">
                  <p className="text-xs font-light text-neutral-500 mb-1">
                    Property
                  </p>
                  <p className="text-sm font-medium text-neutral-900">
                    {property.title}
                  </p>
                </div>
              )}

              {/* Dates */}
              {(startDate || endDate) && (
                <div className="mb-6">
                  <p className="text-xs font-light text-neutral-500 mb-1">
                    Check-in to Check-out
                  </p>
                  <p className="text-sm font-medium text-neutral-900">
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                      : "Dates to be confirmed"}
                  </p>
                </div>
              )}

              {/* Itemized fee breakdown */}
              {totalNightly != null && (
                <div className="mb-6 pb-6 border-b border-neutral-200 space-y-3 text-sm text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span>
                      €{nightlyRate} x {numberOfNights}{" "}
                      {numberOfNights === 1 ? "night" : "nights"}
                    </span>
                    <span className="font-medium text-neutral-900">
                      €{totalNightly}
                    </span>
                  </div>
                  {cleaningFee != null && (
                    <div className="flex items-center justify-between">
                      <span>Cleaning Fee</span>
                      <span className="font-medium text-neutral-900">
                        €{cleaningFee}
                      </span>
                    </div>
                  )}
                  {serviceFee != null && (
                    <div className="flex items-center justify-between">
                      <span>Service Fee</span>
                      <span className="font-medium text-neutral-900">
                        €{serviceFee}
                      </span>
                    </div>
                  )}
                  {taxes != null && (
                    <div className="flex items-center justify-between">
                      <span>Taxes</span>
                      <span className="font-medium text-neutral-900">
                        €{taxes}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Experiences */}
              {experiences.length > 0 && (
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <p className="text-xs font-light text-neutral-500 mb-3">
                    {experienceOnly ? "EXPERIENCES" : "ADDED EXPERIENCES"} (
                    {experiences.length})
                  </p>
                  <div className="space-y-2">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex justify-between items-start gap-2"
                      >
                        <span className="text-xs text-neutral-600 flex-1">
                          {exp.title}
                          {(exp.slot || exp.guests) && (
                            <span className="block text-[11px] text-neutral-400">
                              {exp.slot}
                              {exp.slot && exp.guests ? " · " : ""}
                              {exp.guests
                                ? `${exp.guests} guest${exp.guests === 1 ? "" : "s"}`
                                : ""}
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-medium text-neutral-900">
                          €{exp.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              {totalPrice != null && (
                <div className="pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-neutral-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-neutral-900">
                      €{totalPrice}
                    </span>
                  </div>
                  <p className="text-[11px] font-light text-neutral-500 italic mt-3">
                    Final amount to be confirmed by concierge
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseModal}
        bookingNumber={bookingNumber}
      />
    </div>
  );
}
