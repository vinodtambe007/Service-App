const loadGoogleMapsAPI = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  // console.log("ssssssssssssssss", apiKey);
  if (!apiKey) {
    console.error("Google Maps API key is not defined. Check your .env file.");
    return;
  }

  // console.log("Google Maps API key:", apiKey);

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    console.log("Google Maps API loaded successfully!");
  };
  script.onerror = () => {
    console.error("Failed to load Google Maps API.");
  };
  document.head.appendChild(script);
};

loadGoogleMapsAPI();
