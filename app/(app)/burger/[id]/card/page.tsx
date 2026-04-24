import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { notFound } from "next/navigation";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const CATEGORY_LABELS: Record<string, string> = {
  taste: "Taste",
  freshness: "Freshness",
  presentation: "Look",
  sides: "Sides",
  doneness: "Doneness",
  value: "Value",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-on-surface-variant w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(value / 5) * 100}%`,
            background: value >= 4 ? "#7ddc7a" : value >= 3 ? "#53352b" : "#d4c3be",
          }}
        />
      </div>
      <span className="text-[11px] font-bold text-on-surface w-5 text-right">{value}</span>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BurgerCardPage({ params }: Props) {
  const { id } = await params;
  let burger;
  try {
    burger = await convex.query(api.burgers.getById, { id: id as Id<"burgerLogs"> });
  } catch {
    notFound();
  }
  if (!burger) notFound();

  const categories = Object.entries(CATEGORY_LABELS) as [keyof typeof burger, string][];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-[28px] overflow-hidden bun-shadow border border-outline-variant/40"
        style={{ background: "#fbf9f5" }}
      >
        {/* Photo */}
        <div className="relative w-full h-52 bg-surface-container-low">
          {burger.photoUrl ? (
            <Image
              src={burger.photoUrl}
              alt={burger.burgerName}
              fill
              className="object-cover"
              sizes="384px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl opacity-10 select-none">🍔</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Score overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="font-heading font-bold text-white text-xl leading-tight drop-shadow">
                {burger.burgerName}
              </p>
              <p className="text-white/80 text-xs mt-0.5">{burger.restaurantName}{burger.location ? ` · ${burger.location}` : ""}</p>
            </div>
            <div className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm shrink-0 ml-2">
              <span style={{ color: "#0c7521" }}>★</span>
              {burger.totalScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Scores */}
          <div className="space-y-2">
            {categories.map(([key, label]) => (
              <ScoreBar key={key} label={label} value={burger[key as keyof typeof burger] as number} />
            ))}
          </div>

          {/* Notes snippet */}
          {burger.notes && (
            <p className="text-xs text-on-surface-variant italic line-clamp-2 border-t border-outline-variant/30 pt-3">
              &ldquo;{burger.notes}&rdquo;
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
            <p className="text-xs text-on-surface-variant">
              by <span className="font-semibold text-on-surface">{burger.userName}</span>
            </p>
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase">Stakkd</p>
          </div>
        </div>
      </div>
    </div>
  );
}
