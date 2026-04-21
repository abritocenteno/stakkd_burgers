"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger } from "@fortawesome/free-solid-svg-icons";

export default function FeedPage() {
  const burgers = useQuery(api.burgers.list);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">Recent Burgers</h2>
        <p className="text-muted-foreground text-sm mt-1">See what everyone&apos;s been eating</p>
      </div>

      {burgers === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {burgers?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FontAwesomeIcon icon={faHamburger} className="text-5xl text-muted-foreground/40 mb-4" />
          <h3 className="font-heading font-bold text-xl text-muted-foreground">No burgers logged yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Be the first to log a burger!</p>
        </div>
      )}

      {burgers && burgers.length > 0 && (
        <div className="space-y-3">
          {burgers.map((burger) => (
            <BurgerCard key={burger._id} burger={burger} />
          ))}
        </div>
      )}
    </div>
  );
}
