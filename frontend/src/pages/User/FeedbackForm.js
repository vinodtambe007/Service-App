import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const FeedbackForm = () => {
  const location = useLocation();
  const { orderId, providerName, providerEmail, scheduleTime } =
    location.state || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  // const [error, setError] = useState(null);
  // const [successMessage, setSuccessMessage] = useState("");

  const handleRating = (value) => setRating(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      toast.error("User not logged in");
      // setError("User not logged in.");
      return;
    }

    try {
      await axios.post("http://localhost:8008/user/order/feedbackForm", {
        userId,
        orderId,
        providerEmail,
        scheduleTime,
        rating,
        comment,
      });
      toast.success("Feedback submitted successfully!");
      // setSuccessMessage("Feedback submitted successfully!");
      setComment("");
      setRating(0);
      navigate("/user/order/getOrder");
    } catch (err) {
      toast.error("Error in submitting feedback!");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md mt-12 bg-slate-200">
      <h1 className="text-2xl font-bold mb-4">Provide Feedback</h1>
      <div className="mb-4">
        {/* <p>
          <strong>Order ID:</strong> {orderId}
        </p> */}
        <p>
          <strong>Provider Name:</strong> {providerName}
        </p>
        <p>
          <strong>Provider Email:</strong> {providerEmail}
        </p>
        <p>
          <strong>Scheduled Time:</strong>{" "}
          {new Date(scheduleTime).toLocaleString()}
        </p>
      </div>
      {/* {successMessage && <p className="text-green-600">{successMessage}</p>} */}
      {/* {error && <p className="text-red-600">{error}</p>} */}
      <form onSubmit={handleSubmit}>
        <div className="flex mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              onClick={() => handleRating(star)}
              xmlns="http://www.w3.org/2000/svg"
              fill={star <= rating ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-8 h-8 cursor-pointer text-yellow-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          placeholder="Write your comments here..."
          className="w-full p-2 border rounded"
        ></textarea>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
