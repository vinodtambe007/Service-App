import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineHub } from "react-icons/md";
import { GiShoppingCart } from "react-icons/gi";
import toast from "react-hot-toast";

const Navbar = ({ setSearchQuery, value, onChange }) => {
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [locationDisplay, setLocationDisplay] = useState("");
  const [userName, setUserName] = useState(null);
  const [check, setCheck] = useState(null);
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const registerRef = useRef(null);
  const loginRef = useRef(null);

  const toggleRegisterDropdown = () => {
    setShowRegisterDropdown(!showRegisterDropdown);
    setShowLoginDropdown(false);
  };

  const GoToHome = () => {
    navigate("/");
  };

  const toggleLoginDropdown = () => {
    setShowLoginDropdown(!showLoginDropdown);
    setShowRegisterDropdown(false);
  };

  const closeDropdowns = () => {
    setShowRegisterDropdown(false);
    setShowLoginDropdown(false);
    // toast.success("Data fetched");
  };

  const handleProductSearchChange = (e) => {
    const query = e.target.value;
    setProductSearch(query);
    setSearchQuery(query);
  };

  const handleProductSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(productSearch);
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        toast.success("Geolocation fetched");
        const latitude = Math.round(position.coords.latitude * 100) / 100;
        const longitude = Math.round(position.coords.longitude * 100) / 100;

        // Display the coordinates as a string for the user
        const coordsDisplay = `Lat: ${latitude}, Lon: ${longitude}`;
        setLocationDisplay(coordsDisplay);

        // Store latitude and longitude as numbers in localStorage
        localStorage.setItem(
          "locationDisplay",
          JSON.stringify({ lat: latitude, lon: longitude })
        );

        // Fetch address using latitude and longitude
        getAddress(latitude, longitude);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const getAddress = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `http://localhost:8008/user/address/${latitude}/${longitude}`
      );
      const data = response.data;
      if (data.success) {
        setLocationDisplay(data.address);
        localStorage.setItem("locationDisplay", data.address);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching address from backend:", error);
    }
  };

  let logoutAuth =
    localStorage.getItem("user") ||
    localStorage.getItem("provider") ||
    localStorage.getItem("admin");

  const logout = () => {
    const userAuth = localStorage.getItem("user");
    const providerAuth = localStorage.getItem("provider");
    const adminAuth = localStorage.getItem("admin");

    localStorage.clear();
    setUserName(null);
    setCheck(null);
    toast.success("Successfully logged out");

    if (userAuth) {
      navigate("/user/login");
    } else if (providerAuth) {
      navigate("/provider/login");
    } else if (adminAuth) {
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    const savedLocationDisplay = localStorage.getItem("locationDisplay");
    if (savedLocationDisplay) {
      setLocationDisplay(savedLocationDisplay);
    }

    const handleClickOutside = (event) => {
      if (
        registerRef.current &&
        !registerRef.current.contains(event.target) &&
        loginRef.current &&
        !loginRef.current.contains(event.target)
      ) {
        closeDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loggedInUser =
      localStorage.getItem("user") ||
      localStorage.getItem("provider") ||
      localStorage.getItem("admin");

    let mainKey;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key !== "token" &&
        (key === "user" || key === "provider" || key === "admin")
      ) {
        mainKey = key;
        break;
      }
    }

    if (loggedInUser) {
      const Auth = JSON.parse(loggedInUser);
      setUserName(Auth.name);
      setId(Auth.id);
      setCheck(mainKey);
    }
  }, []);

  return (
    <nav className="bg-blue-500 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center space-x-4">
        <div className="flex items-center space-x-2" onClick={GoToHome}>
          <MdOutlineHub className="h-8 w-8 text-yellow-400 cursor-pointer" />
          <div className="flex items-center">
            <NavLink to="/" className="text-2xl font-bold text-yellow-400">
              URBAN CLAMP
            </NavLink>
          </div>
          {/* <h1 className="text-lg font-semibold cursor-pointer">URBAN CLAMP</h1> */}
        </div>
        <div className="bg-blue-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                {check !== "provider" && (
                  <NavLink
                    to="/"
                    className="text-xl font-semibold hover:text-yellow-400 transition duration-200"
                  >
                    Home
                  </NavLink>
                )}
                <NavLink
                  to="/aboutUs"
                  className="text-xl font-semibold hover:text-yellow-400 transition duration-200"
                >
                  About Us
                </NavLink>
                <NavLink
                  to="/contactUs"
                  className="text-xl font-semibold hover:text-yellow-400 transition duration-200"
                >
                  Contact Us
                </NavLink>
                <NavLink
                  to="/help"
                  className="text-xl font-semibold hover:text-yellow-400 transition duration-200"
                >
                  Help
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleProductSearchSubmit}
          className="flex items-center bg-gray-700 rounded overflow-hidden"
        >
          <input
            type="text"
            placeholder="Search services..."
            value={value} // Use `descriptionFilter` for initial value
            onChange={(e) => {
              setSearchQuery(e.target.value); // Update the query state
              onChange(e); // Trigger onChange to sync with parent
            }}
            className="px-4 py-2 rounded text-black"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black focus:outline-none"
          >
            Search
          </button>
        </form>

        <button onClick={handleLocationSearch} className="">
          {locationDisplay}
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={registerRef}>
            <button
              onClick={toggleRegisterDropdown}
              className="bg-yellow-400 px-3 py-2 text-black rounded hover:bg-yellow-600"
            >
              {userName ? userName : "Register"}
            </button>
            {showRegisterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-10">
                {userName ? (
                  <>
                    <NavLink
                      to={`/${check}/profile/${id}`}
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to={`/${check}/order/getOrder`}
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Orders
                    </NavLink>
                    <NavLink
                      to="/privacyPolicy"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Privacy Policy
                    </NavLink>
                    <NavLink
                      to="/contactUs"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Contact Us
                    </NavLink>
                    <NavLink
                      to="/aboutUs"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      About Us
                    </NavLink>
                    <NavLink
                      to="/terms"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Terms Of Services
                    </NavLink>
                    <NavLink
                      to="/help"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Help
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/user/register"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      User-Register
                    </NavLink>
                    <NavLink
                      to="/provider/register"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Provider-Register
                    </NavLink>
                    <NavLink
                      to="/admin/register"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={closeDropdowns}
                    >
                      Admin-Register
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={loginRef}>
            {userName ? (
              <button
                onClick={logout}
                className="bg-gray-500 px-3 py-2 rounded mlxl hover:bg-gray-600"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={toggleLoginDropdown}
                className="bg-green-600 px-3 py-2 rounded hover:bg-green-700"
              >
                Login
              </button>
            )}

            {showLoginDropdown && !logoutAuth && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-10">
                <NavLink
                  to="/user/login"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={closeDropdowns}
                >
                  User-Login
                </NavLink>
                <NavLink
                  to="/provider/login"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={closeDropdowns}
                >
                  Provider-Login
                </NavLink>
                <NavLink
                  to="/admin/login"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={closeDropdowns}
                >
                  Admin-Login
                </NavLink>
              </div>
            )}
          </div>

          {/* Conditionally render the cart icon based on whether the user is logged in as a provider */}
          {check !== "provider" && check !== "admin" && (
            <NavLink
              to={`/cart/getCartItems`}
              className="flex items-center px-2 py-2 hover:bg-gray-200 hover:text-black rounded-full relative"
            >
              <GiShoppingCart className="h-9 w-9" />
              {/* Display cart item count */}
              <span className="absolute top-0 right-0 bg-yellow-500 text-black text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {JSON.parse(localStorage.getItem("cart"))?.length || 0}
              </span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
