import React, { useState, useEffect } from "react";
import axios from "axios";

const ProviderCart = () => {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const fetchCart = async () => {
      const provider = JSON.parse(localStorage.getItem("provider"));
      const providerId = provider.id;

      try {
        const response = await axios.post(
          `http://localhost:8008/cart/getCartItems`,
          {
            providerId,
          }
        );
        // Check if the cart has items, if not, set it to an empty array
        setCart(response.data.cart.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600">
          It looks like you haven’t added any services yet.
        </p>
        <button
          onClick={() => (window.location.href = "/services")} // Example action to redirect
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          Explore Services
        </button>
      </div>
    </div>
  );
};

export default ProviderCart;
