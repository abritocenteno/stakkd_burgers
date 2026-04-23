import { StarPicker } from "./StarPicker";

interface Ratings {
  taste: number;
  freshness: number;
  presentation: number;
  sides: number;
  doneness: number;
  value: number;
}

const LABELS: Record<keyof Ratings, string> = {
  taste: "Taste",
  freshness: "Freshness",
  presentation: "Presentation",
  sides: "Sides & Fixings",
  doneness: "Doneness",
  value: "Value",
};

export function RatingBreakdown({ ratings }: { ratings: Ratings }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.keys(LABELS) as (keyof Ratings)[]).map((key) => (
        <div key={key} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide leading-none">
              {LABELS[key]}
            </span>
            <span className="font-heading font-bold text-lg text-primary leading-none">{ratings[key]}</span>
          </div>
          <StarPicker value={ratings[key]} readonly size="sm" />
        </div>
      ))}
    </div>
  );
}
