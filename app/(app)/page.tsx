"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup, faStar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";

type Tab = "all" | "following";

export default function FeedPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("all");

  const allBurgers = useQuery(api.burgers.list);
  const followingBurgers = useQuery(
    api.burgers.listByFollowing,
    user && tab === "following" ? { userId: user.id } : "skip"
  );
  const burgerOfMonth = useQuery(api.stats.getBurgerOfTheMonth);

  const burgers = tab === "following" ? followingBurgers : allBurgers;
  const loading = burgers === undefined;

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      <div className="mb-5">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Feed</h2>
        <p className="text-on-surface-variant text-sm mt-1">See what everyone&apos;s been eating</p>
      </div>

      {/* Burger of the Month */}
      {burgerOfMonth && (
        <Link href={`/burger/${burgerOfMonth._id}`}>
          <article className="relative rounded-[20px] overflow-hidden bun-shadow border border-amber/40 mb-6 squish block">
            <div className="relative w-full h-44">
              {burgerOfMonth.photoUrl ? (
                <Image
                  src={burgerOfMonth.photoUrl}
                  alt={burgerOfMonth.burgerName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              ) : (
                <div className="absolute inset-0 bg-surface-container-low flex items-center justify-center">
                  <span className="text-5xl opacity-20 select-none">🍔</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary-container/30 to-transparent" />

              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-amber text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  🏆 Burger of the Month
                </span>
              </div>

              {/* Score chip */}
              <div className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-[10px]" />
                {burgerOfMonth.totalScore.toFixed(1)}
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-heading font-bold text-xl text-on-primary-container leading-tight drop-shadow-sm">
                  {burgerOfMonth.burgerName}
                </h3>
                <p className="text-on-primary-container/80 text-sm flex items-center gap-1 mt-0.5">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                  {burgerOfMonth.restaurantName}
                  {burgerOfMonth.location && <span>· {burgerOfMonth.location}</span>}
                </p>
              </div>
            </div>
          </article>
        </Link>
      )}

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

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-surface-container animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      )}

      {/* Following empty state */}
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

      {/* All empty state */}
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
