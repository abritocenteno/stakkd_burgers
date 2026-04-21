"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";

const NAV_ITEMS = [
  { href: "/", icon: faHouse, label: "Feed" },
  { href: "/log", icon: faPlus, label: "Log" },
  { href: "/profile", icon: faUser, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 h-screen bg-card border-r border-border p-4">
      <Link href="/" className="mb-8 px-2">
        <h1 className="font-heading font-bold text-2xl text-primary">Stakkd Burgers</h1>
        <p className="text-xs text-muted-foreground">Track every burger</p>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              <FontAwesomeIcon icon={icon} className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 px-3 py-2 border-t border-border pt-4">
        <UserButton />
        <span className="text-sm text-muted-foreground">Account</span>
      </div>
    </aside>
  );
}
