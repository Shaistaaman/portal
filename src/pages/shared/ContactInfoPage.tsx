import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
}

export default function ContactInfoPage() {
  const role = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const { property, startDate, endDate, totalPrice } = state;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirm = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Please fill in all fields");
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="mb-2 font-serif text-4xl font-normal text-neutral-900 italic">
                Contact Information
              </h1>
              <p className="text-sm font-light text-neutral-500 italic">
                Complete your reservation request
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
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

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border border-neutral-200 bg-white p-8 shadow-sm rounded-lg">
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
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseModal}
      />
    </div>
  );
}
