import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface BurgerCardProps {
  burger: Doc<"burgerLogs">;
}

export function BurgerCard({ burger }: BurgerCardProps) {
  return (
    <Link href={`/burger/${burger._id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/60">
        <div className="flex gap-0">
          {burger.photoUrl && (
            <div className="relative w-28 shrink-0 sm:w-36">
              <Image
                src={burger.photoUrl}
                alt={burger.burgerName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 144px"
              />
            </div>
          )}
          <CardContent className="flex-1 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-base sm:text-lg leading-tight truncate">
                  {burger.burgerName}
                </h3>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs shrink-0" />
                  {burger.restaurantName}
                  {burger.location && ` · ${burger.location}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-amber/10 rounded-full px-2 py-0.5">
                <FontAwesomeIcon icon={faStar} style={{ color: "#F5A623" }} className="text-sm" />
                <span className="font-bold text-sm">{burger.totalScore.toFixed(1)}</span>
              </div>
            </div>

            {burger.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{burger.notes}</p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-6 w-6">
                {burger.userImageUrl && <AvatarImage src={burger.userImageUrl} alt={burger.userName} />}
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {burger.userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{burger.userName}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDate(burger.visitedAt)}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
