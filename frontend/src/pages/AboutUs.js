import React from "react";

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            About Us
          </h1>
          <p className="text-gray-600 text-lg mt-4">
            Empowering customers with a seamless and delightful shopping
            experience.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800">Our Mission</h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              At Urban Clamp, our mission is to revolutionize online shopping by
              offering a platform that combines innovation, convenience, and a
              customer-first approach.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800">Our Vision</h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              We envision a world where technology enhances every shopping
              journey, creating opportunities for everyone to connect and grow.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800">Our Values</h2>
            <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
              <li>Customer Obsession</li>
              <li>Innovation</li>
              <li>Integrity</li>
              <li>Excellence</li>
            </ul>
          </div>
        </section>

        {/* Team Section */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Meet Our Team
          </h2>
          <p className="text-gray-600 mt-4">The people behind our success.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {/* Team Member 1 */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                Bhushan Nerkar
              </h3>
              <p className="text-gray-500">CEO & Founder</p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                Vinod Tambe
              </h3>
              <p className="text-gray-500">Chief Operating Officer</p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                Vaibhav Chitte
              </h3>
              <p className="text-gray-500">Head of Marketing</p>
            </div>

            {/* Team Member 4 */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                Ganesh Matre
              </h3>
              <p className="text-gray-500">Chief Technology Officer</p>
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
            <a href="/contact" className="text-gray-600 hover:text-blue-600">
              Contact Us
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
