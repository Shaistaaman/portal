import { useNavigate } from "react-router-dom";

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
    </div>
  );
}
