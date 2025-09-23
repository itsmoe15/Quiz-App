// src/pages/NotFound.jsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow text-center p-6">
        <div className="flex items-center justify-center gap-16 mb-12">
          <span className="text-[200px] font-extrabold text-white drop-shadow-2xl">
            4
          </span>

          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-48 h-48 text-purple-200 drop-shadow-2xl"
            >
              <polygon
                points="50,5 61,15 75,10 82,22 95,25 92,38 100,50 92,62 95,75 82,78 75,90 61,85 50,95 39,85 25,90 18,78 5,75 8,62 0,50 8,38 5,25 18,22 25,10 39,15"
                fill="#F3E8FF"
                stroke="#A855F7"
                strokeWidth="3"
              />
            </svg>
            <img
              src="/errorimage.svg"
              alt="File icon"
              className="w-24 h-24 absolute inset-0 m-auto"
            />
          </div>

          <span className="text-[200px] font-extrabold text-white drop-shadow-2xl">
            4
          </span>
        </div>

        {/* Text */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8 max-w-md">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            PAGE NOT FOUND
          </h2>
          <p className="text-gray-700 text-lg mb-8 max-w-sm">
            The page seems to be missing, perhaps it's time to go back home?
          </p>

          {/* Button */}
          <button
            onClick={() => (window.location.href = "/")}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
