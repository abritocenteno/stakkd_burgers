"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";

const NAV_ITEMS = [
  { href: "/", icon: faHouse, label: "Feed" },
  { href: "/log", icon: faPlus, label: "Log" },
  { href: "/discover", icon: faMagnifyingGlass, label: "Discover" },
  { href: "/profile", icon: faUser, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center px-3 pt-2 pb-7 bg-surface/90 backdrop-blur-md rounded-t-3xl border-t border-outline-variant/40 shadow-[0_-4px_20px_rgba(109,76,65,0.10)]">
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl min-h-[52px] transition-all squish ${
              active
                ? "text-primary bg-primary/10"
                : "text-on-surface-variant hover:bg-accent"
            }`}
          >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            <span className="font-heading text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
