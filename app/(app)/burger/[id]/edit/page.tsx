"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StarPicker } from "@/components/StarPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faImage, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const RATING_FIELDS = [
  { key: "taste", label: "Taste" },
  { key: "freshness", label: "Freshness" },
  { key: "presentation", label: "Presentation" },
  { key: "sides", label: "Sides & Fixings" },
  { key: "doneness", label: "Doneness" },
  { key: "value", label: "Value for Money" },
] as const;

type RatingKey = (typeof RATING_FIELDS)[number]["key"];

export default function EditBurgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const burger = useQuery(api.burgers.getById, { id: id as Id<"burgerLogs"> });
  const updateBurger = useMutation(api.burgers.update);
  const generateUploadUrl = useMutation(api.burgers.generateUploadUrl);

  const [loading, setLoading] = useState(false);
  const [burgerName, setBurgerName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    taste: 0, freshness: 0, presentation: 0, sides: 0, doneness: 0, value: 0,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingStorageId, setExistingStorageId] = useState<Id<"_storage"> | undefined>();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form once data loads
  useEffect(() => {
    if (!burger) return;
    setBurgerName(burger.burgerName);
    setRestaurantName(burger.restaurantName);
    setLocation(burger.location ?? "");
    setNotes(burger.notes ?? "");
    setVisitedAt(new Date(burger.visitedAt).toISOString().split("T")[0]);
    setRatings({
      taste: burger.taste,
      freshness: burger.freshness,
      presentation: burger.presentation,
      sides: burger.sides,
      doneness: burger.doneness,
      value: burger.value,
    });
    setPhotoPreview(burger.photoUrl ?? null);
    setExistingStorageId(burger.photoStorageId);
  }, [burger]);

  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0) / 6;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !burger) return;
    if (Object.values(ratings).some((r) => r === 0)) {
      toast.error("Please rate all 6 criteria before saving.");
      return;
    }

    setLoading(true);
    try {
      let photoStorageId = existingStorageId;
      if (photoFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photoFile.type },
          body: photoFile,
        });
        const { storageId } = await res.json();
        photoStorageId = storageId;
      }

      await updateBurger({
        id: burger._id,
        userId: user.id,
        burgerName,
        restaurantName,
        location: location || undefined,
        photoStorageId,
        notes: notes || undefined,
        visitedAt: new Date(visitedAt).getTime(),
        ...ratings,
      });

      toast.success("Changes saved!");
      router.push(`/burger/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (burger === undefined) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!burger || (user && burger.userId !== user.id)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Not found or not authorised.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <Link href={`/burger/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </Link>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl">Edit Burger</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo */}
        <div>
          <Label className="mb-2 block">Photo</Label>
          <div className="relative w-full h-44 rounded-xl border-2 border-dashed border-border bg-muted/30 overflow-hidden">
            {photoPreview ? (
              <>
                <Image src={photoPreview} alt="Burger preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => cameraInputRef.current?.click()} className="bg-white/90 text-foreground rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2">
                    <FontAwesomeIcon icon={faCamera} />
                    Retake
                  </button>
                  <button type="button" onClick={() => galleryInputRef.current?.click()} className="bg-white/90 text-foreground rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2">
                    <FontAwesomeIcon icon={faImage} />
                    Gallery
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">Add a photo</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                    <FontAwesomeIcon icon={faCamera} />
                    Camera
                  </button>
                  <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                    <FontAwesomeIcon icon={faImage} />
                    Gallery
                  </button>
                </div>
              </div>
            )}
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Burger details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="burgerName">Burger Name *</Label>
            <Input id="burgerName" value={burgerName} onChange={(e) => setBurgerName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="restaurantName">Restaurant *</Label>
            <Input id="restaurantName" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="visitedAt">Date Visited</Label>
            <Input id="visitedAt" type="date" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)} max={new Date().toISOString().split("T")[0]} className="mt-1.5" />
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <h3 className="font-heading font-bold text-base">Rate Your Burger</h3>
          {RATING_FIELDS.map(({ key, label }) => (
            <StarPicker key={key} label={label} value={ratings[key]} onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))} />
          ))}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="font-medium text-sm">Total Score</span>
            <span className="font-heading font-bold text-lg text-primary">
              {Object.values(ratings).every((r) => r > 0) ? `${totalScore.toFixed(1)} / 5` : "—"}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes / Review</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 resize-none" />
        </div>

        <Button type="submit" disabled={loading || !burgerName || !restaurantName} className="w-full bg-primary text-primary-foreground font-bold py-3 text-base">
          {loading ? (
            <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
