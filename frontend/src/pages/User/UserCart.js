import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import io from "socket.io-client";

const socket = io.connect("http://localhost:8008");
const UserCart = () => {
  const [cart, setCart] = useState([]);
  const [scheduledDates, setScheduledDates] = useState({});
  const [isOrderValid, setIsOrderValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user.id;

      try {
        const response = await axios.post(
          `http://localhost:8008/cart/getCartItems`,
          { userId }
        );
        setCart(response.data.cart.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const allItemsScheduled = cart.every(
      (item) => scheduledDates[item.provider._id] !== undefined
    );
    setIsOrderValid(allItemsScheduled);
  }, [cart, scheduledDates]);

  const placeOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user.id;

      const userLocation = JSON.parse(localStorage.getItem("userLocation"));
      if (!userLocation || !userLocation.lat || !userLocation.lng) {
        throw new Error("User location is incomplete or missing.");
      }

      const orderDetails = cart.map((item) => ({
        provider: { ...item.provider },
        providerLocation: item.provider.location,
        scheduleTime: scheduledDates[item.provider._id],
        status: "placed",
        cartId: item._id,
      }));
      const totalPrice = orderDetails.reduce((acc, item) => {
        return acc + parseFloat(item.provider.price);
      }, 0);

      const response = await axios.post(
        `http://localhost:8008/user/order/addOrder`,
        { userId, orders: orderDetails, totalPrice, userLocation }
      );

      if (response.status === 201) {
        toast.success("Order has been added successfully!");
      }

      const clearCartResponse = await axios.post(
        `http://localhost:8008/cart/clearCart`,
        { userId }
      );

      let order = { userId, orders: orderDetails, totalPrice, userLocation };
      socket.emit("new-order", order);
      setCart([]);

      if (clearCartResponse.status === 200) {
        localStorage.removeItem("cart");
        setCart([]);
        setScheduledDates({});
        toast.success("Cart cleared successfully!");
      } else {
        toast.error("Failed to clear the cart in the backend.");
      }

      localStorage.removeItem("cart");
      setCart([]);
      // navigate("/cart/getCartItems");
      navigate("/user/order/getOrder");
    } catch (error) {
      toast.error("Error while placing order");
      console.error("Error placing order:", error);
    }
  };

  const removeFromCart = async (itemToRemove) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;

    try {
      const response = await axios.post(
        `http://localhost:8008/cart/removeFromCart`,
        {
          userId,
          providerId: itemToRemove.provider._id,
        }
      );

      if (response.status === 200) {
        const updatedCart = cart.filter(
          (item) => item.provider._id !== itemToRemove.provider._id
        );
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Item removed from cart successfully!");
        navigate("/cart/getCartItems");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const handleDateChange = (date, providerId) => {
    setScheduledDates((prevDates) => ({
      ...prevDates,
      [providerId]: date,
    }));
  };

  const totalCartValue = cart.reduce(
    (total, item) => total + parseFloat(item.provider.price),
    0
  );

  return (
    <div className="max-w-full mx-auto p-2 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-3 mt-3">
        Your Shopping Cart
      </h1>
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Section: Cart Items */}
          <div className="col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.provider._id}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row md:space-x-6"
              >
                <img
                  src={item.provider.image}
                  alt={item.provider.name}
                  className="w-80 h-80 object-cover mx-auto rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-700"
                />
                <div className="flex-grow">
                  <h3 className="text-4xl font-bold mt-6 text-red-400">
                    {item.provider.name}
                  </h3>
                  <p className="text-blue-500 text-lg underline">
                    {item.provider.email}
                  </p>
                  <p className="text-gray-900 text-lg first-letter:text-4xl first-letter:font-bold first-letter:text-blue-300">
                    {item.provider.description}
                  </p>
                  <p className="text-4xl mt-2 font-semibold text-green-600">
                    ₹{item.provider.price}
                  </p>
                  <div className="mt-3 flex">
                    <span className="block text-lg font-semibold mb-2 mr-2 mt-1 text-gray-600">
                      Schedule Service:
                    </span>
                    <DatePicker
                      selected={scheduledDates[item.provider._id] || null}
                      onChange={(date) => {
                        const now = new Date();
                        const selectedDate = new Date(date);

                        // If the selected date is today, ensure the time respects the user's selection
                        if (
                          selectedDate.toDateString() === now.toDateString()
                        ) {
                          // Prevent selecting a time in the past for today
                          if (selectedDate.getTime() < now.getTime()) {
                            toast.error("Cannot select a past time for today.");
                            return; // Don't update the date state
                          }
                        }
                        handleDateChange(date, item.provider._id);
                      }}
                      onFocus={(e) => {
                        const hasSelectedDate =
                          !!scheduledDates[item.provider._id];
                        if (!hasSelectedDate) {
                          // Dismiss time options if no date is selected
                          e.target.blur();
                          toast.error("Please select a date first.");
                        }
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Select date and time"
                      className="border rounded p-2 w-full"
                      minDate={new Date()} // Prevent past dates
                      minTime={
                        new Date().toDateString() ===
                        (scheduledDates[item.provider._id]?.toDateString() ||
                          "")
                          ? new Date(new Date().getTime() + 5 * 60 * 1000) // Set minTime to 5 minutes from now
                          : new Date(new Date().setHours(0, 0)) // Earliest time for future days
                      }
                      maxTime={new Date(new Date().setHours(23, 59))} // Allow the full range of times
                    />
                  </div>

                  <div className="flex items-center justify-end md:justify-start">
                    <button
                      className="py-2 px-6 bg-red-500 text-white rounded-lg shadow-md transform transition duration-200 hover:bg-red-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() => removeFromCart(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Section: Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Total Items: {cart.length}
            </p>
            <p className="text-xl font-bold text-green-600 mb-6">
              Total: ₹{totalCartValue.toFixed(2)}
            </p>
            <button
              className={`w-full py-3 text-lg font-semibold text-white rounded ${
                isOrderValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={placeOrder}
              disabled={!isOrderValid}
            >
              Place Order
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg font-semibold text-gray-700">
          <span className="block text-4xl text-red-500 mb-4">🛒</span>
          <span className=" text-red-500">Your cart is empty</span>
          <span className="block mt-2 text-gray-500">
            Looks like you haven't added any items yet.
          </span>
          <a
            href="/"
            className="mt-4 inline-block bg-gradient-to-r from-red-400 to-red-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg shadow-red-500/50 transform transition-transform duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-400/70 focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-gray-100"
          >
            Start Shopping
          </a>
        </p>
      )}
    </div>
  );
};

export default UserCart;
