import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2D903A",
          "green-hover": "#23782F",
          "green-light": "#EBF6ED",
          accent: "#61CE70",
          dark: "#2A302F",
          body: "#54595F",
          muted: "#7A7A7A",
          bg: "#FFFFFF",
          surface: "#F9F9F9",
          border: "#EDEDED",
          footer: "#1F2429",
          "footer-bottom": "#181C20",
        },
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#627d98",
          500: "#486581",
          600: "#334e68",
          700: "#243447",
          800: "#1b2736",
          900: "#131c26",
          950: "#0b1118",
        },
        charcoal: {
          50: "#8F8F89",
          100: "#757570",
          200: "#5E5E58",
          300: "#484843",
          400: "#343430",
          500: "#2A302F",
          600: "#23282D",
          700: "#1F2429",
          800: "#181C20",
          900: "#111417",
          950: "#0A0C0E",
        },
        canal: {
          blue: "rgb(var(--color-canal-blue, 45 144 58) / <alpha-value>)",
          primary: "rgb(var(--color-canal-primary, 45 144 58) / <alpha-value>)",
          orange: "rgb(var(--color-canal-primary, 45 144 58) / <alpha-value>)",
          ink: "rgb(var(--color-canal-ink, 42 48 47) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "var(--font-roboto-slab)", "Playfair Display", "Georgia", "serif"],
        display: ["var(--font-playfair)", "var(--font-roboto-slab)", "Playfair Display", "serif"],
        body: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
        // Scoped to the Blog section only (see app/layout.tsx) — matches the
        // amsterdam-boat-tours reference site's typography without changing
        // the font used anywhere else on the site.
        "blog-display": ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        "blog-body": ["var(--font-plus-jakarta-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.12)",
        button: "0 2px 6px rgba(45, 144, 58, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
