"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faMagnifyingGlass, faUser, faBell } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const NAV_ITEMS = [
  { href: "/", icon: faHouse, label: "Feed" },
  { href: "/log", icon: faPlus, label: "Log" },
  { href: "/discover", icon: faMagnifyingGlass, label: "Discover" },
  { href: "/notifications", icon: faBell, label: "Alerts" },
  { href: "/profile", icon: faUser, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const unreadCount = useQuery(api.notifications.getUnreadCount, user ? { userId: user.id } : "skip");

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
            <div className="relative">
              <FontAwesomeIcon icon={icon} className="text-lg" />
              {href === "/notifications" && (unreadCount ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount! > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="font-heading text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
