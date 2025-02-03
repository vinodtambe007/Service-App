import React from "react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-md">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 text-center">
          Terms of Service
        </h1>
        <p className="text-md text-gray-500 border-b mb -2 p-1 text-center mt-2">
          Last updated: August 15, 2024
        </p>

        <div className="mt-8 space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Urban Clamp's services, you agree to comply
              with and be bound by these Terms of Service. If you do not agree
              with these terms, please do not use our services.
            </p>
          </section>

          {/* Section 2: Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify you of any changes by posting the new terms on this page.
              Your continued use of the services after any changes indicates
              your acceptance of the new terms.
            </p>
          </section>

          {/* Section 3: User Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Responsibilities
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Users are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li>Providing accurate and complete information.</li>
              <li>
                Maintaining the confidentiality of your account and password.
              </li>
              <li>Not using the services for any unlawful purpose.</li>
            </ul>
          </section>

          {/* Section 4: Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Service Availability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to provide uninterrupted access to our services.
              However, we do not guarantee that the services will always be
              available or error-free. We reserve the right to modify or
              discontinue our services at any time.
            </p>
          </section>

          {/* Section 5: Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Urban Clamp will not be liable for any indirect, incidental, or
              consequential damages arising from your use of our services. Our
              total liability will not exceed the amount paid by you for the
              services.
            </p>
          </section>

          {/* Section 6: Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Urban Clamp operates.
            </p>
          </section>

          {/* Section 7: Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <p className="text-blue-600 hover:underline mt-4">
              <a href="mailto:support@urbanclamp.com">support@urbanclamp.com</a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 text-center">
          <p className="text-gray-500 text-sm">&copy; 2022 Urban Clamp, Inc.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a
              href="/aboutUs"
              className="text-gray-500 hover:text-blue-600 hover:underline"
            >
              About Us
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="/privacyPolicy"
              className="text-gray-500 hover:text-blue-600 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
