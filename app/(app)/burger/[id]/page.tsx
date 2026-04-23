"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt, faArrowLeft, faPenToSquare, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

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
      router.push("/");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (burger === undefined) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="h-72 rounded-xl bg-muted animate-pulse mb-4" />
        <div className="h-8 bg-muted animate-pulse rounded w-2/3 mb-2" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
      </div>
    );
  }

  if (!burger) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Burger not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to feed
        </Link>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/burger/${id}/edit`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Edit
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mb-5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between gap-4">
          <p className="text-sm font-medium">Delete this burger log?</p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-3 py-1.5 rounded-lg bg-destructive text-white font-medium flex items-center gap-1.5 disabled:opacity-60"
            >
              {deleting && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Photo */}
      {burger.photoUrl && (
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-5">
          <Image
            src={burger.photoUrl}
            alt={burger.burgerName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl leading-tight">{burger.burgerName}</h1>
          <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sm" />
            {burger.restaurantName}
            {burger.location && <span className="text-xs">· {burger.location}</span>}
          </p>
        </div>
        <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-amber/15 text-foreground border-amber/30 shrink-0">
          <FontAwesomeIcon icon={faStar} style={{ color: "#F5A623" }} />
          <span className="font-bold text-lg">{burger.totalScore.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">/ 5</span>
        </Badge>
      </div>

      {/* Author & date */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <Avatar className="h-8 w-8">
          {burger.userImageUrl && <AvatarImage src={burger.userImageUrl} alt={burger.userName} />}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {burger.userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{burger.userName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(burger.visitedAt)}</p>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="mb-6">
        <h2 className="font-heading font-bold text-lg mb-3">Ratings</h2>
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

      {/* Notes */}
      {burger.notes && (
        <div>
          <h2 className="font-heading font-bold text-lg mb-2">Review</h2>
          <p className="text-muted-foreground leading-relaxed">{burger.notes}</p>
        </div>
      )}
    </div>
  );
}
