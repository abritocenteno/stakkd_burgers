"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StarPicker } from "@/components/StarPicker";
import { TagInput } from "@/components/TagInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faImage, faSpinner, faHamburger, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
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

const today = () => new Date().toISOString().split("T")[0];

const inputClass =
  "w-full bg-surface-container-low border-0 rounded-2xl py-4 px-5 text-on-surface placeholder:text-outline/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all";

function LogForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useUser();
  const createBurger = useMutation(api.burgers.create);
  const generateUploadUrl = useMutation(api.burgers.generateUploadUrl);

  // Pre-fill from "Log Again" deep-link
  const prefillBurgerName = params.get("burgerName") ?? "";
  const prefillRestaurant = params.get("restaurantName") ?? "";
  const prefillLocation = params.get("location") ?? "";
  const prefillTags = params.get("tags") ? params.get("tags")!.split(",").filter(Boolean) : [];

  const [loading, setLoading] = useState(false);
  const [burgerName, setBurgerName] = useState(prefillBurgerName);
  const [restaurantName, setRestaurantName] = useState(prefillRestaurant);
  const [location, setLocation] = useState(prefillLocation);
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState(today());
  const [tags, setTags] = useState<string[]>(prefillTags);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    taste: 0, freshness: 0, presentation: 0, sides: 0, doneness: 0, value: 0,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0) / 6;
  const isPrefilled = !!prefillBurgerName;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (Object.values(ratings).some((r) => r === 0)) {
      toast.error("Please rate all 6 criteria before saving.");
      return;
    }

    setLoading(true);
    try {
      let photoStorageId: Id<"_storage"> | undefined;
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

      await createBurger({
        userId: user.id,
        userName: user.fullName ?? user.username ?? "Anonymous",
        userImageUrl: user.imageUrl,
        burgerName,
        restaurantName,
        location: location || undefined,
        photoStorageId,
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined,
        latitude: coords?.lat,
        longitude: coords?.lng,
        visitedAt: new Date(visitedAt).getTime(),
        ...ratings,
      });

      toast.success("Burger logged!", { description: `${burgerName} has been added to your logs.` });
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full px-5 py-6">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">
          {isPrefilled ? "Log Again" : "New Review"}
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          {isPrefilled
            ? `New visit to ${prefillRestaurant} — how was it this time?`
            : "Share your latest burger conquest"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo upload */}
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
            <input
              value={burgerName}
              onChange={(e) => setBurgerName(e.target.value)}
              placeholder="e.g. Double Smash Burger"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Restaurant *</label>
            <input
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. The Burger Joint"
              required
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-primary-fixed-dim px-1">Location</label>
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={geoLoading}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-all squish ${
                  coords ? "bg-secondary/20 text-secondary" : "bg-surface-container text-on-surface-variant hover:bg-accent"
                } disabled:opacity-60`}
              >
                {geoLoading
                  ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                  : <FontAwesomeIcon icon={faLocationDot} className="text-[10px]" />
                }
                {coords ? "Location saved" : "Use my location"}
              </button>
            </div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. London, UK"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">Date Visited</label>
            <input
              type="date"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              max={today()}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-primary-fixed-dim px-1 block mb-1.5">
              Tags <span className="font-normal text-outline">(optional · up to 8)</span>
            </label>
            <TagInput tags={tags} onChange={setTags} />
            <p className="text-xs text-outline mt-1.5 px-1">Press Enter or comma to add a tag</p>
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
            placeholder="Describe your burger experience — bun quality, sauce levels, pickle crunch…"
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
            <><FontAwesomeIcon icon={faHamburger} /> Log Burger</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense>
      <LogForm />
    </Suspense>
  );
}
