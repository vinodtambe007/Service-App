import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProviderLogin = () => {
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
      const response = await axios.post(
        "http://localhost:8008/provider/login",
        {
          email,
          password,
        }
      );
      // console.log(response);
      if (response.data.status === "success") {
        toast.success("Provider Login Successful");
        // console.log("Provider Login successful!");
        const { token, provider } = response.data;

        // Save the token and user details to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("provider", JSON.stringify(provider));
        // console.log(provider.id);
        // Redirect to dashboard or home page
        window.location.href = `/provider/profile/${provider.id}`; // Update this as needed
        // navigate(`/provider/profile/${provider.id}`);
        // navigate(`/`);
      } else {
        toast.error("Provider Login failed. Invalid email or password.");
        // setError("Provider Login failed. Invalid email or password.");
      }
    } catch (error) {
      toast.error("Provider Login failed. Invalid email or password."); // Update this to display a custom error message
      // setError("An error occurred during login. Please try again.");
      // console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <form
        onSubmit={handleLogin}
        className="max-w-lg mx-auto p-4 bg-purple-100 shadow-md rounded-md grid gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Provider Login</h1>

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
          <Link
            to="/provider/register"
            className="text-blue-500 hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ProviderLogin;
