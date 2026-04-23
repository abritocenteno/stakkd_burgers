"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger, faStar, faTrophy, faUserGroup, faChartLine, faChartBar } from "@fortawesome/free-solid-svg-icons";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";

const CATEGORY_KEYS = ["taste", "freshness", "presentation", "sides", "doneness", "value"] as const;
const CATEGORY_LABELS: Record<typeof CATEGORY_KEYS[number], string> = {
  taste: "Taste",
  freshness: "Freshness",
  presentation: "Presentation",
  sides: "Sides",
  doneness: "Doneness",
  value: "Value",
};

const avg = (nums: number[]) =>
  nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0;

export default function ProfilePage() {
  const { user } = useUser();
  const burgers = useQuery(api.burgers.listByUser, user ? { userId: user.id } : "skip");
  const followCounts = useQuery(api.social.getFollowCounts, user ? { userId: user.id } : "skip");

  const stats = burgers && burgers.length > 0
    ? {
        total: burgers.length,
        avg: avg(burgers.map((b) => b.totalScore)),
        best: burgers.reduce((a, b) => (a.totalScore > b.totalScore ? a : b)),
      }
    : burgers
    ? { total: 0, avg: 0, best: null }
    : null;

  // Chart data — computed from existing query, no extra round-trip
  const scoreTrend = burgers
    ? [...burgers]
        .sort((a, b) => a.visitedAt - b.visitedAt)
        .map((b) => ({
          date: new Date(b.visitedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          score: b.totalScore,
          name: b.burgerName,
        }))
    : [];

  const categoryBreakdown = burgers && burgers.length > 0
    ? CATEGORY_KEYS.map((key) => ({
        category: CATEGORY_LABELS[key],
        avg: avg(burgers.map((b) => b[key])),
      }))
    : [];

  const hasEnoughForCharts = (burgers?.length ?? 0) >= 2;

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      {/* User card */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-surface-container-low rounded-[20px] border border-outline-variant/40">
        <Avatar className="h-16 w-16 border-2 border-primary-fixed">
          {user?.imageUrl && <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />}
          <AvatarFallback className="text-lg bg-primary text-primary-foreground font-heading font-bold">
            {(user?.fullName ?? user?.username ?? "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-bold text-xl text-on-surface truncate">
            {user?.fullName ?? user?.username}
          </h2>
          <p className="text-sm text-on-surface-variant truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
          {followCounts && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <FontAwesomeIcon icon={faUserGroup} className="text-[10px]" />
                <strong className="text-on-surface">{followCounts.followers}</strong> followers
              </span>
              <span className="text-xs text-on-surface-variant">
                <strong className="text-on-surface">{followCounts.following}</strong> following
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats tiles */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faHamburger} className="text-primary text-xl" />
            <span className="font-heading font-bold text-2xl text-on-surface">{stats.total}</span>
            <span className="text-xs text-on-surface-variant text-center font-medium">Burgers</span>
          </div>
          <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-xl" />
            <span className="font-heading font-bold text-2xl text-on-surface">
              {stats.avg > 0 ? stats.avg.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-on-surface-variant text-center font-medium">Avg Score</span>
          </div>
          <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faTrophy} style={{ color: "#f5a623" }} className="text-xl" />
            <span className="font-heading font-bold text-2xl text-on-surface">
              {stats.best ? stats.best.totalScore.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-on-surface-variant text-center font-medium">Best Score</span>
          </div>
        </div>
      )}

      {/* Charts — only shown once there are at least 2 logs */}
      {hasEnoughForCharts && (
        <div className="space-y-4 mb-8">
          {/* Score trend */}
          <div className="bg-surface-container-low rounded-[20px] border border-outline-variant/40 p-5 shadow-sm">
            <h3 className="font-heading font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-primary text-sm" />
              Score Over Time
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={scoreTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#53352b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#53352b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#504440" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: "#504440" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fbf9f5",
                    border: "1px solid #d4c3be",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(val) => [typeof val === "number" ? `${val.toFixed(1)} / 5` : val, "Score"]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name ?? label}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#53352b"
                  strokeWidth={2.5}
                  fill="url(#scoreGrad)"
                  dot={{ fill: "#53352b", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#53352b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="bg-surface-container-low rounded-[20px] border border-outline-variant/40 p-5 shadow-sm">
            <h3 className="font-heading font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} className="text-primary text-sm" />
              Rating Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={categoryBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 4, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: "#504440" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#504440" }}
                  axisLine={false}
                  tickLine={false}
                  width={78}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fbf9f5",
                    border: "1px solid #d4c3be",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(val) => [typeof val === "number" ? `${val.toFixed(1)} / 5` : val, "Avg"]}
                />
                <Bar dataKey="avg" radius={[0, 6, 6, 0]} barSize={14}>
                  {categoryBreakdown.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.avg >= 4 ? "#7ddc7a" : entry.avg >= 3 ? "#53352b" : "#d4c3be"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Burger list */}
      <h3 className="font-heading font-bold text-lg text-on-surface mb-4">Your Burger Logs</h3>

      {burgers === undefined && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-surface-container animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      )}

      {burgers?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-20 select-none">🍔</div>
          <p className="font-heading font-bold text-on-surface-variant">No burgers logged yet</p>
          <p className="text-sm text-on-surface-variant mt-1">Hit the Log tab to get started!</p>
        </div>
      )}

      {burgers && burgers.length > 0 && (
        <div className="space-y-4">
          {burgers.map((burger) => (
            <BurgerCard key={burger._id} burger={burger} />
          ))}
        </div>
      )}
    </div>
  );
}
