"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StarPicker } from "@/components/StarPicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faImage, faSpinner, faArrowLeft, faHamburger } from "@fortawesome/free-solid-svg-icons";
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

const inputClass =
  "w-full bg-surface-container-low border-0 rounded-2xl py-4 px-5 text-on-surface placeholder:text-outline/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all";

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
      <div className="max-w-lg mx-auto w-full px-5 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-2xl bg-surface-container animate-pulse" />
        ))}
      </div>
    );
  }

  if (!burger || (user && burger.userId !== user.id)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant">Not found or not authorised.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-5 py-6">
      <div className="mb-6">
        <Link
          href={`/burger/${id}`}
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-3"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </Link>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">Edit Burger</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo */}
        <div className="relative">
          <div className="relative w-full h-56 rounded-[28px] border-2 border-dashed border-outline-variant bg-surface-container-low overflow-hidden">
            {photoPreview ? (
              <>
                <Image src={photoPreview} alt="Burger preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-surface/90 text-on-surface rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 squish"
                  >
                    <FontAwesomeIcon icon={faCamera} /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="bg-surface/90 text-on-surface rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 squish"
                  >
                    <FontAwesomeIcon icon={faImage} /> Gallery
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center shadow-md">
                  <FontAwesomeIcon icon={faCamera} className="text-2xl text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-primary">Upload Photo</p>
                  <p className="text-xs text-outline mt-0.5">Show us that juicy cross-section</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2 bg-surface border border-outline-variant rounded-full px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container squish"
                  >
                    <FontAwesomeIcon icon={faCamera} /> Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-2 bg-surface border border-outline-variant rounded-full px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container squish"
                  >
                    <FontAwesomeIcon icon={faImage} /> Gallery
                  </button>
                </div>
              </div>
            )}
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Text fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Burger Name *</label>
            <input value={burgerName} onChange={(e) => setBurgerName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Restaurant *</label>
            <input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Date Visited</label>
            <input
              type="date"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-surface-container-high rounded-[24px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-on-surface">Rate Your Burger</h3>
            {Object.values(ratings).every((r) => r > 0) && (
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                {totalScore.toFixed(1)} / 5
              </span>
            )}
          </div>
          {RATING_FIELDS.map(({ key, label }) => (
            <StarPicker
              key={key}
              label={label}
              value={ratings[key]}
              onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
            />
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Notes &amp; Review</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !burgerName || !restaurantName}
          className="w-full bg-primary-container text-on-primary-container font-heading font-bold py-5 rounded-[24px] bun-shadow flex items-center justify-center gap-3 squish hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-all"
        >
          {loading ? (
            <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Saving…</>
          ) : (
            <><FontAwesomeIcon icon={faHamburger} /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
}
