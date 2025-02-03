import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserLocationMap from "./UserLocationMap";

const UserRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [tc, setTc] = useState(false);
  const navigate = useNavigate();

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let lat = position.coords.latitude.toFixed(14); // Ensure precision up to 14 digits
          let lon = position.coords.longitude.toFixed(14); // Ensure precision up to 14 digits
          setLatitude(lat); // This will set the latitude
          setLongitude(lon); // This will set the longitude

          // Fetch address using the new coordinates
          await getUserAddress(lat, lon); // This will update the address state

          // Optionally, show a success toast when the location is fetched
          toast.success("Location fetched successfully!");
        },
        (error) => {
          console.error("Error fetching location:", error);
          toast.error("Failed to fetch location.");
        },
        {
          enableHighAccuracy: true, // Request high-accuracy location
          timeout: 10000, // Maximum time to wait for location (10 seconds)
          maximumAge: 0, // Prevent cached location
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8008/user/register", {
        name,
        email,
        password,
        confirmPassword,
        phone,
        latitude,
        longitude,
        address,
        tc,
      });

      if (response.data.status === "success") {
        // localStorage.setItem("user", JSON.stringify(response.data));
        toast.success("User successfully registered!");
        navigate("/user/login");
      } else {
        toast.error("Registration unsuccessful!");
      }
    } catch (error) {
      console.error(error);
      toast.error("User registration failed!");
    }
  };

  const getUserAddress = async (lat, lon) => {
    // console.log("Latitude:", lat, "Longitude:", lon);
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
      // console.log("apiKey", apiKey);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress); // Set the formatted address
        console.log("Address:", formattedAddress);
      } else {
        console.error("Error fetching address:", data.status);
        toast.error("Unable to fetch address.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch address.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md grid gap-2"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">User Register</h1>

        <div>
          <label className="block text-gray-700 font-bold">Name - </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Email - </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Password - </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">
            Confirm Password -
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Phone - </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="w-1/2 pr-1">
            <label className="block text-gray-700 font-bold">Latitude - </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-1/2 pl-1">
            <label className="block text-gray-700 font-bold">
              Longitude -{" "}
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Address - </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)} // Keep address updated with input
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {/* Render UserLocationMap here */}
        {latitude && longitude && (
          <UserLocationMap latitude={latitude} longitude={longitude} />
        )}
        <button
          type="button"
          onClick={handleGetLocation}
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 mt-2"
        >
          Get Current Location
        </button>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={tc}
            onChange={(e) => setTc(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
            required
          />
          <label className="ml-2 text-gray-700">
            Accept Terms & Conditions
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default UserRegistration;
