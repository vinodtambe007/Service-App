import React from "react";

const Help = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            How Can We Help You?
          </h1>
          <p className="text-gray-600 text-lg mt-4">
            Find answers to your questions or get in touch with our support
            team.
          </p>
        </div>

        {/* Search Section */}
        <div className="mt-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help topics, FAQs, or articles"
                className="w-full py-3 px-5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                className="absolute right-3 top-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* FAQ Item */}
            {[
              {
                question: "How do I track my order?",
                answer:
                  "You can track your order by visiting the 'My Orders' section in your account.",
              },
              {
                question: "What is the return policy?",
                answer:
                  "We offer a 30-day return policy for eligible items. Visit the 'Returns' page for more details.",
              },
              {
                question: "How can I update my account information?",
                answer:
                  "Go to the 'Account Settings' section to update your details.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept credit cards, debit cards, UPI, and popular wallets.",
              },
              {
                question: "How do I cancel an order?",
                answer:
                  "You can cancel an order before it ships by going to the 'My Orders' section.",
              },
              {
                question: "How do I contact customer support?",
                answer:
                  "Reach out to us via email at support@urbanclamp.com or call +1 234 567 890.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800">
                  {faq.question}
                </h3>
                <p className="text-gray-600 mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="mt-16 bg-blue-50 rounded-lg p-8 sm:p-12">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Still Need Help?
          </h2>
          <p className="text-gray-600 text-center mt-4">
            Our support team is here to assist you. Get in touch with us!
          </p>
          <div className="mt-8 text-center">
            <a
              href="/contactUs"
              className="inline-block bg-blue-600 text-white font-medium rounded-lg px-6 py-3 shadow hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Contact Us
            </a>
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

export default Help;
