import { useSearchParams } from "react-router-dom";
import SearchResults from "@/features/search/SearchResults";

/**
 * Role-based search results page (agent/owner).
 * Mirrors RoleCalendarPage pattern: wraps SearchResults component
 * and passes search criteria from URL params.
 *
 * URL params:
 * - location: selected location (e.g., "Florence, Tuscany")
 * - checkIn: check-in date (ISO string, e.g., "2024-09-20")
 * - checkOut: check-out date (ISO string)
 * - adults: number of adults
 * - children: number of children
 * - infants: number of infants
 */
export default function RoleSearchResultsPage() {
  const [searchParams] = useSearchParams();

  const location = searchParams.get("location") || "";
  const checkInStr = searchParams.get("checkIn") || "";
  const checkOutStr = searchParams.get("checkOut") || "";
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);

  // Parse dates from ISO strings
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const guests = { adults, children, infants };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <SearchResults
        location={location}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </div>
  );
}
