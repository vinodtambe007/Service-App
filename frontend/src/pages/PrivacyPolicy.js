import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
          Privacy Policy
        </h1>
        <p className="text-md border-b mb-2 p-1 text-gray-500 text-center mt-2">
          Last updated: August 15, 2024
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Introduction
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Urban Clamp! Your privacy is important to us. This
            privacy policy explains how we collect, use, disclose, and protect
            your information when you use our services.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Information We Collect
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3"></span>
              Personal Information: Name, email address, phone number, etc.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3"></span>
              Payment Information: Credit card details and billing address.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3"></span>
              Usage Data: Information about how you use our website and
              services.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How We Use Your Information
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>Provide and maintain our services.</li>
            <li>Process your transactions.</li>
            <li>Communicate with you about your account or transactions.</li>
            <li>Improve our website and services.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sharing Your Information
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell or rent your personal information. We may share your
            information with:
          </p>
          <ul className="space-y-2 text-gray-600 mt-4">
            <li>Service providers who assist us in operating our website.</li>
            <li>
              Law enforcement or government authorities as required by law.
            </li>
            <li>Third parties with your consent.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Data Security
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We take reasonable measures to protect your information from
            unauthorized access, use, or disclosure. However, no method of
            transmission over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Rights
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to access, update, or delete your personal
            information. You can also object to the processing of your data in
            certain circumstances.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may update our privacy policy from time to time. We will notify
            you of any changes by posting the new privacy policy on this page.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this privacy policy, please contact
            us at:
          </p>
          <p className="text-blue-600 hover:underline mt-4">
            <a href="mailto:support@urbanclamp.com">support@urbanclamp.com</a>
          </p>
        </section>

        <footer className="mt-12 border-t pt-6 text-gray-500 text-center">
          <p>&copy; 2022 Urban Clamp, Inc.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="/aboutUs" className="hover:underline">
              About Us
            </a>
            <span>|</span>
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
