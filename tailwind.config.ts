import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00D9FF",
          dark: "#00B6D6",
          light: "#E0F9FF",
        },
        secondary: {
          DEFAULT: "#1A1A2E",
          dark: "#0F0F1E",
        },
        accent: {
          DEFAULT: "#FF6B6B",
        },
        background: "#0F111A", // Fondo oscuro premium
        card: "#1A1D2B", // Color para tarjetas
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
