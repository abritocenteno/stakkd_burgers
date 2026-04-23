"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function TopBar() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
      <Link href="/">
        <span className="font-heading font-black text-xl tracking-tight text-primary">Stakkd Burgers</span>
      </Link>
      <UserButton />
    </header>
  );
}
