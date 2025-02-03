import React, { useState, useRef, useEffect } from "react";

const GoogleMapDirections = ({ providerLocation, userLocation, setPrice }) => {
  const [map, setMap] = useState(null);
  const [directionsDisplay, setDirectionsDisplay] = useState(null);
  const [output, setOutput] = useState("");
  const mapRef = useRef(null);

  const baseRate = 250; // base rate in currency units
  const perKmRate = 10; // additional cost per kilometer

  useEffect(() => {
    if (!userLocation || !providerLocation) return;
    // Retrieve the user's location from localStorage

    const userLat = userLocation.lat;
    const userLng = userLocation.lng;

    // Initialize the map options
    const myLatLng = { lat: userLat, lng: userLng };
    const mapOptions = {
      center: myLatLng,
      zoom: 7,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    };

    // Create map and set it to state
    const mapObj = new window.google.maps.Map(mapRef.current, mapOptions);
    // Initialize DirectionsService and DirectionsRenderer
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(mapObj);
    // setDirectionsDisplay(directionsRenderer);

    const providerMarker = new window.google.maps.Marker({
      position: {
        lat: providerLocation.lat,
        lng: providerLocation.lng,
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

    // Function to calculate route
    const calcRoute = () => {
      const request = {
        origin: new window.google.maps.LatLng(userLat, userLng),
        destination: new window.google.maps.LatLng(
          providerLocation.lat,
          providerLocation.lng
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
            `<div class='mt-2 p-3 bg-blue-100 text-blue-800 rounded-lg shadow-md border-l-4 border-blue-600'>
               <b class='font-semibold'>Distance from your location : </b> <span class='text-pink-600'>${distanceText}</span>
               &nbsp;&nbsp;&nbsp;&nbsp;
               <b class='font-semibold'>Time duration : </b> <span class='text-blue-600'>${durationText}</span>
               &nbsp;&nbsp;&nbsp;&nbsp;
               <b class='font-semibold'>Estimated Cost : </b> <span class='text-green-600'>₹${calculatedPrice.toFixed(
                 0
               )}</span>
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
  }, [providerLocation, userLocation, setPrice]);

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

export default GoogleMapDirections;
