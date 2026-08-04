import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Единая фирменная палитра «ВайбМайнд» (бирюза VibeZmest).
        // Исторические имена gold/brown/milk сохранены и переопределены в бирюзу,
        // чтобы разом перекрасить все существующие использования по проекту.
        brown: {
          deep: "#0e1e1f", // тёмная бирюза-графит: заголовки, тёмные кнопки/градиенты
          light: "#35595a", // приглушённый тёмно-бирюзовый: вторичный текст
        },
        gold: {
          DEFAULT: "#00b1b4", // основной акцент (бирюза)
          light: "#cdecec", // светлый бирюзовый тинт: бейджи, hover, карточки
          hover: "#00c5c9",
        },
        milk: "#f5f7f8", // фон страниц (mist)
        ink: "#2e2e2e",
        muted: "#6b7d7d",
        line: "#dbe7e7",
        // Явные бирюзовые токены (используются на главной ВайбМайнд)
        teal: {
          DEFAULT: "#00b1b4",
          emerald: "#00d9a6",
          hover: "#00c5c9",
          deep: "#073d3d",
          night: "#0e1e1f",
        },
        graphite: "#111111",
        mist: "#f5f7f8",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 10px 30px -5px rgba(7, 61, 61, 0.10)",
        gold: "0 4px 15px rgba(0, 177, 180, 0.3)",
        teal: "0 4px 15px rgba(0, 177, 180, 0.3)",
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
