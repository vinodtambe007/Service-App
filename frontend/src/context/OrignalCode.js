import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminGoogleMap from "../../components/AdminGoogleMap";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);
  const [price, setPrice] = useState(0); // State to store calculated price
  const [showMap, setShowMap] = useState(false);

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
    // Set interval to fetch every 5 seconds
    const intervalId = setInterval(fetchAdminOrders, 5000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    // fetchAdminOrders();
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

  const getOrderBackgroundColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-200";
      case "onsite":
        return "bg-yellow-200";
      case "work-in-progress":
        return "bg-orange-200";
      case "completed":
        return "bg-gray-300 opacity-70";
      case "cancelled":
        return "bg-gray-300 opacity-30";
      default:
        return "bg-gray-100";
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
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg mt-12">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className={`p-6 rounded-lg shadow ${getOrderBackgroundColor(
                order.status
              )}`}
            >
              <div
                className="cursor-pointer text-md font-semibold text-gray-800"
                onClick={() => toggleOrderDetails(index)}
              >
                Order #{index + 1} &nbsp;|| {order.user.name}
                &nbsp;||&nbsp;
                {expandedOrderIndex === index ? "Hide Details" : "Show Details"}
                &nbsp;||&nbsp; {new Date(order.scheduleTime).toLocaleString()}
                &nbsp;||&nbsp;
                {order.status}
                &nbsp;||&nbsp; {order.paymentStatus}
              </div>

              {expandedOrderIndex === index && (
                <div className="mt-2 text-gray-700">
                  <div className="flex justify-between">
                    <div className="w-full sm:w-1/2 pr-4">
                      <h3 className="text-lg font-bold mt-1">
                        User Information
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Name: {order.user.name}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Phone: {order.user.phone}
                      </p>
                    </div>

                    <div className="w-full sm:w-1/2 pl-4">
                      <h3 className="text-lg font-bold mt-1">
                        Provider Information
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Name: {order.provider.name}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Phone: {order.provider.phone}
                      </p>{" "}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1">Order Details</h3>
                  <p className="text-gray-600 mb-2">
                    Order Placed At:{" "}
                    {new Date(order.timeOrderPlaced).toLocaleString()}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Scheduled Time:{" "}
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
                  <p className="text-gray-600 mb-2">Price: {order.price}</p>
                  <p className="text-gray-600 mb-2">Status: {order.status}</p>
                  <button
                    className={`py-2 px-2 mb-2 rounded ${
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
                    {showMap ? "Hide Map" : "View Location"}
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
                    <div className="mt-2">
                      <label
                        htmlFor={`status-${order._id}`}
                        className=" text-gray-700 mb-2 flex"
                      >
                        Update Status:
                      </label>
                      <select
                        id={`status-${order._id}`}
                        className="border rounded-md p-2"
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
                  )}{" "}
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
