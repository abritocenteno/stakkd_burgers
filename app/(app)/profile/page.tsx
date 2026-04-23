"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger, faStar, faTrophy } from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage() {
  const { user } = useUser();
  const burgers = useQuery(api.burgers.listByUser, user ? { userId: user.id } : "skip");

  const stats = burgers
    ? {
        total: burgers.length,
        avg:
          burgers.length > 0
            ? (burgers.reduce((a, b) => a + b.totalScore, 0) / burgers.length).toFixed(1)
            : "—",
        best: burgers.length > 0 ? burgers.reduce((a, b) => (a.totalScore > b.totalScore ? a : b)) : null,
      }
    : null;

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      {/* User info */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-surface-container-low rounded-[20px] border border-outline-variant/40">
        <Avatar className="h-16 w-16 border-2 border-primary-fixed">
          {user?.imageUrl && <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />}
          <AvatarFallback className="text-lg bg-primary text-primary-foreground font-heading font-bold">
            {(user?.fullName ?? user?.username ?? "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-heading font-bold text-xl text-on-surface">{user?.fullName ?? user?.username}</h2>
          <p className="text-sm text-on-surface-variant">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faHamburger} className="text-primary text-xl" />
            <span className="font-heading font-bold text-2xl text-on-surface">{stats.total}</span>
            <span className="text-xs text-on-surface-variant text-center font-medium">Burgers</span>
          </div>
          <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-xl" />
            <span className="font-heading font-bold text-2xl text-on-surface">{stats.avg}</span>
            <span className="text-xs text-on-surface-variant text-center font-medium">Avg Score</span>
          </div>
          <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faTrophy} style={{ color: "#f5a623" }} className="text-xl" />
            <span className="font-heading font-bold text-2xl text-on-surface">
              {stats.best ? stats.best.totalScore.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-on-surface-variant text-center font-medium">Best Score</span>
          </div>
        </div>
      )}

      {/* Burger list */}
      <h3 className="font-heading font-bold text-lg text-on-surface mb-4">Your Burger Logs</h3>

      {burgers === undefined && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-surface-container animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      )}

      {burgers?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-20 select-none">🍔</div>
          <p className="text-on-surface-variant font-medium">No burgers logged yet</p>
          <p className="text-sm text-on-surface-variant mt-1">Hit the Log tab to get started!</p>
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
