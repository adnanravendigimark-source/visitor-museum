import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Renaissance Navy ⭐ #243447 → Logo, CTA, navigation
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#627d98",
          500: "#486581",
          600: "#334e68",
          700: "#243447", // Brand Primary
          800: "#1b2736",
          900: "#131c26",
          950: "#0b1118",
        },
        // Marble Ivory #F7F4EC → Main background
        marble: {
          50: "#FCFBF7",
          100: "#F7F4EC", // Main Background
          200: "#EDE7D7",
          300: "#E2D9C0",
          400: "#D4C7A5",
        },
        // Tuscan Sand #D9C9AA → Cards / sections
        tuscan: {
          50: "#FAF7F0",
          100: "#F2EDE1",
          200: "#E6DDCC",
          300: "#D9C9AA", // Brand Card/Section
          400: "#C7B38E",
          500: "#B39C72",
          600: "#968158",
          700: "#756341",
          800: "#54462D",
          900: "#332A1A",
        },
        // Terracotta #A85C43 → Small accents, urgent badges, dome highlights
        terracotta: {
          50: "#FAF1EE",
          100: "#F3DDD6",
          200: "#E6B8AA",
          300: "#D4907D",
          400: "#BE6F57",
          500: "#A85C43", // Brand Terracotta Accent
          600: "#8D4933",
          700: "#713725",
          800: "#552719",
          900: "#3B190F",
          950: "#240E08",
        },
        // Muted Sky #8FA6B5 → Secondary UI
        sky: {
          50: "#F5F8FA",
          100: "#E8EEF2",
          200: "#D1DDE5",
          300: "#B8CCD7",
          400: "#A2B9C7",
          500: "#8FA6B5", // Brand Secondary UI
          600: "#728A9A",
          700: "#576F7E",
          800: "#3F5360",
          900: "#2A3842",
        },
        // Charcoal text tones
        charcoal: {
          50: "#8F8F89",
          100: "#757570",
          200: "#5E5E58",
          300: "#484843",
          400: "#343430",
          500: "#243447",
          600: "#1f2d3d",
          700: "#1a2533",
          800: "#141d28",
          900: "#0e141c",
          950: "#080c12",
        },
        // Aliases for compatibility
        olive: {
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
        cream: {
          50: "#FCFBF7",
          100: "#F7F4EC",
          200: "#EDE7D7",
          300: "#E2D9C0",
        },
        warmstone: {
          50: "#FAF7F0",
          100: "#F2EDE1",
          200: "#E6DDCC",
          300: "#D9C9AA",
          400: "#C7B38E",
          500: "#B39C72",
          600: "#968158",
          700: "#756341",
          800: "#54462D",
          900: "#332A1A",
        },
        sage: {
          50: "#F5F8FA",
          100: "#E8EEF2",
          200: "#D1DDE5",
          300: "#B8CCD7",
          400: "#A2B9C7",
          500: "#8FA6B5",
          600: "#728A9A",
          700: "#576F7E",
          800: "#3F5360",
          900: "#2A3842",
        },
        // Admin-panel accent tokens, driven by the theme colors set on the
        // Homepage admin page (see app/layout.tsx, which writes these as
        // CSS variables). Used across every components/admin/* form.
        canal: {
          blue: "rgb(var(--color-canal-blue) / <alpha-value>)",
          primary: "rgb(var(--color-canal-primary) / <alpha-value>)",
          orange: "rgb(var(--color-canal-primary) / <alpha-value>)",
          ink: "rgb(var(--color-canal-ink) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cinzel", "Outfit", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        mosaic:
          "radial-gradient(circle at 15% 25%, rgba(36,52,71,0.25) 0, transparent 45%), radial-gradient(circle at 85% 15%, rgba(143,166,181,0.22) 0, transparent 45%), radial-gradient(circle at 50% 85%, rgba(168,92,67,0.30) 0, transparent 50%)",
        "renaissance-pattern":
          "radial-gradient(circle at 50% 0%, rgba(143,166,181,0.18) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgba(36,52,71,0.14) 0%, transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(36, 52, 71, 0.30)",
        "gold-glow": "0 0 35px -5px rgba(168, 92, 67, 0.35)",
        "blue-glow": "0 0 35px -5px rgba(36, 52, 71, 0.35)",
        "terracotta-glow": "0 0 35px -5px rgba(168, 92, 67, 0.40)",
      },
    },
  },
  plugins: [],
};
export default config;
