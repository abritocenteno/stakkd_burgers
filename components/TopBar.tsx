"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

export function TopBar() {
  const { user } = useUser();
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    user ? { userId: user.id } : "skip"
  );

  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
      <Link href="/">
        <span className="font-brand text-2xl text-primary">Stakk&apos;d</span>
      </Link>
      <div className="flex items-center gap-3">
        {user && (
          <Link href="/notifications" className="relative flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <FontAwesomeIcon icon={faBell} className="text-base" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount! > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}
        <UserButton />
      </div>
    </header>
  );
}
