"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar, faMapMarkerAlt, faArrowLeft, faPenToSquare, faTrash,
  faSpinner, faHeart, faComment, faUserPlus, faUserCheck, faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BurgerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();

  const burger = useQuery(api.burgers.getById, { id: id as Id<"burgerLogs"> });
  const comments = useQuery(api.social.listComments, { burgerId: id as Id<"burgerLogs"> });
  const userLiked = useQuery(
    api.social.getUserLike,
    user ? { burgerId: id as Id<"burgerLogs">, userId: user.id } : "skip"
  );
  const following = useQuery(
    api.social.isFollowing,
    user && burger && user.id !== burger.userId
      ? { followerId: user.id, followingId: burger.userId }
      : "skip"
  );

  const remove = useMutation(api.burgers.remove);
  const toggleLike = useMutation(api.social.toggleLike);
  const addComment = useMutation(api.social.addComment);
  const deleteComment = useMutation(api.social.deleteComment);
  const toggleFollow = useMutation(api.social.toggleFollow);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [liking, setLiking] = useState(false);
  const [following_, setFollowing_] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const isOwner = !!user && !!burger && user.id === burger.userId;
  const isOtherUser = !!user && !!burger && user.id !== burger.userId;

  const handleDelete = async () => {
    if (!user || !burger) return;
    setDeleting(true);
    try {
      await remove({ id: burger._id, userId: user.id });
      toast.success("Burger log deleted.");
      router.push("/");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
      toast.error("Failed to delete. Please try again.");
    }
  };

  const handleLike = async () => {
    if (!user || !burger || liking) return;
    setLiking(true);
    try {
      const liked = await toggleLike({ burgerId: burger._id, userId: user.id });
      if (liked) toast.success("Added to your likes!");
    } catch {
      toast.error("Couldn't update like. Try again.");
    } finally {
      setLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !burger || following_) return;
    setFollowing_(true);
    try {
      const followed = await toggleFollow({ followerId: user.id, followingId: burger.userId });
      toast.success(followed ? `Following ${burger.userName}!` : `Unfollowed ${burger.userName}.`);
    } catch {
      toast.error("Couldn't update follow. Try again.");
    } finally {
      setFollowing_(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !burger || !commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await addComment({
        burgerId: burger._id,
        userId: user.id,
        userName: user.fullName ?? user.username ?? "Anonymous",
        userImageUrl: user.imageUrl,
        text: commentText.trim(),
      });
      setCommentText("");
    } catch {
      toast.error("Couldn't post comment. Try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!user) return;
    try {
      await deleteComment({ commentId, userId: user.id });
    } catch {
      toast.error("Couldn't delete comment.");
    }
  };

  if (burger === undefined) {
    return (
      <div className="max-w-2xl mx-auto w-full">
        <div className="h-72 bg-surface-container animate-pulse" />
        <div className="px-5 py-6 space-y-4">
          <div className="h-8 bg-surface-container animate-pulse rounded-2xl w-2/3" />
          <div className="h-4 bg-surface-container animate-pulse rounded-xl w-1/2" />
        </div>
      </div>
    );
  }

  if (!burger) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant">Burger not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Hero */}
      <div className="relative w-full h-72 sm:h-96 bg-surface-container-low">
        {burger.photoUrl ? (
          <Image
            src={burger.photoUrl}
            alt={burger.burgerName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-10 select-none">🍔</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />

        {/* Back + owner controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 bg-surface/75 backdrop-blur-sm rounded-full text-on-surface shadow-sm squish hover:bg-surface"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
          </Link>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/burger/${id}/edit`}
                className="flex items-center gap-1.5 bg-surface/75 backdrop-blur-sm text-on-surface px-3 py-2 rounded-full text-sm font-medium shadow-sm squish hover:bg-surface"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                Edit
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 bg-surface/75 backdrop-blur-sm text-destructive px-3 py-2 rounded-full text-sm font-medium shadow-sm squish hover:bg-surface"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Score chip */}
        <div className="absolute bottom-5 left-5">
          <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
            <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-xs" />
            {burger.totalScore.toFixed(1)} / 5
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-on-surface">Delete this burger log?</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-accent font-medium squish"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm px-3 py-1.5 rounded-full bg-destructive text-white font-medium flex items-center gap-1.5 disabled:opacity-60 squish"
              >
                {deleting && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface leading-tight">
            {burger.burgerName}
          </h1>
          <p className="text-on-surface-variant flex items-center gap-1.5 mt-1 text-sm">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            {burger.restaurantName}
            {burger.location && <span>· {burger.location}</span>}
          </p>
        </div>

        {/* Author + date + follow + like */}
        <div className="flex items-center gap-3 pb-5 border-b border-outline-variant/50">
          <Avatar className="h-9 w-9">
            {burger.userImageUrl && <AvatarImage src={burger.userImageUrl} alt={burger.userName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {burger.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface">{burger.userName}</p>
            <p className="text-xs text-on-surface-variant">{formatDate(burger.visitedAt)}</p>
          </div>

          {/* Follow button (only for other users' burgers) */}
          {isOtherUser && (
            <button
              onClick={handleFollow}
              disabled={following_}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all squish ${
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

          {/* Like button */}
          {user && (
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all squish ${
                userLiked
                  ? "bg-tertiary/10 text-tertiary"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant"
              } disabled:opacity-60`}
            >
              {liking ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
              ) : (
                <FontAwesomeIcon icon={userLiked ? faHeart : faHeartOutline} className="text-xs" />
              )}
              {burger.likeCount ?? 0}
            </button>
          )}
        </div>

        {/* Ratings bento grid */}
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface mb-3">Ratings</h2>
          <RatingBreakdown
            ratings={{
              taste: burger.taste,
              freshness: burger.freshness,
              presentation: burger.presentation,
              sides: burger.sides,
              doneness: burger.doneness,
              value: burger.value,
            }}
          />
        </div>

        {/* Review */}
        {burger.notes && (
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface mb-3">The Verdict</h2>
            <div className="relative p-5 bg-surface-container-low border border-outline-variant/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="absolute top-2 right-3 text-[56px] font-serif text-on-surface opacity-5 select-none leading-none">&ldquo;</div>
              <p className="text-on-surface-variant leading-relaxed">{burger.notes}</p>
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faComment} className="text-base text-on-surface-variant" />
            Comments
            {(burger.commentCount ?? 0) > 0 && (
              <span className="text-sm font-normal text-on-surface-variant">({burger.commentCount})</span>
            )}
          </h2>

          {/* Comment list */}
          {comments && comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    {c.userImageUrl && <AvatarImage src={c.userImageUrl} alt={c.userName} />}
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
                      {c.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-2xl px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-on-surface">{c.userName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                          {formatDate(c.createdAt)}
                        </span>
                        {user && c.userId === user.id && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-[10px] text-on-surface-variant hover:text-destructive transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {comments?.length === 0 && (
            <p className="text-sm text-on-surface-variant mb-4">
              No comments yet. Be the first!
            </p>
          )}

          {/* Add comment */}
          {user ? (
            <form onSubmit={handleComment} className="flex gap-3 items-end">
              <Avatar className="h-8 w-8 shrink-0">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />}
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
                  {(user.fullName ?? user.username ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  rows={1}
                  className="w-full bg-surface-container-low border-0 rounded-2xl py-3 px-4 pr-12 text-sm text-on-surface placeholder:text-outline/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary resize-none transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(e as unknown as React.FormEvent);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="absolute right-3 bottom-3 text-secondary disabled:text-outline/40 transition-colors"
                >
                  {submittingComment
                    ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    : <FontAwesomeIcon icon={faPaperPlane} />
                  }
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-on-surface-variant">
              <Link href="/sign-in" className="text-primary font-semibold hover:underline">Sign in</Link> to leave a comment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
