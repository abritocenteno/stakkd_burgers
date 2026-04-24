"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faStar, faXmark, faTrophy, faTag } from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Tab = "search" | "leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function DiscoverPage() {
  const [tab, setTab] = useState<Tab>("search");
  const burgers = useQuery(api.burgers.list);
  const leaderboard = useQuery(api.stats.getLeaderboard);
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags from visible burgers
  const allTags = useMemo(() => {
    if (!burgers) return [];
    const tagSet = new Set<string>();
    for (const b of burgers) {
      b.tags?.forEach((t) => tagSet.add(t));
    }
    return Array.from(tagSet).sort();
  }, [burgers]);

  const results = useMemo(() => {
    if (!burgers) return [];
    const q = query.toLowerCase().trim();
    return burgers.filter((b) => {
      const matchesQuery =
        !q ||
        b.burgerName.toLowerCase().includes(q) ||
        b.restaurantName.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q);
      const matchesScore = b.totalScore >= minScore;
      const matchesTag = !activeTag || (b.tags?.includes(activeTag) ?? false);
      return matchesQuery && matchesScore && matchesTag;
    });
  }, [burgers, query, minScore, activeTag]);

  const hasFilters = query.length > 0 || minScore > 0 || activeTag !== null;

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      <div className="mb-5">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Discover</h2>
        <p className="text-on-surface-variant text-sm mt-1">Search burgers or find top raters</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("search")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all squish ${
            tab === "search"
              ? "bg-primary text-primary-foreground"
              : "bg-surface-container text-on-surface-variant hover:bg-accent"
          }`}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
          Search
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all squish ${
            tab === "leaderboard"
              ? "bg-primary text-primary-foreground"
              : "bg-surface-container text-on-surface-variant hover:bg-accent"
          }`}
        >
          <FontAwesomeIcon icon={faTrophy} className="text-xs" />
          Leaderboard
        </button>
      </div>

      {/* ── Search tab ── */}
      {tab === "search" && (
        <>
          {/* Search input */}
          <div className="relative mb-4">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Burger name, restaurant, location…"
              className="w-full bg-surface-container-low border-0 rounded-2xl py-4 pl-11 pr-11 text-on-surface placeholder:text-outline/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          {/* Score filter chips */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-on-surface-variant shrink-0 font-medium">Min score:</span>
            {[0, 1, 2, 3, 4, 5].map((score) => {
              const active = score === 0 ? minScore === 0 : minScore === score;
              return (
                <button
                  key={score}
                  onClick={() => setMinScore(score === minScore && score > 0 ? 0 : score)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all squish ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container text-on-surface-variant hover:bg-accent"
                  }`}
                >
                  {score === 0 ? (
                    "All"
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ color: active ? "#ffdbcf" : "#7ddc7a" }}
                        className="text-xs"
                      />
                      {score}+
                    </>
                  )}
                </button>
              );
            })}
            {hasFilters && (
              <button
                onClick={() => { setQuery(""); setMinScore(0); setActiveTag(null); }}
                className="ml-auto text-xs text-on-surface-variant hover:text-on-surface underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Tag filter chips — only shown when tags exist */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <FontAwesomeIcon icon={faTag} className="text-xs text-on-surface-variant shrink-0" />
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all squish ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {burgers === undefined && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[20px] bg-surface-container animate-pulse" style={{ aspectRatio: "4/3" }} />
              ))}
            </div>
          )}

          {burgers !== undefined && (
            <>
              <p className="text-xs text-on-surface-variant mb-4 font-medium">
                {results.length} {results.length === 1 ? "burger" : "burgers"} found
              </p>
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-4xl text-on-surface-variant/20 mb-4" />
                  <p className="font-heading font-bold text-on-surface-variant">No burgers match your search</p>
                  <p className="text-sm text-on-surface-variant mt-1">Try a different name or lower the score filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((burger) => (
                    <BurgerCard key={burger._id} burger={burger} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Leaderboard tab ── */}
      {tab === "leaderboard" && (
        <>
          {leaderboard === undefined && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-surface-container animate-pulse" />
              ))}
            </div>
          )}

          {leaderboard?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FontAwesomeIcon icon={faTrophy} className="text-5xl text-on-surface-variant/20 mb-5" />
              <p className="font-heading font-bold text-on-surface-variant">No data yet</p>
              <p className="text-sm text-on-surface-variant mt-1">Log some burgers to get on the board!</p>
            </div>
          )}

          {leaderboard && leaderboard.length > 0 && (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-[16px] border shadow-sm ${
                    i === 0
                      ? "bg-amber/10 border-amber/30"
                      : i === 1
                      ? "bg-surface-container-low border-outline-variant/50"
                      : i === 2
                      ? "bg-surface-container-low border-outline-variant/50"
                      : "bg-surface-container-low border-outline-variant/40"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {i < 3 ? (
                      <span className="text-xl">{MEDALS[i]}</span>
                    ) : (
                      <span className="font-heading font-bold text-sm text-on-surface-variant">
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 shrink-0">
                    {entry.userImageUrl && (
                      <AvatarImage src={entry.userImageUrl} alt={entry.userName} />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {entry.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name + burger count */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-on-surface truncate">{entry.userName}</p>
                    <p className="text-xs text-on-surface-variant">
                      {entry.totalBurgers} {entry.totalBurgers === 1 ? "burger" : "burgers"} logged
                    </p>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full">
                    <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-xs" />
                    <span className="font-heading font-bold text-sm">{entry.avgScore.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
