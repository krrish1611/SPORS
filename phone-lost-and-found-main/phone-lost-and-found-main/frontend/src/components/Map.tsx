import React from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

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

const Map: React.FC<MapProps> = ({ latitude, longitude, deviceName, address }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "", // your API key
  });

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  // fallback coordinates if none are passed
  const defaultCenter = { lat: 19.2057654, lng: 73.0916078 };
  const center = latitude && longitude ? { lat: lat, lng: lng } : defaultCenter;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      {/* Always render a marker at center */}
      <Marker position={center}>

      </Marker>
    </GoogleMap>
  );
};

export default Map;
