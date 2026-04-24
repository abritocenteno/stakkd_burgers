"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faUserPlus, faBell } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const TYPE_CONFIG = {
  like: { icon: faHeart, color: "text-tertiary", bg: "bg-tertiary/10", label: "liked your burger" },
  comment: { icon: faComment, color: "text-secondary", bg: "bg-secondary/10", label: "commented on" },
  follow: { icon: faUserPlus, color: "text-primary", bg: "bg-primary/10", label: "started following you" },
};

export default function NotificationsPage() {
  const { user } = useUser();
  const notifications = useQuery(api.notifications.list, user ? { userId: user.id } : "skip");
  const markAllRead = useMutation(api.notifications.markAllRead);

  // Mark all as read when page is opened
  useEffect(() => {
    if (user && notifications && notifications.some((n) => !n.read)) {
      markAllRead({ userId: user.id });
    }
  }, [user, notifications, markAllRead]);

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Notifications</h2>
        <p className="text-on-surface-variant text-sm mt-1">Likes, comments, and new followers</p>
      </div>

      {notifications === undefined && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
      )}

      {notifications?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FontAwesomeIcon icon={faBell} className="text-5xl text-on-surface-variant/20 mb-5" />
          <p className="font-heading font-bold text-on-surface-variant">All quiet here</p>
          <p className="text-sm text-on-surface-variant mt-1">You&apos;ll see likes, comments, and follows here</p>
        </div>
      )}

      {notifications && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type];
            const inner = (
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                  n.read
                    ? "bg-surface-container-low border-outline-variant/40"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                {/* Avatar + type icon */}
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10">
                    {n.fromUserImageUrl && <AvatarImage src={n.fromUserImageUrl} alt={n.fromUserName} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {n.fromUserName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${config.bg}`}>
                    <FontAwesomeIcon icon={config.icon} className={`text-[9px] ${config.color}`} />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">
                    <span className="font-semibold">{n.fromUserName}</span>{" "}
                    {config.label}
                    {n.burgerName && n.type !== "follow" && (
                      <span className="font-semibold"> {n.burgerName}</span>
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            );

            return n.burgerId ? (
              <Link key={n._id} href={`/burger/${n.burgerId}`}>
                {inner}
              </Link>
            ) : (
              <Link key={n._id} href={`/user/${n.fromUserId}`}>
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
