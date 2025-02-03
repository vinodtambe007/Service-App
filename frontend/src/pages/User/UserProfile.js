import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]); // Track expanded orders

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8008/user/profile/${id}`
        );
        setUser(response.data);
      } catch (err) {
        setError("Error fetching user profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  // Toggle expanded state for an order
  const toggleOrderExpansion = (index) => {
    setExpandedOrders((prevExpanded) =>
      prevExpanded.includes(index)
        ? prevExpanded.filter((i) => i !== index)
        : [...prevExpanded, index]
    );
  };

  if (loading) {
    return <h1 className="text-center text-xl font-semibold">Loading...</h1>;
  }

  if (error) {
    return <h1 className="text-center text-red-500">{error}</h1>;
  }

  return (
    <div className="bg-gray-100 min-h-auto">
      <div className="max-w-full mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          {/* Profile Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {user.name}
            </h1>
            <p className="text-blue-600 hover:underline cursor-pointer text-lg mt-2 ">
              {user.email}
            </p>
          </div>

          {/* User Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold text-red-400 border-b pb-2">
                Personal Info
              </h2>
              <div className="mt-4 space-y-2 text-lg">
                <p>
                  <strong>Name : </strong> {user.name}
                </p>
                <p>
                  <strong>Email : </strong>
                  <span className="text-blue-700 hover:underline cursor-pointer">
                    {user.email}
                  </span>
                </p>
                <p>
                  <strong>Phone : </strong> {user.phone || "N/A"}
                </p>
              </div>
            </div>

            {user.location && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <h2 className="text-3xl font-semibold text-red-400 border-b pb-2">
                  Location
                </h2>
                <div className="mt-4 space-y-2 text-lg">
                  <p>
                    <strong>Latitude : </strong> {user.location.latitude}
                  </p>
                  <p>
                    <strong>Longitude : </strong> {user.location.longitude}
                  </p>
                  <p>
                    <strong>Address : </strong> {user.location.address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-red-400 border-b pb-2">
              Orders
            </h2>
            <div className="mt-6 space-y-4">
              {user.orders && user.orders.length > 0 ? (
                user.orders.map((order, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg shadow-lg transition transform hover:shadow-lg hover:-translate-y-1"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleOrderExpansion(index)}
                    >
                      <h3 className="text-gray-800 font-semibold text-lg">
                        Order #{index + 1} || {order.provider.name} ||{" "}
                        {new Date(order.scheduleTime).toLocaleString("en-US", {
                          weekday: "long", // Full day name
                          year: "numeric",
                          month: "long", // Full month name
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true, // 12-hour format
                        })}
                      </h3>
                    </div>

                    {/* Expanded Order Details */}
                    {expandedOrders.includes(index) && (
                      <div className="mt-4 text-md text-gray-700 space-y-2">
                        <p>
                          <strong>Provider Email : </strong>{" "}
                          {order.provider.email}
                        </p>
                        <p>
                          <strong>Provider Phone : </strong>{" "}
                          {order.provider.phone}
                        </p>
                        <p>
                          <strong>Order Placed : </strong>{" "}
                          {new Date(order.orderPlacedAt).toLocaleString(
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
                        </p>
                        <p>
                          <strong>Scheduled Time : </strong>{" "}
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
                        </p>
                        <p>
                          <strong>Status : </strong>{" "}
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
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No orders available</p>
              )}
            </div>
          </div>

          {/* Profile Metadata */}
          <div className="mt-8 text-md text-gray-500 border-t pt-4">
            <h2 className="text-lg font-bold text-red-400 border-b p-1">
              Account summary
            </h2>
            <p>
              <strong>Account created on : </strong>{" "}
              {new Date(user.createdAt).toLocaleString("en-US", {
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
              <strong>Last visited at : </strong>{" "}
              {new Date(user.updatedAt).toLocaleString("en-US", {
                weekday: "long", // Full day name
                year: "numeric",
                month: "long", // Full month name
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // 12-hour format
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
