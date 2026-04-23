"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt, faArrowLeft, faPenToSquare, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BurgerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const burger = useQuery(api.burgers.getById, { id: id as Id<"burgerLogs"> });
  const remove = useMutation(api.burgers.remove);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = !!user && !!burger && user.id === burger.userId;

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

        {/* Score chip at bottom of image */}
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

        {/* Author + date */}
        <div className="flex items-center gap-3 pb-5 border-b border-outline-variant/50">
          <Avatar className="h-9 w-9">
            {burger.userImageUrl && <AvatarImage src={burger.userImageUrl} alt={burger.userName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {burger.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-on-surface">{burger.userName}</p>
            <p className="text-xs text-on-surface-variant">{formatDate(burger.visitedAt)}</p>
          </div>
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
      </div>
    </div>
  );
}
