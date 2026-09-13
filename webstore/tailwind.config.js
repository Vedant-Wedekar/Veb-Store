/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        ink: "#0B0B14",
        paper: "#FAFAFC",
        line: "#ECECF3",
        brand: {
          blue: "#3B6DF6",
          purple: "#8B5CF6",
          pink: "#EC4899",
          cyan: "#06B6D4",
          orange: "#F97316",
          green: "#10B981",
        },
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #3B6DF6 0%, #8B5CF6 100%)",
        "grad-warm": "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
        "grad-cool": "linear-gradient(135deg, #06B6D4 0%, #3B6DF6 100%)",
        "grad-mint": "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
        "grad-mesh":
          "radial-gradient(at 20% 20%, rgba(59,109,246,0.14) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.14) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(236,72,153,0.12) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(6,182,212,0.12) 0px, transparent 50%)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(15,15,35,0.04), 0 1px 2px rgba(15,15,35,0.04)",
        card: "0 4px 20px rgba(15,15,35,0.06)",
        lift: "0 12px 32px rgba(15,15,35,0.12)",
        glow: "0 0 0 1px rgba(139,92,246,0.15), 0 8px 24px rgba(139,92,246,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(24px,-30px) scale(1.06)" },
          "66%": { transform: "translate(-18px,18px) scale(0.96)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blob: "blob 14s infinite ease-in-out",
        shimmer: "shimmer 1.6s linear infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
