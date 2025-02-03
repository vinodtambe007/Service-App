import React, { useState, useRef, useEffect } from "react";

const UserLocationMap = ({ latitude, longitude }) => {
  const mapRef = useRef(null); // Reference for the map container
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    // Ensure latitude and longitude are valid numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid latitude or longitude");
      return;
    }

    if (!window.google) {
      console.error("Google Maps API is not loaded.");
      return;
    }

    // Initialize the map only once
    if (!map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 20, // Adjust zoom level for better clarity
      });
      setMap(mapInstance);

      // Create the custom marker at the given latitude and longitude
      const markerInstance = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        label: {
          text: "U", // Custom label text
          color: "white", // Label text color
          fontSize: "18px", // Label font size
          fontWeight: "bold", // Label font weight
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE, // Circle path for the marker
          scale: 10, // Circle size
          fillColor: "red", // Marker fill color
          fillOpacity: 1, // Fill opacity
          strokeWeight: 1, // Stroke weight
          strokeColor: "white", // Stroke color
        },
      });
      setMarker(markerInstance);
    } else {
      // If the map is already initialized, update the center and marker position
      map.setCenter({ lat, lng });
      if (marker) {
        marker.setPosition({ lat, lng });
      }
    }

    // Clean up the map and marker on component unmount
    return () => {
      if (marker) {
        marker.setMap(null); // Remove the marker from the map
      }
    };
  }, [latitude, longitude, map, marker]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "300px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    ></div>
  );
};

export default UserLocationMap;
