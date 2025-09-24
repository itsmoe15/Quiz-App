/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        underline: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      animation: {
        "underline-slide": "underline 1s ease-out forwards",
        blob: "blob 7s infinite",
      },
      animationDelay: {
        2000: "2000ms",
        4000: "4000ms",
        6000: "6000ms",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const delays = theme("animationDelay");
      const newUtilities = {};
      Object.keys(delays).forEach((key) => {
        newUtilities[`.animation-delay-${key}`] = {
          "animation-delay": delays[key],
        };
      });
      addUtilities(newUtilities);
    },
  ],
};
