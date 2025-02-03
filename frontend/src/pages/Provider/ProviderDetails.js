import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useStateContext } from "../../context/StateContext.js";
import StarRating from "../../components/StarRating.js";
import GoogleMapDirections from "../../components/GoogleMap.js"; //
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProviderDetails = () => {
  const { id } = useParams(); // Get the provider ID from the URL
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, setCart } = useStateContext();
  const [expandedOrders, setExpandedOrders] = useState([]); // Track expanded orders
  const [distance, setDistance] = useState(null); // Store calculated distance
  const [userLocationDisplay, setUserLocationDisplay] = useState(null); // For user's location
  const [price, setPrice] = useState(null); // New state for price
  const [showMap, setShowMap] = useState(false);
  const [mapPrice, setMapPrice] = useState(null); // Store calculated price
  const [userAddress, setUserAddress] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  // Get user coordinates from localStorage if not provided
  useEffect(() => {
    if (!userLocation) {
      const storedLocation = JSON.parse(localStorage.getItem("userLocation"));
      if (storedLocation) {
        setUserLocation({
          lat: storedLocation.lat,
          lng: storedLocation.lng,
        });
      }
    }
  }, [userLocation]);

  useEffect(() => {
    const fetchProviderProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8008/provider/profile/provider/${id}`
        );
        setProvider(response.data);
        // Get user's location from localStorage
        const storedUserLocation = JSON.parse(
          localStorage.getItem("userLocation")
        );

        if (storedUserLocation) {
          const userLat = storedUserLocation.lat;
          const userLng = storedUserLocation.lng;
          const providerLat = response.data.location.latitude;
          const providerLng = response.data.location.longitude;

          const calculatedDistance = calculateDistance(
            userLat,
            userLng,
            providerLat,
            providerLng
          );
          setDistance(calculatedDistance);
        }
      } catch (err) {
        setError("Error fetching provider profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderProfile();
  }, [id]);
  // Function to calculate distance using the Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    // console.log(lat1, lng1, lat2, lng2);
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;
    // console.log(distanceInKm);
    return distanceInKm.toFixed(2); // Round to 2 decimal places
  };
  // Toggle the expanded state for an order
  const toggleOrderExpansion = (index) => {
    setExpandedOrders((prevExpanded) =>
      prevExpanded.includes(index)
        ? prevExpanded.filter((i) => i !== index)
        : [...prevExpanded, index]
    );
  };
  const handleAddressSubmit = async () => {
    if (!userAddress.trim()) {
      toast.error("Please enter a valid address");
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: userAddress,
            key: "AIzaSyDScEvWjfP78uP75lfPbdqw7uVqpFltiUk", // Replace with your API key
          },
        }
      );

      if (response.data.status === "OK") {
        const location = response.data.results[0].geometry.location;
        setUserLocation(location);
        console.log("Latitude:", location.lat, "Longitude:", location.lng);
        // Save the coordinates to localStorage
        localStorage.setItem(
          "userLocation",
          JSON.stringify({ lat: location.lat, lng: location.lng })
        );
        toast.success("Coordinates retrieved successfully");
      } else {
        console.error("Error retrieving coordinates:", response.data.status);
        toast.error("Could not retrieve coordinates. Try again.");
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
      toast.error("Error fetching coordinates");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coordinates = { lat: latitude, lng: longitude };
          setUserLocation(coordinates);
          localStorage.setItem("userLocation", JSON.stringify(coordinates)); // Save to localStorage
        },
        (error) => {
          alert("Unable to retrieve your location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  const toggleMapVisibility = () => {
    setShowMap(!showMap);
  };
  // Add item to both frontend (localStorage) and backend
  const addToCart = async (provider) => {
    if (price === null) {
      toast.error("Please check service engg. location");
      return;
    }
    setCart((prevCart) => [...prevCart, provider]);
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;
    const userLocation = JSON.parse(localStorage.getItem("userLocation"));
    const userName = user.name; // You should replace this with the actual user's name
    const scheduleTime = new Date().toISOString(); // Replace this with the desired schedule time
    const finalPrice = price.toFixed(0);

    try {
      await axios.post(`http://localhost:8008/cart/addToCart`, {
        provider, // Send the full provider object
        userId,
        userName,
        userLocation, // Add userLocation here
        scheduleTime,
        finalPrice,
      });
      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

      // Add new item to cart
      const updatedCart = [...existingCart, provider];

      // Save updated cart back to local storage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Update state
      setCart(updatedCart);
      toast.success("Service Added to Cart");
      navigate("/cart/getCartItems");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return <h1 className="text-center text-xl font-semibold">Loading...</h1>;
  }
  if (error) {
    return <h1 className="text-center text-red-500">{error}</h1>;
  }

  return (
    <div className="bg-gray-100 min-h-auto">
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg">
        <div className="p-6 flex flex-col md:flex-row">
          {/* Left Section: Provider Info */}
          <div className="md:w-1/3 text-center">
            {provider.image && (
              <img
                src={provider.image}
                alt={provider.name}
                className="w-80 h-80 object-cover mx-auto rounded-full transition duration-700 shadow-2xl hover:shadow-[0_15px_30px_rgba(255,99,71,0.4)] transform hover:scale-110"
              />
            )}
            <h1 className="text-4xl font-bold mt-8 text-red-400">
              {provider.name}
            </h1>
            <p className="text-gray-600 text-xl mt-2">
              <span className="font-medium text-gray-700">Email : </span>{" "}
              <span className="text-blue-500 hover:underline">
                {provider.email}
              </span>
            </p>

            <p className="text-gray-600 text-xl mt-1">
              <span className="font-medium text-gray-700">Phone : </span>{" "}
              {provider.phone}
            </p>
          </div>

          {/* Right Section: Details */}
          <div className="md:w-2/3 mt-6 md:mt-0 md:pl-6 space-y-4">
            <p className="text-gray-900 text-lg first-letter:text-4xl first-letter:font-bold first-letter:text-blue-300">
              {provider.description}
            </p>

            <div className="flex text-2xl">
              <span className="text-2xl mr-2">
                <strong>Rating - </strong>
              </span>
              <StarRating
                rating={provider?.totalRating?.average}
                count={provider?.totalRating?.count}
              />
            </div>

            {/* Address Input Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Service Address</h2>
              <h6>(enter the address where you want the service)</h6>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-1/2 p-2 border border-gray-300 rounded-sm mb-2"
              />
              <button
                onClick={handleAddressSubmit}
                className="py-2 px-4 bg-green-600 text-white rounded-sm shadow-md transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none"
              >
                Fetch Location
              </button>
              {/* Get Current Location Button */}
              <button
                className="ml-4 py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md transform transition duration-200 hover:bg-blue-700 hover:scale-105 hover:shadow-lg focus:outline-none mt-2"
                onClick={getCurrentLocation}
              >
                Current Location
              </button>
            </div>

            {userLocation && (
              <p className="text-lg font-semibold text-green-600">
                Latitude: {userLocation.lat}, Longitude: {userLocation.lng}
              </p>
            )}

            <div>
              {/* Toggle Map Visibility */}
              <button
                className="py-2 px-4 bg-green-600 text-white rounded-lg shadow-md transform transition duration-200 hover:bg-green-700 hover:scale-105 hover:shadow-lg focus:outline-none"
                onClick={toggleMapVisibility}
              >
                {showMap ? "Hide Map" : "Track Location"}
              </button>

              {/* Map Section */}
              {showMap && (
                <div className="mt-4 mb-4 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <GoogleMapDirections
                    providerLocation={{
                      lat: provider.location.latitude,
                      lng: provider.location.longitude,
                    }}
                    userLocation={userLocation}
                    setPrice={setPrice}
                  />
                </div>
              )}
              {/* Show an error if user coordinates are not available */}
              {showMap && !userLocation && (
                <p className="text-red-600">
                  User coordinates are not available.
                </p>
              )}
            </div>

            {price && (
              <p className="text-lg font-semibold text-green-600">
                Estimated Price: ₹{price.toFixed(0)}
              </p>
            )}

            <button
              onClick={() => addToCart(provider)}
              className="py-2 px-6 bg-green-600 text-white rounded-lg shadow-md transform transition duration-200 hover:bg-green-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
        {/* Reviews Section */}

        <div className="p-4 border-t">
          <h2 className="text-xl text-gray-500 font-semibold mb-2">Reviews</h2>
          {provider.orders && provider.orders.length > 0 ? (
            // Check if any reviews exist across all orders
            provider.orders.some(
              (order) => order.reviews && order.reviews.length > 0
            ) ? (
              provider.orders.map(
                (order, index) =>
                  order.reviews && order.reviews.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {order.reviews.map((review, reviewIndex) => (
                        <div key={reviewIndex} className="ml-3 border-b p-1">
                          <div className="flex items-center">
                            <span className="mr-2">
                              <strong>Star - </strong>
                            </span>
                            <StarRating rating={review.star} />
                          </div>
                          <p>
                            <strong>Comment - </strong>
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null // Skip orders with no reviews
              )
            ) : (
              // Show "No reviews available" only once if no reviews exist in all orders
              <p className="text-gray-600">No reviews available</p>
            )
          ) : (
            <p className="text-gray-600">No orders yet booked</p>
          )}
        </div>

        {/* Orders Section */}
        <div className="p-4 border-t">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Summary</h2>
          {provider.orders && provider.orders.length > 0 ? (
            provider.orders.map((order, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 border border-blue-400 rounded-lg shadow-lg mt-1"
              >
                <div
                  className="text-md font-semibold cursor-pointer"
                  onClick={() => toggleOrderExpansion(index)}
                >
                  {/* Order Number with different color */}
                  <span className="text-blue-600 text-md">
                    Order #{index + 1} -{" "}
                  </span>
                  {/* Schedule Time with different color */}
                  <span className="text-green-600 text-md">
                    {new Date(order.scheduleTime).toLocaleString("en-US", {
                      weekday: "long", // Full day name
                      year: "numeric",
                      month: "long", // Full month name
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // 12-hour format
                    })}
                  </span>{" "}
                  {/* Status with different color */}
                  <span>- {order.status}</span>
                </div>

                {/* Expandable Section */}
                {expandedOrders.includes(index) && (
                  <div className="text-gray-700 space-y-2 mt-2">
                    <p>
                      <strong>Order Placed At - </strong>{" "}
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        weekday: "long", // Full day name
                        year: "numeric",
                        month: "long", // Full month name
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // 12-hour format
                      })}
                    </p>
                    <p>
                      <strong>Scheduled Time - </strong>{" "}
                      {new Date(order.scheduleTime).toLocaleString("en-US", {
                        weekday: "long", // Full day name
                        year: "numeric",
                        month: "long", // Full month name
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // 12-hour format
                      })}
                    </p>
                    <p>
                      <strong>Status - </strong>{" "}
                      <span
                        className={`px-2 py-1 text-md rounded ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>

                    {/* Reviews */}
                    {order.reviews && order.reviews.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {order.reviews.map((review, reviewIndex) => (
                          <div key={reviewIndex} className="ml-4"></div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No reviews available</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No orders yet booked</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
