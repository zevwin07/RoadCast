import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#111827",
        pine: "#0f3d3e",
        sand: "#f5e7c5",
        sun: "#f59e0b",
        mist: "#cbd5e1"
      },
      boxShadow: {
        glow: "0 24px 60px rgba(15, 61, 62, 0.28)"
      },
      backgroundImage: {
        "road-gradient":
          "radial-gradient(circle at top, rgba(245, 158, 11, 0.28), transparent 34%), linear-gradient(160deg, #08111b 0%, #10222f 45%, #1a3442 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
