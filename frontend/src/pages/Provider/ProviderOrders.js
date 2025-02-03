import React, { useEffect, useState } from "react";
import axios from "axios";
import PaymentPage from "./PaymentPage";
import ProviderGoogleMap from "../../components/ProviderGoogleMap.js";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import toast from "react-hot-toast";

const socket = io.connect("http://localhost:8008");
const ProviderOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);
  const [price, setPrice] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [distance, setDistance] = useState(null); // Store calculated distance
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchProviderOrders = async () => {
      const provider = JSON.parse(localStorage.getItem("provider"));
      const providerId = provider?.id;
      try {
        const response = await axios.post(
          `http://localhost:8008/provider/order/getOrder`,
          { providerId }
        );
        setOrders(response.data.orders || []);

        const storedProviderLocation = JSON.parse(
          localStorage.getItem("providerLocation")
        );

        if (storedProviderLocation) {
          const providerLat = storedProviderLocation.lat;
          const providerLng = storedProviderLocation.lon;

          const calculatedDistance = calculateDistance(
            providerLat,
            providerLng
          );
          setDistance(calculatedDistance);
        }
      } catch (err) {
        setError("Error fetching provider's orders");
      } finally {
        setLoading(false);
      }
    };
    // Add socket listeners
    const addSocketListeners = () => {
      socket.on("new-order", (order) => {
        // console.log("New order received", order);

        // Extract relevant fields from the new order data
        const newOrder = {
          userName: order.orders[0].provider.orders[0]?.userName,
          userEmail: order.orders[0].email,
          userPhone: order.orders[0].provider.phone,
          scheduleTime: order.orders[0].scheduleTime,
          status: order.orders[0].status,
          price: order.totalPrice,
          userLocation: order.userLocation,
          cartId: order.orders[0].cartId,
          createdAt: new Date().toISOString(),
        };

        // Avoid adding duplicate orders
        setOrders((prevOrders) =>
          prevOrders.some((o) => o.cartId === newOrder.cartId)
            ? prevOrders
            : [...prevOrders, newOrder]
        );

        // Show a notification
        toast.success(
          `New order received from ${newOrder.userName || "unknown customer"}!`,
          {
            position: "top-right",
          }
        );
      });

      socket.on("order-status-updated", (data) => {
        // console.log("Order status updated:", data);

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.cartId === data.orderId
              ? { ...order, status: data.newStatus }
              : order
          )
        );
      });

      // Listen for 'payment-details' events
      socket.on("payment-details", (payload) => {
        // console.log("Payment details received---->", payload);

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.cartId === payload.orderId
              ? {
                  ...order,
                  transactionId: payload.transactionId,
                  paymentStatus: "Paid",
                }
              : order
          )
        );
      });
    };

    // Cleanup listeners on unmount
    const removeSocketListeners = () => {
      socket.off("new-order");
      socket.off("order-status-updated");
      socket.off("payment-details");
    };

    fetchProviderOrders();
    addSocketListeners();

    // Cleanup function to remove listeners
    return () => {
      removeSocketListeners();
    };
  }, []);

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
  const providerEmail = JSON.parse(localStorage.getItem("provider"))?.email;
  const providerName = JSON.parse(localStorage.getItem("provider"))?.name;

  const updateOrderStatus = async (
    orderId,
    userId,
    providerEmail,
    scheduleTime,
    newStatus,
    cartId
  ) => {
    // console.log(orderId, userId, providerEmail, scheduleTime, newStatus);
    try {
      await axios.post(`http://localhost:8008/provider/order/updateStatus`, {
        orderId,
        userId,
        providerEmail,
        scheduleTime,
        newStatus,
        cartId,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const toggleMapVisibility = () => {
    setShowMap(!showMap);
  };
  const toggleOrderDetails = (index) => {
    setExpandedOrderIndex(expandedOrderIndex === index ? null : index);
  };

  const getNextStatusOptions = (currentStatus) => {
    return ["accepted", "onsite", "work-in-progress", "completed"];
  };

  const handleGetPayment = async (
    providerName,
    providerEmail,
    status,
    userId,
    scheduleTime,
    price,
    orderId
  ) => {
    try {
      await axios.post(`http://localhost:8008/order/confirmPayment`, {
        providerName,
        providerEmail,
        status,
        userId,
        scheduleTime,
        price,
        orderId,
      });
      // toast.success("Re-directing to payment page");
      navigate("/order/confirmPayment", {
        state: {
          userId,
          scheduleTime,
          price,
        },
      });
    } catch (error) {
      console.error("Error in making payment:", error);
    }
  };

  if (loading)
    return <h1 className="text-center text-xl font-semibold">Loading...</h1>;
  if (error) return <h1 className="text-center text-red-500">{error}</h1>;

  // Replace with your Google Maps API key
  const API_KEY = "AIzaSyDScEvWjfP78uP75lfPbdqw7uVqpFltiUk";

  const handleClick = () => {
    window.location.reload(); // Reload the page
  };

  const fetchAddressFromCoordinates = async (lat, lon) => {
    try {
      setError(""); // Clear previous error messages
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const fetchedAddress = data.results[0].formatted_address;
        setAddress(fetchedAddress);
      } else {
        setError("Unable to fetch address. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while fetching the address.");
    }
  };
  return (
    <div className="bg-blue-100 min-h-auto py-5">
      <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">
        Your Orders
      </h1>
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded ml-4 mb-4"
      >
        Fetch Orders
      </button>

      {paymentDetails ? (
        <PaymentPage {...paymentDetails} /> // Pass payment details as props
      ) : orders.length > 0 ? (
        <div className="space-y-4 px-10">
          {orders.map((order, index) => (
            <div
              key={order._id || `order-${index}`}
              className="bg-gray-50 p-2 rounded-lg shadow"
            >
              <div
                className="flex justify-between ease-in-out transform hover:shadow-[0_8px_10px_rgba(255,99,71,0.4)] items-center transition duration-500 hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleOrderDetails(index)}
              >
                <div className="flex">
                  <h2 className="text-lg font-semibold border-b p-1">
                    Order #{index + 1} &nbsp;||&nbsp; {order.userName}{" "}
                    &nbsp;||&nbsp;{" "}
                    {new Date(order.scheduleTime).toLocaleString("en-US", {
                      weekday: "long", // Full day name
                      year: "numeric",
                      month: "long", // Full month name
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // 12-hour format
                    })}
                  </h2>
                </div>
                <div className="flex space-x-4">
                  {/* Order Status */}
                  <span
                    className={`py-1 px-2 w-42 flex items-center justify-center rounded text-center text-md ${
                      order.status === "completed"
                        ? "bg-green-500 text-white"
                        : order.status === "placed"
                        ? "bg-blue-500 text-white"
                        : order.status === "onsite"
                        ? "bg-yellow-500 text-black"
                        : order.status === "work-in-progress"
                        ? "bg-orange-500 text-white"
                        : order.status === "cancelled"
                        ? "bg-red-500 text-white"
                        : "bg-gray-500 text-white" // Default fallback
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* Payment Status */}
                  <span
                    className={`py-1 px-2 w-16 rounded text-md ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-500 text-white"
                        : "bg-blue-300 text-black"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {expandedOrderIndex === index && (
                <div className="mt-4">
                  <span className="text-3xl font-semibold text-red-400">
                    {order.userName}
                  </span>

                  <h5 className="text-blue-500 hover:underline cursor-pointer">
                    {order.userEmail}
                  </h5>

                  <h5 className="">{order.userPhone}</h5>

                  <p className="text-2xl mt-2 font-bold text-green-600">
                    ₹{order.price}
                  </p>

                  <button
                    className="py-1 px-2 bg-green-600 text-sm text-white rounded-lg shadow-md transform transition duration-200 hover:bg-green-700 hover:shadow-lg focus:outline-none mt-2"
                    onClick={() =>
                      fetchAddressFromCoordinates(
                        order.userLocation.lat,
                        order.userLocation.lon
                      )
                    }
                  >
                    Get Address
                  </button>

                  {/* Display Fetched Address or Error */}
                  {address && (
                    <p className="mt-2 text-green-600">
                      <b>Address:</b> {address}
                    </p>
                  )}
                  {error && (
                    <p className="mt-2 text-red-600">
                      <b>Error:</b> {error}
                    </p>
                  )}
                  <p>
                    Order Placed At :{" "}
                    <strong>
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </strong>
                  </p>
                  <p>
                    Scheduled Time :{" "}
                    <strong>
                      {new Date(order.scheduleTime).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </strong>
                  </p>
                  <div>
                    <button
                      className={`py-2 px-4 mt-2 rounded-lg shadow-lg transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                        order.status === "completed" ||
                        order.status === "cancelled"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:scale-110 hover:shadow-2xl"
                      }`}
                      onClick={toggleMapVisibility}
                      disabled={
                        order.status === "completed" ||
                        order.status === "cancelled"
                      } // Disable the button if status is "completed"
                    >
                      {order.status === "completed" ||
                      order.status === "cancelled"
                        ? "Map Unavailable"
                        : showMap
                        ? "Hide Map"
                        : "Track Location"}
                    </button>

                    {showMap && order.status !== "completed" && (
                      <div className="mt-4 mb-4 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-700">
                        <ProviderGoogleMap
                          userLocation={order.userLocation}
                          setPrice={setPrice}
                        />
                        {price && (
                          <p className="mt-4 text-lg font-semibold">
                            Estimated Price: ₹{price.toFixed(0)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {order.status === "placed" && (
                    <div className="mt-3">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={() => {
                          const newStatus = "accepted"; // Set the status to "accepted"
                          updateOrderStatus(
                            order._id,
                            order.userId._id,
                            providerEmail,
                            order.scheduleTime,
                            newStatus,
                            order.cartId
                          );
                          // Emit the status update to the socket
                          socket.emit("update-order-status", {
                            orderId: order.cartId,
                            userId: order.userId._id,
                            newStatus,
                          });
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {
                          const newStatus = "cancelled"; // Set the status to "cancelled"
                          updateOrderStatus(
                            order._id,
                            order.userId._id,
                            providerEmail,
                            order.scheduleTime,
                            newStatus,
                            order.cartId
                          );
                          // Emit the status update to the socket
                          socket.emit("update-order-status", {
                            orderId: order.cartId,
                            userId: order.userId._id,
                            newStatus,
                          });
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Dropdown for Updating Status */}
                  {[
                    "accepted",
                    "onsite",
                    "work-in-progress",
                    "completed",
                  ].includes(order.status) &&
                    order.status !== "cancelled" && (
                      <div className="mt-2 flex ">
                        <label
                          htmlFor={`status-${order._id}`}
                          className="block text-gray-700 mb-2 mr-2 mt-2"
                        >
                          Update Status:
                        </label>
                        <select
                          id={`status-${order._id}`}
                          className={`ml-2 border rounded-md p-2 ${
                            order.status === "cancelled" ||
                            order.status === "completed"
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (order.status !== "completed" && newStatus) {
                              updateOrderStatus(
                                order._id,
                                order.userId._id,
                                providerEmail,
                                order.scheduleTime,
                                newStatus,
                                order.cartId
                              );

                              // Emit the status update to the socket
                              socket.emit("update-order-status", {
                                orderId: order.cartId,
                                userId: order.userId._id,
                                newStatus,
                              });
                            }
                          }}
                          disabled={
                            order.status === "completed" ||
                            order.status === "cancelled"
                          }
                        >
                          <option value="">Select Status</option>
                          <option value="accepted">Accepted</option>
                          <option value="onsite">Onsite</option>
                          <option value="work-in-progress">
                            Work in Progress
                          </option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    )}
                  <h6 className="text-red-400 text-sm mt-2 ">
                    (OrderId - {order.cartId})
                  </h6>
                  {/* Trigger Payment Page */}
                  {order.status === "completed" && (
                    <div className="mt-2">
                      <button
                        className={`${
                          order.paymentStatus === "Paid"
                            ? "bg-green-500 cursor-not-allowed"
                            : "bg-gray-500 hover:bg-green-700"
                        } text-white font-bold py-2 px-4 rounded`}
                        onClick={() =>
                          order.paymentStatus !== "Paid" &&
                          handleGetPayment(
                            providerName,
                            providerEmail,
                            order.status,
                            order.userId._id,
                            order.scheduleTime,
                            order.price,
                            order.cartId
                          )
                        }
                        disabled={order.paymentStatus === "Paid"} // Disable button if payment is already completed
                      >
                        {order.paymentStatus === "Paid"
                          ? "PAID"
                          : "Confirm Payment"}
                      </button>
                      {/* Display Transaction ID if Paid */}
                      {order.paymentStatus === "Paid" &&
                        order.transactionId && (
                          <p className="mt-2 text-green-700 font-semibold">
                            Transaction ID: {order.transactionId}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v2a4 4 0 108 0v-2m-4-6a4 4 0 110-8 4 4 0 010 8zm0 4v-4"
              />
            </svg>
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 mt-2 text-sm">
              Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderOrders;
