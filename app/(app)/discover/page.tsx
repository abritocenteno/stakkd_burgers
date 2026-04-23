"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { Input } from "@/components/ui/input";
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
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="mb-5">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl">Discover</h2>
        <p className="text-muted-foreground text-sm mt-1">Search burgers and restaurants</p>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Burger name, restaurant, location…"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {/* Min score filter */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-muted-foreground shrink-0">Min score</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => setMinScore(score === minScore ? 0 : score)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                minScore === score && score > 0
                  ? "bg-primary text-primary-foreground"
                  : score === 0 && minScore === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {score === 0 ? (
                <span className="text-xs">All</span>
              ) : (
                <span className="flex items-center justify-center gap-0.5">
                  {score}
                  <FontAwesomeIcon icon={faStar} style={{ color: "#F5A623" }} className="text-xs" />
                </span>
              )}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button
            onClick={() => { setQuery(""); setMinScore(0); }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {burgers === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {burgers !== undefined && (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            {results.length} {results.length === 1 ? "burger" : "burgers"} found
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-4xl text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No burgers match your search</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different name or lower the score filter</p>
            </div>
          ) : (
            <div className="space-y-3">
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
