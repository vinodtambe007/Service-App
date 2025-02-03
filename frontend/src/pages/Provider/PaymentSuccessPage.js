import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io.connect("http://localhost:8008");

const PaymentSuccessPage = () => {
  const [transactionId, setTransactionId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const transactionId = queryParams.get("transactionId");
    const orderId = queryParams.get("orderId");

    setTransactionId(transactionId);
    setOrderId(orderId);

    let paymentDetails = { transactionId, orderId };
    socket.emit("payment-details", paymentDetails);
  }, [location]);

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {transactionId && orderId ? (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-10 h-10 text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Transaction ID:</span>{" "}
            {transactionId}
          </p>
          <p className="text-gray-600 mb-6">
            <span className="font-semibold">Order ID:</span> {orderId}
          </p>
          <button
            className="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold py-3 px-6 rounded-full shadow-lg hover:from-green-400 hover:to-green-600 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            onClick={handleNavigateHome}
          >
            🏠 Go to Home
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
