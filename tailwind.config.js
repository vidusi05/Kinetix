/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        onyx: {
          950: "#08090d",
          900: "#0c0d12",
          850: "#12131a",
          800: "#181a24",
          700: "#222534",
          600: "#2e3246",
        },
        crimson: {
          DEFAULT: "#e11d48",
          glow: "#f43f5e",
          dark: "#9f1239",
        },
        purpleGlow: {
          DEFAULT: "#8b5cf6",
          bright: "#a855f7",
          dark: "#5b21b6",
        },
      },
      boxShadow: {
        "red-neon": "0 0 20px rgba(225, 29, 72, 0.4), 0 0 40px rgba(225, 29, 72, 0.2)",
        "purple-neon": "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
        "phone": "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(225, 29, 72, 0.15)",
      },
      animation: {
        pulseGlow: "pulseGlow 2s infinite ease-in-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: 0.8, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
};
