import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import StarRating from "../../components/StarRating.js";

const AdminProfile = () => {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]); // Track expanded orders

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8008/admin/profile/admin/${id}`
        );
        setAdmin(response.data);
      } catch (err) {
        setError("Error fetching admin profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [id]);

  // Toggle the expanded state for an order
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
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          {/* Profile Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {admin.name}
            </h1>
            <p className="text-blue-600 hover:underline cursor-pointer text-lg mt-2">
              {admin.email}
            </p>
          </div>

          {/* Admin Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold text-red-400 border-b pb-2">
                Info
              </h2>
              <div className="mt-4 space-y-2 text-lg">
                <p>
                  <strong>Name: </strong> {admin.name}
                </p>
                <p>
                  <strong>Email: </strong>
                  <span className="text-blue-700 hover:underline cursor-pointer">
                    {admin.email}
                  </span>
                </p>
                <p>
                  <strong>Phone: </strong> {admin.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-red-400 border-b pb-2">
              Orders
            </h2>
            <div className="mt-6 space-y-4">
              {admin.orders && admin.orders.length > 0 ? (
                admin.orders.map((order, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded-lg shadow-lg transition transform hover:shadow-xl hover:-translate-y-1"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleOrderExpansion(index)}
                    >
                      <h3 className="text-gray-800 font-semibold text-lg">
                        Order #{index + 1} || {order.user.name} ||{" "}
                        {new Date(order.scheduleTime).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </h3>
                    </div>

                    {expandedOrders.includes(index) && (
                      <div className="mt-4 text-md text-gray-700 space-y-2">
                        <p>
                          <strong>Order ID : </strong> {order.cartId}
                        </p>
                        <p>
                          <strong>Placed By : </strong> {order.user.name} ||{" "}
                          {order.user.phone}
                        </p>
                        <p>
                          <strong>Placed For : </strong> {order.provider.name}{" "}
                          || {order.provider.phone}
                        </p>
                        <p>
                          <strong>Scheduled Time : </strong>{" "}
                          {new Date(order.scheduleTime).toLocaleString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                        <p>
                          <strong>Status : </strong>
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
                        <p>
                          <strong> Price : </strong> ₹{order.price}
                        </p>
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
              Account Summary
            </h2>
            <p>
              <strong>Profile Created At: </strong>
              {new Date(admin.createdAt).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p>
              <strong>Profile Updated At: </strong>
              {new Date(admin.updatedAt).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
