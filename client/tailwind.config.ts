import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effdf5",
          100: "#d9fbe7",
          500: "#16803c",
          600: "#166534",
          700: "#14532d"
        },
        border: "#e2e8f0",
        muted: "#64748b"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.03), 0 8px 20px rgba(15, 23, 42, 0.04)"
      }
    }
  },
  plugins: []
} satisfies Config;
