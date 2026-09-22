type NavAction = "STAY" | "EXPERIENCE" | "OWN" | "PACKAGES";

interface NavLink {
  label: string;
  action: NavAction;
}

const NAV_LINKS: NavLink[] = [
  { label: "The Collection", action: "STAY" },
  { label: "Skylife Experiences", action: "EXPERIENCE" },
  { label: "Property Owners", action: "OWN" },
  { label: "Packages", action: "PACKAGES" },
];

/**
 * These live on the marketing site, not in the portal SPA, so they are
 * external links here rather than in-app routes.
 * TODO: point at the deployed marketing domain once known (currently
 * assumes marketing is served from the site root).
 */
const NAV_ROUTES: Record<NavAction, string> = {
  STAY: "/Collections",
  EXPERIENCE: "/Experiences",
  OWN: "/Owner",
  PACKAGES: "/Packages",
};

interface NavLinksProps {
  variant: "desktop" | "mobile";
  onNavigate: (action: NavAction) => void;
}

/**
 * The Collection / Experiences / Property Owners / Packages nav links,
 * shared between the desktop nav and the mobile drawer (only Tailwind
 * sizing/layout classes differ, controlled by `variant`).
 */
export default function NavLinks({ variant, onNavigate }: NavLinksProps) {
  const handleClick = (action: NavAction) => {
    onNavigate(action);
    window.location.assign(NAV_ROUTES[action]);
  };

  if (variant === "desktop") {
    return (
      <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
        {NAV_LINKS.map((link) => (
          <button
            key={link.action}
            onClick={() => handleClick(link.action)}
            className="font-sans font-light text-[13px] text-neutral-800 hover:text-black hover:font-medium tracking-[0.08em] uppercase cursor-pointer transition-all"
          >
            {link.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <div className="space-y-5">
      {NAV_LINKS.map((link) => (
        <button
          key={link.action}
          onClick={() => handleClick(link.action)}
          className="block w-full text-left font-sans font-light text-[15px] text-neutral-800 hover:text-black hover:font-medium tracking-wider uppercase cursor-pointer py-1.5 transition-all"
        >
          {link.label}
        </button>
      ))}
    </div>
  );
}
