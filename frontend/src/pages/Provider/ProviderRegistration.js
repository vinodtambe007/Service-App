import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProviderLocationMap from "./ProviderLocationMap";

const ProviderRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [tc, setTc] = useState(false); // Terms and Conditions checkbox
  // const [errorMessage, setErrorMessage] = useState("");
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
          await getProviderAddress(lat, lon); // This will update the address state

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

  const getProviderAddress = async (lat, lon) => {
    console.log("Latitude:", lat, "Longitude:", lon); // Debug log to check values
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8008/provider/register", // Adjust the URL as needed
        {
          name,
          email,
          password,
          confirmPassword,
          phone,
          latitude,
          longitude,
          address,
          price,
          description,
          image,
          tc,
        }
      );

      // Handle success
      if (response.data.status === "success") {
        toast.success("provider registered successfully");
        // console.log("Provider registration successful!");
        navigate("/provider/login");
        // Optionally, redirect the user or clear the form
      } else {
        // setErrorMessage("Provider registration unsuccessful!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Provider registration unsuccessful");
      // setErrorMessage("An error occurred during registration.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes

    if (file) {
      if (file.size > maxSize) {
        alert("File size exceeds 2MB. Please select a smaller file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // const validatePhoneNumber = (value) => {
  //   // Check if the value is exactly 10 digits
  //   if (value.length !== 10 || isNaN(value)) {
  //     alert("Phone number must be exactly 10 digits."); // Show alert
  //     return false; // Return false to indicate validation failure
  //   }
  //   return true; // Return true to indicate validation success
  // };
  // const handleChange = (e) => {
  //   const value = e.target.value;
  //   setPhone(value);
  //   validatePhoneNumber(value); // Validate on change
  // };

  // const handleBlur = () => {
  //   validatePhoneNumber(phone); // Validate on blur if needed
  // };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-4 w- w-3/4 bg-white shadow-md rounded-md grid gap-2"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Provider Register
        </h1>

        {/* {errorMessage && <p className="text-red-500">{errorMessage}</p>} */}

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
            // onChange={handleChange}
            // onBlur={handleBlur} // Optional: validate on blur
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Latitude - </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Longitude - </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">Address - </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Render UserLocationMap here */}
        {latitude && longitude && (
          <ProviderLocationMap latitude={latitude} longitude={longitude} />
        )}
        <button
          type="button"
          onClick={handleGetLocation}
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 mt-2"
        >
          Get Current Location
        </button>

        <div>
          <label className="block text-gray-700 font-bold">Base Price - </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">
            Description -{" "}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold">
            Upload Image -{" "}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result); // Set the image state to the file's data URL
                };
                reader.readAsDataURL(file); // Read the file as a data URL
              }
            }}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {image && (
            <div className="mt-4">
              <img
                src={image}
                alt="Uploaded"
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>

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
          Register Provider
        </button>
      </form>
    </div>
  );
};

export default ProviderRegistration;
