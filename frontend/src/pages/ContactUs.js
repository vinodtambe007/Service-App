import React from "react";

const ContactUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg mt-4">
            We're here to help! Reach out to us for any queries or support.
          </p>
        </div>

        {/* Contact Form Section */}
        <section className="mt-12 bg-white shadow rounded-lg p-8 sm:p-12">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-center mt-4">
            Fill out the form below, and our team will get back to you shortly.
          </p>
          <form className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Your Message
              </label>
              <textarea
                id="message"
                rows="4"
                className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="inline-block w-full sm:w-auto bg-blue-600 text-white font-medium rounded-lg px-6 py-3 shadow hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Submit
              </button>
            </div>
          </form>
        </section>

        {/* Contact Details Section */}
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Phone</h3>
                <p className="text-gray-600">+91 - 8806644745</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Email</h3>
                <p className="text-gray-600">
                  <a
                    href="mailto:support@urbanclamp.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@urbanclamp.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Address</h3>
                <p className="text-gray-600">111 Urban Clamp, Pune - 411 014</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="mt-16 bg-white shadow rounded-lg p-6 sm:p-12 text-center">
          <p className="text-gray-500">
            &copy; 2024 Urban Clamp, Inc. All rights reserved.
          </p>
          <div className="flex justify-center mt-4 space-x-6">
            <a href="/terms" className="text-gray-600 hover:text-blue-600">
              Terms of Service
            </a>
            <span>|</span>
            <a
              href="/privacyPolicy"
              className="text-gray-600 hover:text-blue-600"
            >
              Privacy Policy
            </a>
            <span>|</span>
            <a href="/aboutUs" className="text-gray-600 hover:text-blue-600">
              About Us
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContactUs;
