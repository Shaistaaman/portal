import PropertyList from "@/features/properties/PropertyList";

/**
 * Agent gets view-only access to active properties (for booking purposes)
 * — see Project_Specification.md §3/§4. PropertyList's "agent" mode
 * renders no add button and no action menu.
 */
export default function AgentPropertiesPage() {
  return <PropertyList role="agent" />;
}
