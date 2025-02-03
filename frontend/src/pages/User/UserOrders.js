import React, { useEffect, useState } from "react";
import axios from "axios";
import FeedbackForm from "./FeedbackForm.js"; // Import FeedbackForm component
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import GoogleMapDirections from "../../components/GoogleMap.js";
import io from "socket.io-client";

const socket = io.connect("http://localhost:8008");

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [mapPrice, setMapPrice] = useState(null); // Store calculated price

  useEffect(() => {
    const fetchUserOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

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

      // Cleanup listeners on unmount

      try {
        const response = await axios.post(
          "http://localhost:8008/user/order/getOrder",
          { userId }
        );
        setOrders(response.data.orders || []);
      } catch (err) {
        setError("Error fetching user orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const removeSocketListeners = () => {
      socket.off("order-status-updated");
      socket.off("payment-details");
    };
    // const intervalId = setInterval(fetchUserOrders, 1000);
    // Cleanup interval on component unmount
    // return () => clearInterval(intervalId);
    fetchUserOrders();

    // Cleanup function to remove listeners
    return () => {
      removeSocketListeners();
    };
  }, []);

  const toggleOrderDetails = (index) => {
    setExpandedOrderIndex(expandedOrderIndex === index ? null : index);
  };
  const userLocation = JSON.parse(localStorage.getItem("userLocation"));
  const handleCancelOrder = async (orderId, providerEmail, scheduleTime) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    try {
      const response = await axios.post(
        "http://localhost:8008/user/order/cancelOrder",
        { userId, orderId, providerEmail, scheduleTime }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
      toast.success("Order cancelled successfully!");
    } catch (err) {
      toast.error("Error in cancelling order");
      console.error(err);
    }
  };
  const toggleMapVisibility = () => {
    setShowMap(!showMap);
  };
  const handleFeedback = (
    orderId,
    providerName,
    providerEmail,
    scheduleTime
  ) => {
    navigate("/user/order/feedbackForm", {
      state: { orderId, providerName, providerEmail, scheduleTime },
    });
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

  // Order statuses in sequence
  const orderStatuses = [
    "placed",
    "accepted",
    "onsite",
    "work-in-progress",
    "completed",
    "cancelled",
  ];

  // Get the index of the current order status
  const getStatusIndex = (status) => orderStatuses.indexOf(status);
  const isCancelDisabled = (status) => status !== "placed";

  if (loading) {
    return <h1 className="text-center text-xl font-semibold">Loading...</h1>;
  }
  if (error) {
    return <h1 className="text-center text-red-500">{error}</h1>;
  }

  return (
    <div className="bg-cyan-50 min-h-auto py-5">
      <h1 className="text-4xl font-bold text-center border-b p-2 text-gray-600 mb-2">
        Your Orders
      </h1>
      {orders.length > 0 ? (
        <div className="space-y-6 p-6 px-10">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className={`p-2 rounded-lg transition duration-500 hover:bg-gray-200 ease-in-out transform hover:shadow-[0_8px_10px_rgba(255,99,71,0.4)] ${
                order.paymentStatus === "Paid"
                  ? "bg-gray-200 opacity-75"
                  : "bg-gray-50"
              }`}
            >
              <div
                className="cursor-pointer text-lg font-semibold text-gray-800 flex justify-between items-center"
                onClick={() => toggleOrderDetails(index)}
              >
                {/* Left Side: Order Details */}
                <div>
                  <span className="text-black text-md">
                    Order #{index + 1} ||{" "}
                  </span>
                  <span className="text-green-600 text-md">
                    {order.provider?.name}
                  </span>{" "}
                  ||{" "}
                  <span className="text-blue-600 text-md">
                    {new Date(order.scheduleTime).toLocaleString("en-US", {
                      weekday: "long", // Full day name
                      year: "numeric",
                      month: "long", // Full month name
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // 12-hour format
                    })}
                  </span>
                </div>

                {/* Right Side: Status Information */}
                <div className="flex space-x-4">
                  {/* Order Status */}
                  <span
                    className={`py-1 px-2 w-42 flex items-center justify-center rounded text-center text-md ${
                      order.status === "completed"
                        ? "bg-green-500 text-white"
                        : order.status === "placed"
                        ? "bg-blue-500 text-white"
                        : order.status === "onsite"
                        ? "bg-yellow-500 text-white"
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
                    className={`py-1 px-2 w-20 rounded text-md ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-500 text-black"
                        : "bg-blue-300 text-black"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {expandedOrderIndex === index && (
                <div className="mt-4 text-gray-700">
                  <div className="mt-4">
                    <div className="relative flex items-center">
                      {orderStatuses.map((status, i) => {
                        const currentStatusIndex = getStatusIndex(order.status); // Get the index of the current status
                        const isActive = i === currentStatusIndex; // Active status
                        const isCompleted = i < currentStatusIndex; // Completed statuses
                        const isCancelled = order.status === "cancelled";

                        const stepClasses = isCancelled
                          ? i <= currentStatusIndex
                            ? "bg-red-500 text-white"
                            : "bg-gray-300 text-gray-500"
                          : isCompleted
                          ? "bg-green-500 text-white ml-28"
                          : isActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-500";

                        return (
                          <div
                            key={status}
                            className="flex items-center flex-1 relative"
                          >
                            {/* Connecting Line */}
                            {i < orderStatuses.length - 1 && (
                              <div
                                className={`absolute top-1/2 left-1/2 w-full h-1 transform -translate-y-1/2 ${
                                  i < currentStatusIndex
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                                style={{
                                  width:
                                    i < currentStatusIndex ? "100%" : "50%",
                                  zIndex: -1,
                                }}
                              ></div>
                            )}

                            {/* Step Indicator */}
                            <div
                              className={`z-10 w-8 h-8 flex items-center justify-center rounded-full font-bold mx-auto ${stepClasses}`}
                            >
                              {isCancelled && i === currentStatusIndex ? (
                                <span>&#10005;</span> // Cross mark for cancellation
                              ) : isCompleted || isActive ? (
                                <span>&#10003;</span> // Checkmark for completed or active steps
                              ) : (
                                i + 1 // Step number for pending steps
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Labels */}
                    <div className="flex justify-between mt-1 px-6 mx-20">
                      {orderStatuses.map((status, i) => (
                        <span
                          key={status}
                          className={`text-sm ${
                            i === getStatusIndex(order.status)
                              ? "font-bold text-black"
                              : "text-gray-500"
                          }`}
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {/* Left Section - Image */}
                    <div className="w-1/3">
                      <img
                        src={order.provider?.image || "default-image-url.jpg"}
                        alt={order.provider?.name}
                        className="w-96 h-96 rounded-full object-cover mx-auto transform hover:scale-110 hover:shadow-[0_12px_20px_rgba(60,90,255,0.4)] transition-transform duration-500"
                      />
                    </div>

                    {/* Right Section - Description and Buttons */}
                    <div className="w-2/3">
                      <h3 className="text-3xl font-bold text-blue-600 mb-1">
                        {order?.provider?.name}
                      </h3>

                      <h2 className=" text-red-400">
                        {order?.provider?.phone}
                      </h2>
                      <p className="text-gray-900 text-lg first-letter:text-4xl first-letter:font-bold first-letter:text-blue-400 mb-1">
                        {order.provider?.description || "N/A"}
                      </p>
                      <p className="text-2xl font-semibold text-green-600 mb-1">
                        Price: <strong> ₹{order.provider?.price || 0}</strong>
                      </p>
                      <p className="mb-2 text-gray-900">
                        Scheduled Time :{" "}
                        <strong>
                          {new Date(order.scheduleTime).toLocaleString(
                            "en-US",
                            {
                              weekday: "long", // Full day name
                              year: "numeric",
                              month: "long", // Full month name
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true, // 12-hour format
                            }
                          )}
                        </strong>
                      </p>
                      <p className="mb-1 text-gray-900">
                        Status : <strong> {order.status}</strong>
                      </p>

                      {/* Conditional Message for Service in Process */}
                      {/* Service in Process Message */}
                      {order.status !== "placed" &&
                        order.status !== "cancelled" && (
                          <p className="text-yellow-500 font-bold text-xl">
                            Service in Process
                          </p>
                        )}

                      {/* Buttons */}
                      <div className="flex items-center space-x-4 mt-2">
                        {/* View Location Button */}
                        <button
                          className={`py-2 px-4 bg-blue-500 text-white rounded-lg shadow-lg transform transition-transform ease-in-out duration-300 ${
                            order.status === "completed" ||
                            order.status === "cancelled"
                              ? "cursor-not-allowed opacity-50 shadow-none"
                              : "hover:bg-blue-600 hover:translate-y-1 hover:shadow-md active:translate-y-2 active:shadow-sm"
                          }`}
                          onClick={toggleMapVisibility}
                          disabled={
                            order.status === "completed" ||
                            order.status === "cancelled"
                          } // Disable if status is "completed"
                        >
                          {showMap ? "Hide Map" : "Track Location"}
                        </button>

                        {/* Cancel Order Button */}
                        {order.status === "placed" && (
                          <button
                            className={`py-2 px-4 rounded-lg transform transition-transform ease-in-out duration-300 ${
                              isCancelDisabled(order.status)
                                ? "bg-gray-500 cursor-not-allowed shadow-none"
                                : "bg-red-500 hover:bg-red-600 shadow-lg hover:translate-y-1 hover:shadow-md active:translate-y-2 active:shadow-sm"
                            }`}
                            disabled={isCancelDisabled(order.status)}
                            onClick={() => {
                              const newStatus = "cancelled"; // Set the status to "cancelled"
                              handleCancelOrder(
                                order._id,
                                order.provider?.email,
                                order.scheduleTime
                              );
                              // Emit the status update to the socket
                              socket.emit("update-order-status", {
                                orderId: order.cartId,
                                userId: order.userId._id,
                                newStatus,
                              });
                            }}
                          >
                            Cancel Order
                          </button>
                        )}

                        {/* Provide Feedback Button */}
                        {order.status === "completed" && (
                          <button
                            className="py-2 px-4 bg-green-600 text-white rounded-lg shadow-lg transform transition-transform ease-in-out duration-300 hover:bg-green-700 hover:translate-y-1 hover:shadow-md active:translate-y-2 active:shadow-sm"
                            onClick={() =>
                              handleFeedback(
                                order._id,
                                order.provider?.name,
                                order.provider?.email,
                                order.scheduleTime
                              )
                            }
                          >
                            Provide Feedback
                          </button>
                        )}
                      </div>

                      {/* Map Section */}
                      {showMap && (
                        <div className="mt-4 mb-4 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300">
                          <GoogleMapDirections
                            providerLocation={order.providerLocation}
                            userLocation={userLocation}
                            setPrice={setMapPrice}
                          />
                          {mapPrice && (
                            <p className="mt-4 text-lg font-semibold">
                              Estimated Price : ₹{mapPrice.toFixed(0)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Payment Success Message */}
                      {order.paymentStatus === "Paid" && (
                        <p className="mt-2 text-lg font-bold text-green-600">
                          Payment Successful! Transaction ID :{" "}
                          {order.transactionId}
                        </p>
                      )}

                      {order.status === "completed" && (
                        <div className="mt-2">
                          <button
                            className={`py-2 px-4 text-white font-bold rounded-lg shadow-lg transform transition-transform ease-in-out duration-300 ${
                              order.paymentStatus === "Paid"
                                ? "bg-green-500 cursor-not-allowed shadow-none"
                                : "bg-gray-500 hover:bg-green-700 hover:translate-y-1 hover:shadow-md active:translate-y-2 active:shadow-sm"
                            }`}
                            onClick={() =>
                              order.paymentStatus !== "Paid" &&
                              handleGetPayment(
                                order.provider.name,
                                order.provider.email,
                                order.status,
                                order.userId,
                                order.scheduleTime,
                                order.provider.price,
                                order.cartId
                              )
                            }
                            disabled={order.paymentStatus === "Paid"} // Disable button if payment is already completed
                          >
                            {order.paymentStatus === "Paid"
                              ? "PAID"
                              : "Confirm Payment"}
                          </button>
                        </div>
                      )}
                      {selectedOrder && (
                        <FeedbackForm
                          orderId={selectedOrder.orderId}
                          providerEmail={selectedOrder.providerEmail}
                          scheduleTime={selectedOrder.scheduleTime}
                          onClose={() => setSelectedOrder(null)}
                        />
                      )}
                      <h6 className="text-red-400 text-sm mt-2 ">
                        (OrderId - {order.cartId})
                      </h6>
                    </div>
                  </div>
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

export default UserOrders;
