import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminGoogleMap from "../../components/AdminGoogleMap";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const socket = io.connect("http://localhost:8008");

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);
  const [price, setPrice] = useState(0); // State to store calculated price
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminOrders = async () => {
      const admin = JSON.parse(localStorage.getItem("admin"));
      const adminId = admin?.id;

      try {
        const response = await axios.post(
          "http://localhost:8008/admin/order/getOrder",
          { adminId }
        );
        setOrders(response.data.orders || []);
      } catch (err) {
        setError("Error fetching admin's orders");
        console.error(err);
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
        window.location.reload();
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
    };
    fetchAdminOrders();
    addSocketListeners();

    // Cleanup function to remove listeners
    return () => {
      removeSocketListeners();
    };
  }, []);

  const toggleMapVisibility = () => {
    setShowMap(!showMap);
  };

  const updateOrderStatus = async (
    orderId,
    newStatus,
    userId,
    scheduleTime,
    providerEmail
  ) => {
    try {
      await axios.post(`http://localhost:8008/admin/order/updateStatus`, {
        orderId,
        newStatus,
        userId,
        scheduleTime,
        providerEmail,
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

  const toggleOrderDetails = (index) => {
    setExpandedOrderIndex(expandedOrderIndex === index ? null : index);
  };

  if (loading) {
    return <h1 className="text-center text-xl font-semibold">Loading...</h1>;
  }
  if (error) {
    return <h1 className="text-center text-red-500">{error}</h1>;
  }

  return (
    <div className="bg-violet-100 px-10 min-h-auto py-5">
      <h1 className="text-4xl font-bold text-center py-6">Admin Orders</h1>
      {orders.map((payload, index) => {
        return <p key={index}>{payload.order}</p>;
      })}

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="bg-gray-50 transition transform hover:shadow-lg hover:-translate-y-1 py-3 px-6 rounded-lg shadow"
            >
              <div
                className="flex justify-between items-center transition duration-500 cursor-pointer"
                onClick={() => toggleOrderDetails(index)}
              >
                <div className="flex">
                  <h2 className="text-lg font-semibold border-b">
                    Order #{index + 1} &nbsp;|| {order.user.name}
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
                    &nbsp;||&nbsp; {order.provider.name}
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
                <div className="mt-2 text-gray-700">
                  <div className="flex justify-between mb-3">
                    <div className="w-full sm:w-1/2 pr-4">
                      <h3 className="text-xl font-bold mt-1 border-b py-2">
                        User Information
                      </h3>
                      <p className="text-red-400 text-xl">{order.user.name}</p>
                      <p className="text-gray-600">{order.user.phone}</p>
                    </div>

                    <div className="w-full sm:w-1/2 pl-4">
                      <h3 className="text-xl font-bold mt-1 border-b py-2">
                        Provider Information
                      </h3>
                      <p className="text-red-400 text-xl">
                        {order.provider.name}
                      </p>
                      <p className="text-gray-600">{order.provider.phone}</p>{" "}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold border-b py-2">
                    Order Details
                  </h3>
                  <p className="text-gray-600 mb-2 mt-2">
                    Order Placed At:{" "}
                    <strong>
                      {new Date(order.timeOrderPlaced).toLocaleString("en-US", {
                        weekday: "long", // Full day name
                        year: "numeric",
                        month: "long", // Full month name
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // 12-hour format
                      })}
                    </strong>
                  </p>
                  <p className="text-gray-600 mb-2">
                    Scheduled Time:{" "}
                    <strong>
                      {new Date(order.scheduleTime).toLocaleString("en-US", {
                        weekday: "long", // Full day name
                        year: "numeric",
                        month: "long", // Full month name
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // 12-hour format
                      })}
                    </strong>
                  </p>
                  <p className="text-2xl mt-2 font-bold text-green-600">
                    ₹{order.price}
                  </p>
                  <p>
                    Status :{" "}
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
                  <button
                    className={`py-2 px-2 mb-1 mt-3 rounded ${
                      order.status === "cancelled" ||
                      order.status === "completed"
                        ? "bg-gray-500 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={(e) => {
                      if (
                        order.status !== "cancelled" &&
                        order.status !== "completed"
                      ) {
                        toggleMapVisibility();
                      } else {
                        e.preventDefault(); // Prevent click event
                      }
                    }}
                    disabled={
                      order.status === "cancelled" ||
                      order.status === "completed"
                    }
                  >
                    {showMap ? "Hide Map" : "Track Location"}
                  </button>
                  {showMap && (
                    <div className="mt-2">
                      <h3 className="text-lg font-bold mt-4">Map and Route</h3>
                      <AdminGoogleMap
                        userLocation={order.user.location}
                        providerLocation={order.provider.location}
                        setPrice={setPrice}
                      />
                    </div>
                  )}
                  {/* Accept/Cancel Buttons for Placed Orders */}
                  {order.status === "placed" && (
                    <div className="mt-2 flex">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "accepted",
                            order.userId._id,
                            order.scheduleTime,
                            order.providerEmail
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "cancelled",
                            order.userId._id,
                            order.scheduleTime,
                            order.providerEmail
                          )
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {/* Update Status Dropdown */}
                  {order.status !== "completed" && (
                    <div className="mt-2 flex">
                      <label
                        htmlFor={`status-${order._id}`}
                        className="mt-2 text-gray-700 mb-2 flex"
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
                        onChange={(e) =>
                          updateOrderStatus(
                            order._id,
                            e.target.value,
                            order.userId._id,
                            order.scheduleTime,
                            order.providerEmail
                          )
                        }
                        disabled={
                          order.status === "cancelled" ||
                          order.status === "completed"
                        }
                      >
                        <option value="">Select Status</option>
                        <option value="accepted">Accepted</option>
                        <option value="onsite">On Site</option>
                        <option value="work-in-progress">
                          Work In Progress
                        </option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}
                  <h6 className="text-red-400 text-sm mt-2 ">
                    (OrderId - {order.cartId})
                  </h6>{" "}
                  {order.status === "completed" && (
                    <div className="mt-2">
                      <button
                        className={`font-bold py-2 px-4 rounded ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-500 text-white cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-700 text-white"
                        }`}
                        disabled={order.paymentStatus === "Paid"} // Disable button if payment is already completed
                      >
                        {order.paymentStatus === "Paid" ? "PAID" : "UNPAID"}
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

export default AdminOrders;
