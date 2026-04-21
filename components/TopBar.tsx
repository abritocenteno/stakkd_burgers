"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function TopBar() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-card border-b border-border shadow-sm">
      <Link href="/">
        <span className="font-heading font-bold text-xl text-primary">Stakkd Burgers</span>
      </Link>
      <UserButton />
    </header>
  );
}
