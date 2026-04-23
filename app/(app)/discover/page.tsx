"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faStar, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function DiscoverPage() {
  const burgers = useQuery(api.burgers.list);
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);

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
      return matchesQuery && matchesScore;
    });
  }, [burgers, query, minScore]);

  const hasFilters = query.length > 0 || minScore > 0;

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      <div className="mb-5">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Discover</h2>
        <p className="text-on-surface-variant text-sm mt-1">Search burgers and restaurants</p>
      </div>

      {/* Search */}
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
      <div className="flex items-center gap-2 mb-6 flex-wrap">
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
                <><FontAwesomeIcon icon={faStar} style={{ color: active ? "#ffdbcf" : "#7ddc7a" }} className="text-xs" />{score}+</>
              )}
            </button>
          );
        })}
        {hasFilters && (
          <button
            onClick={() => { setQuery(""); setMinScore(0); }}
            className="ml-auto text-xs text-on-surface-variant hover:text-on-surface underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Loading */}
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
    </div>
  );
}
