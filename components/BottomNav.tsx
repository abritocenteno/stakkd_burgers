"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";

const NAV_ITEMS = [
  { href: "/", icon: faHouse, label: "Feed" },
  { href: "/log", icon: faPlus, label: "Log" },
  { href: "/profile", icon: faUser, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border flex safe-area-pb">
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-xs font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
