import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useStateContext } from "../../context/StateContext.js";
import StarRating from "../../components/StarRating.js";
import GoogleMapDirections from "../../components/GoogleMap.js"; //
import toast from "react-hot-toast";

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
          const userLng = storedUserLocation.lon;
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
  const toggleMapVisibility = () => {
    setShowMap(!showMap);
  };
  // Add item to both frontend (localStorage) and backend
  const addToCart = async (provider) => {
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

      toast.success("Service Added to Cart");
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
    <div className="bg-slate-200 min-h-screen py-12">
      {" "}
      {/* Wrapper div for background color */}
      <div className="max-w-2xl mx-auto p-6 md:p-8 bg-slate-300 shadow-xl rounded-lg mt-12">
        {/* Display provider image */}
        {provider.image && (
          <div className="text-center mb-8">
            <img
              src={provider.image}
              alt={`${provider.name}'s profile`}
              className="mx-auto h-60 w-96 object-cover rounded-xl shadow-xl"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold text-center mb-8">{provider.name}</h1>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <span className="text-lg font-semibold text-gray-700">
              Email -{" "}
            </span>
            <span className="text-gray-600">{provider.email}</span>
          </div>
          <div className="border-b pb-4">
            <span className="text-lg font-semibold text-gray-700">
              Phone -{" "}
            </span>
            <span className="text-gray-600">{provider.phone}</span>
          </div>

          {/* Display Calculated Price */}
          {price && (
            <div className="mt-4 text-lg font-semibold text-gray-700">
              <p>Price - ₹{price.toFixed(0)}</p>
            </div>
          )}
          {/* Display both provider and user locations on Google Maps */}
          {provider.location && userLocationDisplay && (
            <div className="border-b pb-2">
              <p className="text-lg font-semibold text-gray-700">Maps</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"></div>
            </div>
          )}

          <div className="border-b pb-2">
            <p className="text-lg font-semibold text-gray-700">
              Description -{" "}
            </p>
            <p className="text-gray-600">{provider.description}</p>
          </div>

          <button
            className="py-1 px-2 mt-4 bg-blue-500 text-white hover:bg-blue-600 rounded"
            onClick={toggleMapVisibility}
          >
            {showMap ? "Hide Map" : "View Location"}
          </button>
          {showMap && (
            <div className="mt-4">
              <GoogleMapDirections
                providerLocation={provider.location}
                setPrice={setPrice}
              />
              {mapPrice && (
                <p className="mt-4 text-lg font-semibold">
                  Estimated Price: ₹{price.toFixed(0)}
                </p>
              )}
            </div>
          )}
          {/* Orders (Array) */}
          <div className="border-b pb-2">
            <h2 className="text-xl font-semibold">Orders -</h2>
            <div className="space-y-4 mt-1">
              {provider.orders && provider.orders.length > 0 ? (
                provider.orders.map((order, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-lg mt-1"
                  >
                    <div
                      className="cursor-pointer text-md font-semibold text-gray-800"
                      onClick={() => toggleOrderExpansion(index)}
                    >
                      Order #{index + 1} -{" "}
                      {new Date(order.scheduleTime).toLocaleDateString("en-GB")}{" "}
                      -{" "}
                      {new Date(order.scheduleTime).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}{" "}
                      - {order.status}
                    </div>

                    {expandedOrders.includes(index) && (
                      <div className="text-gray-700 space-y-2 mt-2">
                        <p>
                          <strong>Order Placed At - </strong>{" "}
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p>
                          <strong>Scheduled Time - </strong>{" "}
                          {new Date(order.scheduleTime).toLocaleString()}
                        </p>
                        <p>
                          <strong>Status - </strong> {order.status}
                        </p>

                        {order.reviews && order.reviews.length > 0 ? (
                          <div className="space-y-2 mt-2">
                            <h3 className="text-lg font-semibold">
                              Reviews -{" "}
                            </h3>
                            {order.reviews.map((review, reviewIndex) => (
                              <div key={reviewIndex} className="ml-4">
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

              <h2 className="text-xl font-semibold">Reviews - </h2>
              {provider.orders && provider.orders.length > 0 ? (
                provider.orders.map((order, index) => (
                  <div key={index}>
                    <div className="text-gray-700 space-y-2 mt-2">
                      {order.reviews && order.reviews.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {order.reviews.map((review, reviewIndex) => (
                            <div key={reviewIndex} className="ml-4">
                              <div className="flex items-center">
                                <p className="mr-2">
                                  <strong>Star - </strong>
                                </p>
                                <StarRating rating={review.star} />
                              </div>
                              <p>
                                <strong>Comment - </strong> {review.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No reviews available</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No orders yet booked</p>
              )}
            </div>
          </div>
          <button
            onClick={() => addToCart(provider)}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
