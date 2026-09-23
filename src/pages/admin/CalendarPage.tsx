import { useSearchParams } from "react-router-dom";
import Calendar from "@/features/calendar/Calendar";

export default function AdminCalendarPage() {
  const [searchParams] = useSearchParams();
  const propertyFilter = searchParams.get("property") || "";

  return <Calendar role="admin" initialPropertyFilter={propertyFilter} />;
}
