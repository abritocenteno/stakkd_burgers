"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

// Fix default marker icon broken by webpack
const icon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:36px;background:#53352b;border:3px solid #fbf9f5;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(83,53,43,0.35)"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
});

interface Props {
  burgers: Doc<"burgerLogs">[];
}

export function BurgerMap({ burgers }: Props) {
  const mapped = burgers.filter((b) => b.latitude != null && b.longitude != null);

  // Default centre: first burger with coords, or London
  const centre: [number, number] =
    mapped.length > 0
      ? [mapped[0].latitude!, mapped[0].longitude!]
      : [51.505, -0.09];

  useEffect(() => {
    // Leaflet CSS loads fine but the icon URLs need to be patched for Next.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  if (mapped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4 opacity-20">📍</div>
        <p className="font-heading font-bold text-on-surface-variant">No mapped burgers yet</p>
        <p className="text-sm text-on-surface-variant mt-1">
          Enable location when logging a burger to pin it on the map
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] overflow-hidden border border-outline-variant/40 shadow-sm" style={{ height: 460 }}>
      <MapContainer center={centre} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapped.map((b) => (
          <Marker key={b._id} position={[b.latitude!, b.longitude!]} icon={icon}>
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-sm leading-tight">{b.burgerName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.restaurantName}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    ★ {b.totalScore.toFixed(1)}
                  </span>
                </div>
                <Link
                  href={`/burger/${b._id}`}
                  className="block mt-2 text-xs text-blue-600 underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
