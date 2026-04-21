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
  value: "Value for Money",
};

export function RatingBreakdown({ ratings }: { ratings: Ratings }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {(Object.keys(LABELS) as (keyof Ratings)[]).map((key) => (
        <div key={key} className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium w-36 shrink-0">{LABELS[key]}</span>
          <StarPicker value={ratings[key]} readonly size="sm" />
          <span className="text-sm text-muted-foreground w-6 text-right">{ratings[key]}</span>
        </div>
      ))}
    </div>
  );
}
