import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const PaymentPage = () => {
  const location = useLocation();
  const { userId, scheduleTime, price } = location.state || {}; // Destructure passed data
  const [paymentDetails, setPaymentDetails] = useState(null); // State to hold payment details
  const [loading, setLoading] = useState(true); // State for loading status
  const formRef = useRef(null); // Reference to the form

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await axios.post(
          `http://localhost:8008/order/fetchPaymentDetails/${userId}/${scheduleTime}/${price}`
        );
        // console.log("Payment details fetched:", response.data);
        setPaymentDetails(response.data); // Save the fetched data
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Failed to fetch payment details.");
        setLoading(false); // Stop loading on error
      }
    };

    if (userId && scheduleTime && price) {
      fetchPaymentDetails();
    } else {
      toast.error("Invalid payment data.");
      setLoading(false); // Stop loading if no data
    }
  }, [userId, scheduleTime, price]);

  if (loading) {
    return (
      <div className="text-center text-blue-500 font-semibold">
        <h1>Loading Payment Details...</h1>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="text-center text-red-500 font-semibold">
        <h1>Failed to load payment details</h1>
      </div>
    );
  }

  const {
    _id,
    orderId,
    providerName,
    providerEmail,
    status,
    paymentStatus,
    // createdAt,
    // updatedAt,
  } = paymentDetails;

  const handlePayment = async (
    _id,
    price,
    userId,
    providerEmail,
    scheduleTime,
    orderId
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:8008/order/pay/${orderId}/${price}`,
        {
          _id,
          price,
          userId,
          providerEmail,
          scheduleTime,
          orderId,
        }
      );

      // Get the approval URL from the response
      const { approvalUrl } = response.data;

      // Redirect the user to the PayPal approval URL
      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        throw new Error("Approval URL not found");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to redirect to PayPal. Please try again.");
    }
  };

  return (
    <div className="bg-slate-200 min-h-screen py-12">
      <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg mt-12">
        <h1 className="text-4xl font-bold text-center mb-8">Payment Details</h1>
        {/* <p className="text-lg mb-2">
          <strong>Order ID - </strong> {_id}
        </p> */}
        <p className="text-lg mb-2">
          <strong>Order ID - </strong> {orderId}
        </p>
        <p className="text-lg mb-2">
          <strong>Provider Name -</strong> {providerName}
        </p>
        <p className="text-lg mb-2">
          <strong>Provider Email -</strong> {providerEmail}
        </p>
        <p className="text-lg mb-2">
          <strong>Scheduled Time -</strong>{" "}
          {new Date(scheduleTime).toLocaleString("en-US", {
            weekday: "long", // Full day name
            year: "numeric",
            month: "long", // Full month name
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // 12-hour format
          })}
        </p>
        <p className="text-lg mb-2">
          <strong>Price -</strong> ₹{price}
        </p>
        <p className="text-lg mb-2">
          <strong>Order Status - </strong>{" "}
          <span className="text-green-500 font-semibold">{status}</span>
        </p>
        <p className="text-lg mb-2">
          <strong>Payment Status - </strong>{" "}
          <span
            className={`font-semibold ${
              paymentStatus === "Paid" ? "text-green-500" : "text-red-500"
            }`}
          >
            {paymentStatus}
          </span>
        </p>
        {/* <p className="text-lg mb-2">
          <strong>Order Created At:</strong>{" "}
          {new Date(createdAt).toLocaleString()}
        </p>
        <p className="text-lg mb-2">
          <strong>Last Updated At:</strong>{" "}
          {new Date(updatedAt).toLocaleString()}
        </p> */}

        <button
          onClick={() =>
            handlePayment(
              _id,
              price,
              userId,
              providerEmail,
              scheduleTime,
              orderId
            )
          }
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded mt-2"
          disabled={paymentStatus === "Paid"}
        >
          {paymentStatus === "Paid"
            ? "Payment Completed"
            : "Procced to Payment"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
