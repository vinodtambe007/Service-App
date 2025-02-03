import React, { useState, useRef, useEffect } from "react";

const AdminGoogleMap = ({ userLocation, providerLocation, setPrice }) => {
  const [map, setMap] = useState(null);
  const [output, setOutput] = useState("");
  const mapRef = useRef(null);

  const baseRate = 250; // Base rate in currency units
  const perKmRate = 10; // Additional cost per kilometer

  useEffect(() => {
    if (!userLocation || !providerLocation) {
      setOutput("Invalid locations provided.");
      return;
    }

    const providerLat = providerLocation.lat;
    const providerLng = providerLocation.lon;
    const userLat = userLocation.lat;
    const userLng = userLocation.lon;

    // Initialize map options
    const mapOptions = {
      center: { lat: providerLat, lng: providerLng },
      zoom: 7,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    };

    // Create map
    const mapObj = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(mapObj);

    // Add custom markers for Provider and User
    const providerMarker = new window.google.maps.Marker({
      position: { lat: providerLat, lng: providerLng },
      map: mapObj,
      label: {
        text: "P",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "green",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "white",
      },
    });

    const userMarker = new window.google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: mapObj,
      label: {
        text: "U",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "red",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "white",
      },
    });

    // Initialize DirectionsService and DirectionsRenderer
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true, // Disable default markers (A and B)
    });
    directionsRenderer.setMap(mapObj);

    // Add directional arrows
    const addDirectionalArrows = (route) => {
      const lineSymbol = {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        strokeColor: "#000",
      };

      const polyline = new window.google.maps.Polyline({
        path: route.overview_path,
        icons: [
          {
            icon: lineSymbol,
            offset: "0%",
            repeat: "100px", // Adjust the spacing of the arrows
          },
        ],
        strokeColor: "#0000",
        strokeOpacity: 0.7,
        strokeWeight: 4,
        map: mapObj,
      });
    };

    // Function to calculate route
    const calcRoute = () => {
      const request = {
        origin: new window.google.maps.LatLng(providerLat, providerLng),
        destination: new window.google.maps.LatLng(userLat, userLng),
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const distanceText = result.routes[0].legs[0].distance.text;
          const durationText = result.routes[0].legs[0].duration.text;
          const distanceInKm = parseFloat(
            result.routes[0].legs[0].distance.value / 1000
          ); // Convert to kilometers

          // Calculate the price
          const calculatedPrice = baseRate + perKmRate * distanceInKm;
          setPrice(calculatedPrice); // Pass price back to parent component

          // Update output
          setOutput(
            `<div class='mt-2 alert-info'>
              <b>Distance:</b> ${distanceText}
              <b>&nbsp;&nbsp;&nbsp;&nbsp;Duration:</b> ${durationText}
              <b>&nbsp;&nbsp;&nbsp;&nbsp;Price:</b> ₹${calculatedPrice.toFixed(
                0
              )}
            </div>`
          );

          // Render the route and add arrows
          directionsRenderer.setDirections(result);
          addDirectionalArrows(result.routes[0]);
        } else {
          setOutput(
            "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Could not calculate route.</div>"
          );
        }
      });
    };

    // Calculate route when the component is mounted
    calcRoute();

    // Cleanup on component unmount
    return () => {
      directionsRenderer.setMap(null);
      providerMarker.setMap(null);
      userMarker.setMap(null);
    };
  }, [userLocation, providerLocation, setPrice]);

  return (
    <div>
      <div
        id="googleMap"
        ref={mapRef}
        style={{ width: "100%", height: "500px" }}
      ></div>
      <div id="output" dangerouslySetInnerHTML={{ __html: output }}></div>
    </div>
  );
};

export default AdminGoogleMap;
