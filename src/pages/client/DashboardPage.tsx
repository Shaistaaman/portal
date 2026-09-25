import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PropertySearch, {
  type Guests,
} from "@/components/search/PropertySearch";

export default function ClientDashboardPage() {
  const navigate = useNavigate();

  // Search component state
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<Guests>({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // Profile is always complete for clients
  const profileComplete = true;

  return (
    <div>
      {/* Property Search Component */}
      <div className="mb-12">
        <PropertySearch
          location={location}
          setLocation={setLocation}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          guests={guests}
          setGuests={setGuests}
          disabled={!profileComplete}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-neutral-300 bg-white p-6 rounded-lg flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow">
          <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3">
            Active Bookings
          </span>
          <span className="text-4xl lg:text-[42px] font-light leading-none tracking-tight text-neutral-900">
            0
          </span>
        </div>

        <div className="border border-neutral-300 bg-white p-6 rounded-lg flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow">
          <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3">
            Wishlisted
          </span>
          <span className="text-4xl lg:text-[42px] font-light leading-none tracking-tight text-neutral-900">
            0
          </span>
        </div>

        <div className="border border-neutral-300 bg-white p-6 rounded-lg flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow">
          <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3">
            Total Spent
          </span>
          <span className="text-4xl lg:text-[42px] font-light leading-none tracking-tight text-neutral-900">
            €0
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate("/client/bookings")}
          className="border border-neutral-300 bg-white p-8 rounded-lg hover:shadow-md transition-all cursor-pointer text-left"
        >
          <h3 className="text-lg font-semibold text-neutral-950 mb-2">
            My Bookings
          </h3>
          <p className="text-sm text-neutral-600">
            View and manage your reservations
          </p>
        </button>

        <button
          onClick={() => navigate("/client/wishlist")}
          className="border border-neutral-300 bg-white p-8 rounded-lg hover:shadow-md transition-all cursor-pointer text-left"
        >
          <h3 className="text-lg font-semibold text-neutral-950 mb-2">
            My Wishlist
          </h3>
          <p className="text-sm text-neutral-600">
            View your saved properties and experiences
          </p>
        </button>
      </div>
    </div>
  );
}
