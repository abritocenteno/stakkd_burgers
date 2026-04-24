"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";

const NAV_ITEMS = [
  { href: "/", icon: faHouse, label: "Feed" },
  { href: "/log", icon: faPlus, label: "Log" },
  { href: "/discover", icon: faMagnifyingGlass, label: "Discover" },
  { href: "/profile", icon: faUser, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 h-screen bg-surface border-r border-outline-variant/40 p-4">
      <Link href="/" className="mb-8 px-2">
        <h1 className="font-brand text-3xl text-primary">Stakk&apos;d</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">Track every burger</p>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all squish ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant hover:bg-accent hover:text-on-surface"
              }`}
            >
              <FontAwesomeIcon icon={icon} className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 px-3 py-3 border-t border-outline-variant/40 mt-2">
        <UserButton />
        <span className="text-sm text-on-surface-variant">Account</span>
      </div>
    </aside>
  );
}
