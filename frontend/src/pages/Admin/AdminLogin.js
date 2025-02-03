import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError(""); // Clear any previous errors

    try {
      const response = await axios.post("http://localhost:8008/admin/login", {
        email,
        password,
      });

      if (response.data.status === "success") {
        toast.success("Admin Login successful!");
        // console.log("Admin Login successful!");
        const { token, admin } = response.data;

        // Save the token and user details to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("admin", JSON.stringify(admin));
        // Redirect to dashboard or home page
        // window.location.href = "/"; // Update this as needed
        navigate("/");
      } else {
        toast.error("Admin Login failed. Invalid email or password.");
        // setError("Admin Login failed. Invalid email or password.");
      }
    } catch (error) {
      toast.error("An error occurred during login. Please try again.");
      // setError("An error occurred during login. Please try again.");
      // console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md grid gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>

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

        {/* {error && <p className="text-red-500">{error}</p>} */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/admin/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
