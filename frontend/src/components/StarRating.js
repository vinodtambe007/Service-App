// StarRating.js
import React from "react";

const StarRating = ({ rating, count }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating); // Full stars
  const hasHalfStar = rating % 1 !== 0; // Check if there's a half star

  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(totalStars)].map((_, index) => {
          if (index < fullStars) {
            // Full star
            return (
              <svg
                key={index}
                xmlns="http://www.w3.org/2000/svg"
                fill="#FFD700" // Solid yellow for filled stars
                viewBox="0 0 24 24"
                stroke="none"
                className="w-6 h-6 text-yellow-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.223 6.845a1 1 0 00.95.691h7.104c.969 0 1.371 1.24.588 1.81l-5.757 4.209a1 1 0 00-.364 1.118l2.223 6.845c.3.92-.755 1.688-1.54 1.118l-5.757-4.209a1 1 0 00-1.176 0l-5.757 4.209c-.784.57-1.84-.198-1.54-1.118l2.223-6.845a1 1 0 00-.364-1.118L2.75 11.473c-.784-.57-.38-1.81.588-1.81h7.104a1 1 0 00.95-.691l2.223-6.845z"
                />
              </svg>
            );
          } else if (index === fullStars && hasHalfStar) {
            // Half star
            return (
              <svg
                key={index}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <defs>
                  <linearGradient id="halfStarGradient">
                    <stop offset="50%" stopColor="#FFD700" />{" "}
                    {/* Yellow half */}
                    <stop offset="50%" stopColor="transparent" />{" "}
                    {/* Transparent half */}
                  </linearGradient>
                </defs>
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.223 6.845a1 1 0 00.95.691h7.104c.969 0 1.371 1.24.588 1.81l-5.757 4.209a1 1 0 00-.364 1.118l2.223 6.845c.3.92-.755 1.688-1.54 1.118l-5.757-4.209a1 1 0 00-1.176 0l-5.757 4.209c-.784.57-1.84-.198-1.54-1.118l2.223-6.845a1 1 0 00-.364-1.118L2.75 11.473c-.784-.57-.38-1.81.588-1.81h7.104a1 1 0 00.95-.691l2.223-6.845z"
                  fill="url(#halfStarGradient)"
                />
              </svg>
            );
          } else {
            // Empty star
            return (
              <svg
                key={index}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.223 6.845a1 1 0 00.95.691h7.104c.969 0 1.371 1.24.588 1.81l-5.757 4.209a1 1 0 00-.364 1.118l2.223 6.845c.3.92-.755 1.688-1.54 1.118l-5.757-4.209a1 1 0 00-1.176 0l-5.757 4.209c-.784.57-1.84-.198-1.54-1.118l2.223-6.845a1 1 0 00-.364-1.118L2.75 11.473c-.784-.57-.38-1.81.588-1.81h7.104a1 1 0 00.95-.691l2.223-6.845z"
                />
              </svg>
            );
          }
        })}
      </div>
      <span className="ml-2 text-lg text-gray-600">({count} reviews)</span>
    </div>
  );
};

export default StarRating;
