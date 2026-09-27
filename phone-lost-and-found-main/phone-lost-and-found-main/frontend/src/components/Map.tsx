import React, { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

interface MapProps {
  latitude: number;
  longitude: number;
  deviceName?: string;
  address?: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const Map: React.FC<MapProps> = ({ latitude, longitude, deviceName, address }) => {
  const [useOpenStreetMap, setUseOpenStreetMap] = useState(false);

  // Validate coordinates
  const parsedLat = Number(latitude);
  const parsedLng = Number(longitude);
  const isValidCoord = !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

  const lat = isValidCoord ? parsedLat : defaultCenter.lat;
  const lng = isValidCoord ? parsedLng : defaultCenter.lng;
  const center = { lat, lng };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  // If Google Maps failed to load or user toggled OSM
  if (loadError || !apiKey || useOpenStreetMap) {
    return (
      <div className="relative w-full h-full min-h-[300px] bg-slate-900 overflow-hidden rounded-xl border border-primary/20">
        <iframe
          title={`Map pin for ${deviceName || "Device"}`}
          src={osmEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* High-Tech Overlay Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/40 shadow-lg pointer-events-auto flex items-center gap-2 text-xs">
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

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg pointer-events-auto flex items-center gap-1.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directions</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    );
  }

  // Google Maps Loading state with fallback timeout
  if (!isLoaded) {
    return (
      <div className="relative w-full h-full min-h-[300px] bg-secondary/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-spin mb-3">
          <MapPin className="w-5 h-5" />
        </div>
        <p className="text-xs font-mono text-muted-foreground">Initializing satellite mesh coordinate layer...</p>
        <button
          onClick={() => setUseOpenStreetMap(true)}
          className="mt-3 text-xs text-primary underline hover:opacity-80"
        >
          Switch to OpenStreetMap view
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker position={center} title={deviceName || "Device Location"} />
      </GoogleMap>

      {/* Floating Directions Link */}
      <div className="absolute bottom-3 right-3 pointer-events-auto z-10">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-950/85 hover:bg-slate-900 text-foreground border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5 transition-all"
        >
          <ExternalLink className="w-3 h-3 text-primary" />
          <span>Open Full Navigation</span>
        </a>
      </div>
    </div>
  );
};

export default Map;
