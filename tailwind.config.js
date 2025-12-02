/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        miboBg: "#293346",      // main dark background
        miboTeal: "#2CA5A9",    // teal accent
        miboDeepBlue: "#2a1470" // deep blue accent
      },
    },
  },
  plugins: [],
};
