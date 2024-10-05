"use client";
import React from 'react';

const twitterAuth = () => {
  const handleLogin = async () => {
    try {
      // Redirect to your Flask backend for Twitter OAuth
      window.location.href = 'http://127.0.0.1:5000/login'; // Adjust URL if your backend is hosted elsewhere
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Connect with Twitter
      </button>
    </div>
  );
}

export default twitterAuth;
