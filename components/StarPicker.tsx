"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface StarPickerProps {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarPicker({ value, onChange, label, readonly = false, size = "md" }: StarPickerProps) {
  const sizeClass = { sm: "text-sm", md: "text-2xl", lg: "text-3xl" }[size];

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-on-surface-variant">{label}</span>}
      <div className="flex gap-0.5 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`${sizeClass} transition-transform ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-90"
            }`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <FontAwesomeIcon
              icon={faStar}
              style={{ color: star <= value ? "#7ddc7a" : "#d4c3be" }}
            />
          </button>
        ))}
        {!readonly && (
          <span className="ml-2 text-sm text-on-surface-variant self-center tabular-nums">
            {value > 0 ? `${value}/5` : "—"}
          </span>
        )}
      </div>
    </div>
  );
}
