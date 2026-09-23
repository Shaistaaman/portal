import Calendar, { type CalendarRole } from "@/features/calendar/Calendar";

/**
 * Standalone calendar page for roles without a dashboard layout yet
 * (owner, agent). Admin renders <Calendar/> directly inside AdminLayout's
 * padded <main>; this wrapper supplies equivalent page chrome.
 */
export default function RoleCalendarPage({ role }: { role: CalendarRole }) {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <Calendar role={role} />
    </div>
  );
}
