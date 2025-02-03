import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import { useStateContext } from "../context/StateContext.js";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";

const Homepage = () => {
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProviders, setFilteredProviders] = useState([]);
  const { cart, setCart } = useStateContext();

  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: parseFloat(position.coords.latitude),
            lng: parseFloat(position.coords.longitude),
          };
          localStorage.setItem("userLocation", JSON.stringify(userLocation));
        },
        (error) => {
          console.error("Error accessing user location:", error);
          toast.error("Unable to access user location.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    handleLocationAccess();
    const getAllProviders = async () => {
      try {
        const response = await axios.get("http://localhost:8008/provider");
        setProviders(response.data);
        setFilteredProviders(response.data);
      } catch (error) {
        toast.error("Error fetching providers");
      }
    };
    getAllProviders();
  }, []);

  useEffect(() => {
    const filtered = providers.filter((provider) => {
      const matchesDescription =
        provider.description
          .toLowerCase()
          .includes(descriptionFilter.toLowerCase()) ||
        provider.name.toLowerCase().includes(descriptionFilter.toLowerCase());

      const matchesPrice =
        (minPrice === "" || provider.price >= minPrice) &&
        (maxPrice === "" || provider.price <= maxPrice);

      const matchesRating =
        ratingFilter === "" || provider.totalRating.average >= ratingFilter;

      return matchesDescription && matchesPrice && matchesRating;
    });
    setFilteredProviders(filtered);
  }, [descriptionFilter, minPrice, maxPrice, ratingFilter, providers]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar
        setSearchQuery={setSearchQuery}
        value={descriptionFilter}
        onChange={(e) => setDescriptionFilter(e.target.value)}
      />

      {/* Page Title */}
      <h1 className="text-4xl font-bold text-center my-4 text-gray-700">
        Services
      </h1>

      <div className="flex">
        {/* Filter Sidebar */}
        <div className="w-1/5 bg-white p-6 rounded-lg shadow-lg transition-transform hover:shadow-[0_15px_30px_rgba(255,99,71,0.4)] transform hover:-translate-y-1 hover:scale-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Filter Services
          </h2>

          {/* Description Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Service
            </label>
            <input
              type="text"
              placeholder="Search services"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              className="w-full p-3 mt-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Price Range
            </label>
            <div className="flex space-x-4 mt-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full p-3 mt-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="">All Ratings</option>
              <option value="1">1 Star & above</option>
              <option value="2">2 Stars & above</option>
              <option value="3">3 Stars & above</option>
              <option value="4">4 Stars & above</option>
              <option value="5">5 Stars only</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              setDescriptionFilter("");
              setMinPrice("");
              setMaxPrice("");
              setRatingFilter("");
            }}
            className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg shadow-md transition hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Reset Filters
          </button>
        </div>

        {/* Providers Grid */}
        <div className="w-4/5 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <div
                  key={provider?._id}
                  className="bg-white p-3 rounded-lg shadow-lg hover:shadow-[0_15px_30px_rgba(255,99,71,0.4)] transform transition-transform duration-500 hover:-translate-y-3 hover:scale-105 hover:rotate-0"
                >
                  <img
                    src={provider?.image}
                    alt={provider?.name}
                    className="rounded-t-lg h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-pink-500">
                      {provider?.name}
                    </h3>
                    <p className="text-md text-gray-700">
                      {provider?.description?.slice(0, 70)}...
                    </p>
                    <p className="text-md text-gray-700">
                      {provider?.orders?.status}
                    </p>
                    <StarRating
                      rating={provider?.totalRating?.average}
                      count={provider?.totalRating?.count}
                    />
                    <Link
                      to={`/provider/${provider?._id}`}
                      className="block bg-blue-500 text-white py-2 px-4 text-center rounded mt-4 hover:bg-blue-600"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 w-full">
                No providers available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
