import { useSearchParams } from "react-router-dom";
import Calendar, { type CalendarRole } from "@/features/calendar/Calendar";

/**
 * Standalone calendar page for roles without a dashboard layout yet
 * (owner, agent). Admin renders <Calendar/> directly inside AdminLayout's
 * padded <main>; this wrapper supplies equivalent page chrome.
 *
 * Supports ?property=<id> query param to filter calendar to a single property
 * (e.g., when navigating from PropertyList's "Property Calendar" action).
 */
export default function RoleCalendarPage({ role }: { role: CalendarRole }) {
  const [searchParams] = useSearchParams();
  const propertyFilter = searchParams.get("property") || "";

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <Calendar role={role} initialPropertyFilter={propertyFilter} />
    </div>
  );
}
