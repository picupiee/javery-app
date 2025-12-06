/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular", "sans-serif"],
        medium: ["PlusJakartaSans_500Medium", "sans-serif"],
        semibold: ["PlusJakartaSans_600SemiBold", "sans-serif"],
        bold: ["PlusJakartaSans_700Bold", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#f97316", // orange-500
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        secondary: {
          DEFAULT: "#3b82f6", // blue-500
        },
        background: "#f8fafc", // slate-50
        surface: "#ffffff",
        text: {
          primary: "#1e293b", // slate-800
          secondary: "#64748b", // slate-500
          muted: "#94a3b8", // slate-400
        },
        border: "#e2e8f0", // slate-200
        error: "#ef4444",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
};
