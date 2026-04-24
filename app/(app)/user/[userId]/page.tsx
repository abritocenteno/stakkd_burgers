"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { BurgerCard } from "@/components/BurgerCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger, faStar, faTrophy, faUserGroup, faArrowLeft, faUserPlus, faUserCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: currentUser } = useUser();
  const profile = useQuery(api.social.getUserProfile, { userId });
  const following = useQuery(
    api.social.isFollowing,
    currentUser && currentUser.id !== userId
      ? { followerId: currentUser.id, followingId: userId }
      : "skip"
  );
  const toggleFollow = useMutation(api.social.toggleFollow);
  const [following_, setFollowing_] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  const handleFollow = async () => {
    if (!currentUser || following_) return;
    setFollowing_(true);
    try {
      const followed = await toggleFollow({
        followerId: currentUser.id,
        followerName: currentUser.fullName ?? currentUser.username ?? "Anonymous",
        followerImageUrl: currentUser.imageUrl,
        followingId: userId,
      });
      toast.success(followed ? `Following ${profile?.userName}!` : `Unfollowed ${profile?.userName}.`);
    } catch {
      toast.error("Couldn't update follow.");
    } finally {
      setFollowing_(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="max-w-2xl mx-auto w-full px-5 py-6 space-y-4">
        <div className="h-28 rounded-[20px] bg-surface-container animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[16px] bg-surface-container animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-5">
        <div className="text-6xl mb-4 opacity-20">🍔</div>
        <p className="font-heading font-bold text-on-surface-variant">No burgers logged yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-5"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </Link>

      {/* User card */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-surface-container-low rounded-[20px] border border-outline-variant/40">
        <Avatar className="h-16 w-16 border-2 border-primary-fixed">
          {profile.userImageUrl && <AvatarImage src={profile.userImageUrl} alt={profile.userName} />}
          <AvatarFallback className="text-lg bg-primary text-primary-foreground font-heading font-bold">
            {profile.userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-bold text-xl text-on-surface truncate">{profile.userName}</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <FontAwesomeIcon icon={faUserGroup} className="text-[10px]" />
              <strong className="text-on-surface">{profile.followers}</strong> followers
            </span>
            <span className="text-xs text-on-surface-variant">
              <strong className="text-on-surface">{profile.following}</strong> following
            </span>
          </div>
        </div>
        {!isOwnProfile && currentUser && (
          <button
            onClick={handleFollow}
            disabled={following_}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all squish shrink-0 ${
              following
                ? "bg-surface-container text-on-surface-variant border border-outline-variant"
                : "bg-primary text-primary-foreground"
            } disabled:opacity-60`}
          >
            {following_ ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
            ) : (
              <FontAwesomeIcon icon={following ? faUserCheck : faUserPlus} className="text-xs" />
            )}
            {following ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
          <FontAwesomeIcon icon={faHamburger} className="text-primary text-xl" />
          <span className="font-heading font-bold text-2xl text-on-surface">{profile.totalBurgers}</span>
          <span className="text-xs text-on-surface-variant text-center font-medium">Burgers</span>
        </div>
        <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
          <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-xl" />
          <span className="font-heading font-bold text-2xl text-on-surface">{profile.avgScore.toFixed(1)}</span>
          <span className="text-xs text-on-surface-variant text-center font-medium">Avg Score</span>
        </div>
        <div className="bg-surface-container-low rounded-[16px] border border-outline-variant/40 p-4 flex flex-col items-center gap-1.5 shadow-sm">
          <FontAwesomeIcon icon={faTrophy} style={{ color: "#f5a623" }} className="text-xl" />
          <span className="font-heading font-bold text-2xl text-on-surface">{profile.bestScore.toFixed(1)}</span>
          <span className="text-xs text-on-surface-variant text-center font-medium">Best</span>
        </div>
      </div>

      {/* Burger list */}
      <h3 className="font-heading font-bold text-lg text-on-surface mb-4">
        {isOwnProfile ? "Your" : `${profile.userName}'s`} Burger Logs
      </h3>
      <div className="space-y-4">
        {profile.burgers.map((burger) => (
          <BurgerCard key={burger._id} burger={burger} />
        ))}
      </div>
    </div>
  );
}
