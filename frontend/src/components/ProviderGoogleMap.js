import React, { useState, useRef, useEffect } from "react";

// Make sure to replace YOUR_API_KEY with your actual Google Maps API Key
const ProviderGoogleMap = ({ userLocation, setPrice }) => {
  const [map, setMap] = useState(null);
  const [directionsDisplay, setDirectionsDisplay] = useState(null);
  const [output, setOutput] = useState("");
  const mapRef = useRef(null);

  const baseRate = 250; // base rate in currency units
  const perKmRate = 10; // additional cost per kilometer

  useEffect(() => {
    // Retrieve the user's location from localStorage
    const storedProviderLocation = JSON.parse(
      localStorage.getItem("providerLocation")
    );
    if (!storedProviderLocation) {
      setOutput("Provider location is not available.");
      return;
    }

    const providerLat = storedProviderLocation.lat;
    const providerLng = storedProviderLocation.lon;

    // Initialize the map options
    const myLatLng = { lat: providerLat, lng: providerLng };
    const mapOptions = {
      center: myLatLng,
      zoom: 7,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    };

    // Create map and set it to state
    const mapObj = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(mapObj);

    // Initialize DirectionsService and DirectionsRenderer
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(mapObj);
    setDirectionsDisplay(directionsRenderer);

    const userMarker = new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lon },
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

    const providerMarker = new window.google.maps.Marker({
      position: {
        lat: providerLat,
        lng: providerLng,
      },
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

    // Function to calculate route
    const calcRoute = () => {
      const request = {
        origin: new window.google.maps.LatLng(providerLat, providerLng),
        destination: new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lon
        ),
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

          setPrice(calculatedPrice); // Pass price to ProviderDetails component

          // Set the output with distance, duration, and price
          setOutput(
            `<div class='mt-2 alert-info'>
              <b>Distance - </b> ${distanceText}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <b>Duration - </b> ${durationText}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <b>Price - </b> ₹${calculatedPrice.toFixed(0)}
            </div>`
          );

          directionsRenderer.setDirections(result);
        } else {
          directionsRenderer.setDirections({ routes: [] });
          mapObj.setCenter(myLatLng);
          setOutput(
            "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Could not retrieve driving distance.</div>"
          );
        }
      });
    };

    // Calculate route on component mount
    calcRoute();

    // Clean up on component unmount
    return () => {
      directionsRenderer.setMap(null);
    };
  }, [userLocation, setPrice]);

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

export default ProviderGoogleMap;
