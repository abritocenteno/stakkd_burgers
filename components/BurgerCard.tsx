import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt, faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface BurgerCardProps {
  burger: Doc<"burgerLogs">;
}

export function BurgerCard({ burger }: BurgerCardProps) {
  return (
    <Link href={`/burger/${burger._id}`}>
      <article className="bg-surface rounded-[20px] overflow-hidden bun-shadow border border-outline-variant/50 squish block">
        {/* Photo */}
        <div className="relative w-full aspect-[4/3] bg-surface-container-low">
          {burger.photoUrl ? (
            <Image
              src={burger.photoUrl}
              alt={burger.burgerName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-15 select-none">🍔</span>
            </div>
          )}
          {/* Score chip */}
          <div className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm shadow-sm">
            <FontAwesomeIcon icon={faStar} style={{ color: "#7ddc7a" }} className="text-[10px]" />
            {burger.totalScore.toFixed(1)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-lg text-on-surface leading-tight">
            {burger.burgerName}
          </h3>
          <p className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs shrink-0" />
            {burger.restaurantName}
            {burger.location && <span>· {burger.location}</span>}
          </p>

          {burger.notes && (
            <p className="text-sm text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
              {burger.notes}
            </p>
          )}

          {burger.tags && burger.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {burger.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-outline-variant/40">
            <Avatar className="h-6 w-6">
              {burger.userImageUrl && <AvatarImage src={burger.userImageUrl} alt={burger.userName} />}
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {burger.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-on-surface-variant">{burger.userName}</span>
            <div className="ml-auto flex items-center gap-3">
              {(burger.likeCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <FontAwesomeIcon icon={faHeart} className="text-tertiary text-[10px]" />
                  {burger.likeCount}
                </span>
              )}
              {(burger.commentCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <FontAwesomeIcon icon={faComment} className="text-[10px]" />
                  {burger.commentCount}
                </span>
              )}
              <span className="text-xs text-on-surface-variant">{formatDate(burger.visitedAt)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
