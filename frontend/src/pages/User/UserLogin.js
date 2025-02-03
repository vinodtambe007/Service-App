import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8008/user/login", {
        email,
        password,
      });

      if (response.data.status === "success") {
        toast.success("User Login successful!");
        const { token, user } = response.data;

        // Save the token and user details to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Request location access
        requestLocationAccess();

        // Redirect to dashboard or home page
        navigate("/");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to request location access and store it in localStorage
  const requestLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Round latitude and longitude to 2 decimal places
          const latitude = position.coords.latitude.toFixed(2);
          const longitude = position.coords.longitude.toFixed(2);

          // Add location to localStorage
          const user = JSON.parse(localStorage.getItem("user"));
          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, latitude, longitude })
          );

          toast.success("Location saved successfully!");
        },
        (error) => {
          console.error("Location access denied:", error);
          toast.error("Location access denied. Location not saved.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("user");
    if (auth) {
      window.location.href = `/`;
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200">
      <form
        onSubmit={handleLogin}
        className="max-w-lg mx-auto p-4 bg-slate-300 shadow-md rounded-md grid gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">User Login</h1>

        <div>
          <label className="block text-gray-700 font-bold">Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/user/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
