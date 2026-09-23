import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { MOCK_PROPERTIES } from "@/features/properties/mockProperties";
import { MOCK_BOOKINGS } from "@/features/calendar/mockBookings";

interface KpiCard {
  id: string;
  label: string;
  value: string;
}

/**
 * Dummy KPI data, ported from apps/portal/app/admin/dashboard/page.tsx.
 * Replace with a real summary endpoint once admin-fn exists (see
 * Context_Instruction.md §3/§8).
 */
const KPI_CARDS: KpiCard[] = [
  { id: "properties", label: "PROPERTIES", value: "12" },
  { id: "experiences", label: "EXPERIENCES", value: "110" },
  { id: "packages", label: "PACKAGES", value: "07" },
  { id: "users", label: "USERS", value: "1,284" },
  { id: "owners", label: "OWNERS", value: "36" },
  { id: "agents", label: "AGENTS", value: "48" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  // Portfolio Health metrics
  const portfolioMetrics = useMemo(() => {
    const active = MOCK_PROPERTIES.filter((p) => p.status === "active").length;
    const inReview = MOCK_PROPERTIES.filter(
      (p) => p.status === "in_review",
    ).length;
    const inactive = MOCK_PROPERTIES.filter(
      (p) => p.status === "in_inactive",
    ).length;
    const rejected = MOCK_PROPERTIES.filter(
      (p) => p.status === "rejected",
    ).length;
    return { active, inReview, inactive, rejected };
  }, []);

  // Booking Health metrics
  const bookingMetrics = useMemo(() => {
    const thisMonth = MOCK_BOOKINGS.filter((b) => {
      const bookingDate = new Date(b.checkIn);
      const now = new Date();
      return (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const completed = MOCK_BOOKINGS.filter(
      (b) => b.status === "completed",
    ).length;
    const completionRate =
      MOCK_BOOKINGS.length > 0
        ? Math.round((completed / MOCK_BOOKINGS.length) * 100)
        : 0;

    const noShow = MOCK_BOOKINGS.filter((b) => b.status === "no_show").length;
    const noShowRate =
      MOCK_BOOKINGS.length > 0
        ? Math.round((noShow / MOCK_BOOKINGS.length) * 100)
        : 0;

    return { thisMonth, completionRate, noShowRate };
  }, []);

  return (
    <div>
      <div className="flex justify-end gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/properties/add-property")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Property
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/experiences/add-experience")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Experience
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/packages/add-package")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add Package
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/user-management/add-user")}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-lg transition-colors cursor-pointer"
        >
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-5">
        {KPI_CARDS.map((card) => (
          <div
            key={card.id}
            className="border border-neutral-300 bg-white p-6 rounded-lg flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow"
          >
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3">
              {card.label}
            </span>
            <span className="text-4xl lg:text-[42px] font-light text-neutral-900 leading-none tracking-tight">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Portfolio Health */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          Portfolio Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Active
            </span>
            <span className="text-3xl font-light text-green-600 leading-none tracking-tight">
              {portfolioMetrics.active}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              In Review
            </span>
            <span className="text-3xl font-light text-blue-600 leading-none tracking-tight">
              {portfolioMetrics.inReview}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Inactive
            </span>
            <span className="text-3xl font-light text-orange-600 leading-none tracking-tight">
              {portfolioMetrics.inactive}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Rejected
            </span>
            <span className="text-3xl font-light text-red-600 leading-none tracking-tight">
              {portfolioMetrics.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Health */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          Booking Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Bookings This Month
            </span>
            <span className="text-3xl font-light text-neutral-900 leading-none tracking-tight">
              {bookingMetrics.thisMonth}
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              Completion Rate
            </span>
            <span className="text-3xl font-light text-green-600 leading-none tracking-tight">
              {bookingMetrics.completionRate}%
            </span>
          </div>
          <div className="border border-neutral-300 bg-white p-6 rounded-lg">
            <span className="text-[11px] font-normal tracking-[0.18em] text-neutral-600 uppercase mb-3 block">
              No-Show Rate
            </span>
            <span className="text-3xl font-light text-red-600 leading-none tracking-tight">
              {bookingMetrics.noShowRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
