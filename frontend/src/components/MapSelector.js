import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Define the bounds for India
const indiaBounds = [
  [8.088, 68.176], // Southwest corner (lat, lon)
  [37.3, 97.395], // Northeast corner (lat, lon)
];

const MapSelector = ({ setLatitude, setLongitude, setAddress }) => {
  const mapRef = useRef();

  // Custom hook to handle map events
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);
        // Optionally set the address here if you implement reverse geocoding
        L.popup()
          .setLatLng([lat, lng])
          .setContent("Location Selected")
          .openOn(mapRef.current);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center of India
      zoom={5} // Zoom level to show India clearly
      style={{ height: "400px", width: "100%" }}
      bounds={indiaBounds} // Restrict bounds to India
      maxBounds={indiaBounds} // Prevent panning out of India
      maxBoundsViscosity={1.0} // Prevent map from moving outside the bounds
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default MapSelector;
