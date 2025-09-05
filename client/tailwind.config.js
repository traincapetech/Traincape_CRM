export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D1B2A",  
        secondary: "#1B263B",
        third: "#14B8A6",
        accent: "#FACC15",
        neutral: "#111827",
        dark: {
          primary: "#0D1B2A",
          secondary: "#1B263B",
          text: "#F1F5F9",
          surface: "#1E293B",
          background: "#0A1128",
        },
      },
      backgroundImage: {
        // ✅ Custom gradients
        'hero-light':"linear-gradient(90deg, #1E2A48 0%, #6A5ACD 50%, #5FB9D5 100%)",

        'hero-dark': "linear-gradient(to right, #334155, #111827)",  // slate-700 → gray-900
      },
    },
  },
  plugins: [],
}
