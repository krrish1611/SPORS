import React, { useState } from "react";
import { ExternalLink, Navigation, Layers, MapPin } from "lucide-react";

interface MapProps {
  latitude: number;
  longitude: number;
  deviceName?: string;
  address?: string;
}

const defaultCenter = { lat: 28.6139, lng: 77.2090 };

type MapMode = "google_roadmap" | "google_satellite" | "osm";

const Map: React.FC<MapProps> = ({ latitude, longitude, deviceName, address }) => {
  const [mapMode, setMapMode] = useState<MapMode>("google_roadmap");

  // Validate coordinates
  const parsedLat = Number(latitude);
  const parsedLng = Number(longitude);
  const isValidCoord = !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

  const lat = isValidCoord ? parsedLat : defaultCenter.lat;
  const lng = isValidCoord ? parsedLng : defaultCenter.lng;

  // Google Maps Direct Navigation URL (opens native app on mobile or web on desktop)
  const googleMapsAppUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // High-reliability Google Maps embed URLs (requires no API key, zero "Billing error", zero "This page can't load Google Maps correctly" popups)
  const googleRoadmapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=m&z=15&output=embed`;
  const googleSatelliteEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=16&output=embed`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  const currentEmbedUrl =
    mapMode === "google_satellite"
      ? googleSatelliteEmbedUrl
      : mapMode === "osm"
      ? osmEmbedUrl
      : googleRoadmapEmbedUrl;

  return (
    <div className="relative w-full h-full min-h-[340px] bg-slate-900 overflow-hidden rounded-xl border border-primary/30 shadow-inner group">
      {/* Map Iframe */}
      <iframe
        key={`${mapMode}-${lat}-${lng}`}
        title={`Live Location Map for ${deviceName || "Device"}`}
        src={currentEmbedUrl}
        className="w-full h-full min-h-[340px] border-0"
        loading="lazy"
        allowFullScreen
      />

      {/* Top HUD Info Bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Telemetry Badge */}
        <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/40 shadow-lg pointer-events-auto flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-mono text-primary font-bold">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </span>
          {deviceName && (
            <span className="text-slate-300 hidden sm:inline font-sans">
              • {deviceName}
            </span>
          )}
        </div>

        {/* View Modes & Open Google Maps */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map Layer Switcher */}
          <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-lg border border-primary/30 shadow-lg flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setMapMode("google_roadmap")}
              className={`px-2 py-1 rounded transition-colors ${
                mapMode === "google_roadmap"
                  ? "bg-primary text-white font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Google Maps Road View"
            >
              Google Map
            </button>
            <button
              onClick={() => setMapMode("google_satellite")}
              className={`px-2 py-1 rounded transition-colors ${
                mapMode === "google_satellite"
                  ? "bg-primary text-white font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Google Maps Satellite View"
            >
              Satellite
            </button>
            <button
              onClick={() => setMapMode("osm")}
              className={`px-2 py-1 rounded transition-colors ${
                mapMode === "osm"
                  ? "bg-primary text-white font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="OpenStreetMap View"
            >
              OSM
            </button>
          </div>

          {/* Open in Google Maps App */}
          <a
            href={googleMapsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-lg flex items-center gap-1.5 transition-all"
            title="Open in Google Maps App with GPS Navigation"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Address banner at bottom if provided */}
      {address && (
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10">
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/30 shadow-md inline-flex items-center gap-1.5 text-xs text-slate-200 pointer-events-auto max-w-full truncate">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
