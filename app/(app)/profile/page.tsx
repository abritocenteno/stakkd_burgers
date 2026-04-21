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
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      {/* User info */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          {user?.imageUrl && <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />}
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {(user?.fullName ?? user?.username ?? "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-heading font-bold text-2xl">{user?.fullName ?? user?.username}</h2>
          <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-1">
            <FontAwesomeIcon icon={faHamburger} className="text-primary text-xl" />
            <span className="font-heading font-bold text-xl">{stats.total}</span>
            <span className="text-xs text-muted-foreground text-center">Burgers</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-1">
            <FontAwesomeIcon icon={faStar} style={{ color: "#F5A623" }} className="text-xl" />
            <span className="font-heading font-bold text-xl">{stats.avg}</span>
            <span className="text-xs text-muted-foreground text-center">Avg Score</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-1">
            <FontAwesomeIcon icon={faTrophy} className="text-amber text-xl" style={{ color: "#F5A623" }} />
            <span className="font-heading font-bold text-xl">
              {stats.best ? stats.best.totalScore.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-muted-foreground text-center">Best Burger</span>
          </div>
        </div>
      )}

      {/* Burger list */}
      <h3 className="font-heading font-bold text-lg mb-3">Your Burger Logs</h3>

      {burgers === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {burgers?.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No burgers logged yet. Hit the Log tab to get started!
        </p>
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
