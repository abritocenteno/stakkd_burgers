"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-solid-svg-icons";

interface StarPickerProps {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarPicker({ value, onChange, label, readonly = false, size = "md" }: StarPickerProps) {
  const sizeClass = { sm: "text-sm", md: "text-xl", lg: "text-2xl" }[size];

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-foreground/80">{label}</span>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`${sizeClass} transition-transform ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            }`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <FontAwesomeIcon
              icon={faStar}
              style={{ color: star <= value ? "#F5A623" : "#D6CCBB" }}
            />
          </button>
        ))}
        {!readonly && (
          <span className="ml-2 text-sm text-muted-foreground self-center">
            {value > 0 ? `${value}/5` : "—"}
          </span>
        )}
      </div>
    </div>
  );
}
