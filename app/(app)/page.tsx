"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

type Tab = "all" | "following";

export default function FeedPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("all");

  const allBurgers = useQuery(api.burgers.list);
  const followingBurgers = useQuery(
    api.burgers.listByFollowing,
    user && tab === "following" ? { userId: user.id } : "skip"
  );

  const burgers = tab === "following" ? followingBurgers : allBurgers;
  const loading = burgers === undefined;

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      <div className="mb-5">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Feed</h2>
        <p className="text-on-surface-variant text-sm mt-1">See what everyone&apos;s been eating</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all squish ${
            tab === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-surface-container text-on-surface-variant hover:bg-accent"
          }`}
        >
          Latest
        </button>
        {user && (
          <button
            onClick={() => setTab("following")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all squish ${
              tab === "following"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container text-on-surface-variant hover:bg-accent"
            }`}
          >
            <FontAwesomeIcon icon={faUserGroup} className="text-xs" />
            Following
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-surface-container animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      )}

      {/* Following — empty state */}
      {!loading && tab === "following" && burgers?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FontAwesomeIcon icon={faUserGroup} className="text-5xl text-on-surface-variant/20 mb-5" />
          <h3 className="font-heading font-bold text-xl text-on-surface-variant">No burgers yet</h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
            Follow other users from their burger posts to see their logs here.
          </p>
          <button
            onClick={() => setTab("all")}
            className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold squish"
          >
            Browse all burgers
          </button>
        </div>
      )}

      {/* All — empty state */}
      {!loading && tab === "all" && burgers?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-5 opacity-20 select-none">🍔</div>
          <h3 className="font-heading font-bold text-xl text-on-surface-variant">No burgers logged yet</h3>
          <p className="text-sm text-on-surface-variant mt-1">Be the first to log a burger!</p>
        </div>
      )}

      {/* Cards */}
      {!loading && burgers && burgers.length > 0 && (
        <div className="space-y-4">
          {burgers.map((burger) => (
            <BurgerCard key={burger._id} burger={burger} />
          ))}
        </div>
      )}
    </div>
  );
}
