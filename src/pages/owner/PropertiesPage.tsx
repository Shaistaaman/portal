import { useState, useMemo } from "react";
import PropertyList from "@/features/properties/PropertyList";
import PropertyReviewQueue from "@/components/PropertyReviewQueue";
import { PROPERTIES } from "@/features/properties/properties";

export default function OwnerPropertiesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "review-queue">("all");

  // Count pending revisions for this owner (AWS TODO: from API)
  const pendingCount = useMemo(() => {
    return PROPERTIES.filter(
      (p) =>
        p.ownerId === "2" && // DEMO_OWNER_ID
        p.status === "in_review",
    ).length;
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-950">
          My Properties
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="px-8 pt-6 border-b border-neutral-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "all"
                ? "text-neutral-900 border-neutral-900"
                : "text-neutral-500 border-transparent hover:text-neutral-700"
            }`}
          >
            My Properties
          </button>

          <button
            onClick={() => setActiveTab("review-queue")}
            className={`pb-3 font-medium text-sm border-b-2 transition-colors relative ${
              activeTab === "review-queue"
                ? "text-neutral-900 border-neutral-900"
                : "text-neutral-500 border-transparent hover:text-neutral-700"
            }`}
          >
            Review Queue
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-3 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {activeTab === "all" && <PropertyList role="owner" />}
        {activeTab === "review-queue" && <PropertyReviewQueue role="owner" />}
      </div>
    </div>
  );
}
