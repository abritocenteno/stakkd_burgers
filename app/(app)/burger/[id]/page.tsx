import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Metadata } from "next";
import { BurgerDetailClient } from "./BurgerDetailClient";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const burger = await convex.query(api.burgers.getById, {
      id: id as Id<"burgerLogs">,
    });
    if (!burger) return { title: "Burger not found — Stakkd" };

    const title = `${burger.burgerName} at ${burger.restaurantName}`;
    const description = `Rated ${burger.totalScore.toFixed(1)}/5 by ${burger.userName}${burger.location ? ` · ${burger.location}` : ""}`;

    return {
      title: `${title} — Stakkd`,
      description,
      openGraph: {
        title,
        description,
        ...(burger.photoUrl ? { images: [{ url: burger.photoUrl, width: 1200, height: 630 }] } : {}),
        type: "article",
      },
      twitter: {
        card: burger.photoUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(burger.photoUrl ? { images: [burger.photoUrl] } : {}),
      },
    };
  } catch {
    return { title: "Stakkd Burgers" };
  }
}

export default async function BurgerDetailPage({ params }: Props) {
  const { id } = await params;
  return <BurgerDetailClient id={id} />;
}
