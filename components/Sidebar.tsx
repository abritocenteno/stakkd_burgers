"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faMagnifyingGlass, faUser, faBell } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const NAV_ITEMS = [
  { href: "/", icon: faHouse, label: "Feed" },
  { href: "/log", icon: faPlus, label: "Log" },
  { href: "/discover", icon: faMagnifyingGlass, label: "Discover" },
  { href: "/notifications", icon: faBell, label: "Notifications" },
  { href: "/profile", icon: faUser, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const unreadCount = useQuery(api.notifications.getUnreadCount, user ? { userId: user.id } : "skip");

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
              <div className="relative">
                <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                {href === "/notifications" && (unreadCount ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {unreadCount! > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
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
