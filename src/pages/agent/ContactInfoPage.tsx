import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useRole } from "../../hooks/useRole";

interface LocationState {
  property?: {
    id: string;
    title: string;
  };
  startDate?: Date | null;
  endDate?: Date | null;
  totalPrice?: number;
  experiences?: Array<{
    id: string;
    title: string;
    price: number;
  }>;
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
  const { property, startDate, endDate, totalPrice, experiences = [] } = state;

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

    if (!formData.checkInTime) {
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
    // Simulate API call
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
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
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

                {/* Contact Phone */}
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
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Contact Email */}
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
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* CHECK-IN TIME SECTION */}
              <div className="space-y-4">
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
                          <div>ACCOUNT NAME: SKYLIFE ITALY</div>
                          <div>IBAN: IT34H0300889898000050708893</div>
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
          <div className="lg:col-span-1">
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

              {/* Experiences */}
              {experiences.length > 0 && (
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <p className="text-xs font-light text-neutral-500 mb-3">
                    ADDED EXPERIENCES ({experiences.length})
                  </p>
                  <div className="space-y-2">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex justify-between items-start"
                      >
                        <span className="text-xs text-neutral-600 flex-1">
                          {exp.title}
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
              {totalPrice && (
                <div className="border-t border-neutral-200 pt-6">
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
      <ConfirmationModal isOpen={showConfirmation} onClose={handleCloseModal} />
    </div>
  );
}
