"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function TopBar() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
      <Link href="/">
        <span className="font-brand text-2xl text-primary">Stakk&apos;d</span>
      </Link>
      <UserButton />
    </header>
  );
}
