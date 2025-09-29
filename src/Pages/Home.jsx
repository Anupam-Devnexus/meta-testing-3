import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white shadow-md rounded-b-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">
          Supercharge Your Business Connections
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-6">
          Connect your Facebook Pages, integrate with Google Calendar, and sync data from your business website—all in one place for smarter business development.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Login
        </button>
      </header>

      {/* Features Section */}
      <section className="flex flex-col md:flex-row justify-center items-start md:items-stretch mt-12 px-6 md:px-20 gap-8">
        {/* Facebook Integration */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow text-center">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">Facebook Pages</h2>
          <p className="text-gray-600">
            Connect all your business Facebook pages to track leads, engage with customers, and grow your social presence effortlessly.
          </p>
        </div>

        {/* Google Calendar Integration */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow text-center">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">Google Calendar</h2>
          <p className="text-gray-600">
            Sync meetings, appointments, and events directly with Google Calendar for seamless scheduling and productivity.
          </p>
        </div>

      </section>

      {/* Call-to-Action Section */}
      <section className="flex flex-col items-center mt-16 px-6 text-center">
        <h3 className="text-3xl font-semibold text-indigo-700 mb-4">
          Ready to Accelerate Your Business?
        </h3>
        <p className="text-gray-600 mb-6 max-w-xl">
          Start connecting all your digital channels in one powerful dashboard. Manage leads, track interactions, and automate workflows effortlessly.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white py-6 px-4 md:px-20 flex flex-col md:flex-row justify-between items-center shadow-inner rounded-t-3xl">
        <p className="text-gray-500 mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
        <div className="flex gap-6">
          <button
            onClick={() => navigate("/privacy")}
            className="text-indigo-600 hover:underline"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate("/terms")}
            className="text-indigo-600 hover:underline"
          >
            Terms & Conditions
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
