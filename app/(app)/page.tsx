"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";

export default function FeedPage() {
  const burgers = useQuery(api.burgers.list);

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Recent Burgers</h2>
        <p className="text-on-surface-variant text-sm mt-1">See what everyone&apos;s been eating</p>
      </div>

      {burgers === undefined && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-surface-container animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      )}

      {burgers?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-5 opacity-20 select-none">🍔</div>
          <h3 className="font-heading font-bold text-xl text-on-surface-variant">No burgers logged yet</h3>
          <p className="text-sm text-on-surface-variant mt-1">Be the first to log a burger!</p>
        </div>
      )}

      {burgers && burgers.length > 0 && (
        <div className="space-y-4">
          {burgers.map((burger) => (
            <BurgerCard key={burger._id} burger={burger} />
          ))}
        </div>
      )}
    </div>
  );
}
