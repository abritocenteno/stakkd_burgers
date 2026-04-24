import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faLeaf,
  faStar,
  faBacon,
  faCircleHalfStroke,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { StarPicker } from "./StarPicker";

interface Ratings {
  taste: number;
  freshness: number;
  presentation: number;
  sides: number;
  doneness: number;
  value: number;
}

const FIELDS: {
  key: keyof Ratings;
  label: string;
  icon: IconDefinition;
  color: string;
  bg: string;
}[] = [
  { key: "taste",        label: "Taste",         icon: faFire,             color: "#c0392b", bg: "#fdecea" },
  { key: "freshness",    label: "Freshness",      icon: faLeaf,             color: "#27ae60", bg: "#e9f7ef" },
  { key: "presentation", label: "Presentation",   icon: faStar,             color: "#d4820a", bg: "#fef3e2" },
  { key: "sides",        label: "Sides",          icon: faBacon,            color: "#8e44ad", bg: "#f5eef8" },
  { key: "doneness",     label: "Doneness",       icon: faCircleHalfStroke, color: "#2471a3", bg: "#eaf4fb" },
  { key: "value",        label: "Value",          icon: faCoins,            color: "#1e8449", bg: "#e9f7ef" },
];

function scoreLabel(score: number) {
  if (score === 5) return "Perfect";
  if (score >= 4) return "Great";
  if (score >= 3) return "Good";
  if (score >= 2) return "Fair";
  return "Poor";
}

export function RatingBreakdown({ ratings }: { ratings: Ratings }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELDS.map(({ key, label, icon, color, bg }) => {
        const score = ratings[key];
        return (
          <div
            key={key}
            className="bg-surface-container-low rounded-2xl border border-outline-variant/40 p-4 shadow-sm flex flex-col gap-3"
          >
            {/* Icon + score */}
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <FontAwesomeIcon icon={icon} style={{ color }} className="text-base" />
              </div>
              <div className="text-right">
                <span className="font-heading font-bold text-2xl text-on-surface leading-none">
                  {score}
                </span>
                <span className="text-xs text-on-surface-variant leading-none">/5</span>
              </div>
            </div>

            {/* Label + descriptor */}
            <div>
              <p className="text-sm font-bold text-on-surface leading-tight">{label}</p>
              <p className="text-xs text-on-surface-variant">{scoreLabel(score)}</p>
            </div>

            <StarPicker value={score} readonly size="sm" />
          </div>
        );
      })}
    </div>
  );
}
