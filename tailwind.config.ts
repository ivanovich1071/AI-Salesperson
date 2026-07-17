import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Фирменная палитра «дорогого» корпоративного стиля
        brown: {
          deep: "#3E2723",
          light: "#5D4037",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F4E5B2",
          hover: "#E5C14D",
        },
        milk: "#FAF9F6",
        ink: "#2C1B18",
        muted: "#6D5E59",
        line: "#E6DFD8",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 10px 30px -5px rgba(62, 39, 35, 0.1)",
        gold: "0 4px 15px rgba(212, 175, 55, 0.3)",
      },
      fontFamily: {
        sans: [
          "'Segoe UI'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
