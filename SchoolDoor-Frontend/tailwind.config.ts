import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sd-navy": "var(--sd-navy)",
        "sd-salmon": "var(--sd-salmon)",
        "sd-yellow": "var(--sd-yellow)",
        "sd-charcoal": "var(--sd-charcoal)",
        "sd-ink": "var(--sd-ink)",
        "sd-cream": "var(--sd-cream)",
        "sd-soft-blue": "var(--sd-soft-blue)",
        "sd-soft-pink": "var(--sd-soft-pink)",
        "sd-soft-green": "var(--sd-soft-green)",
        "sd-muted": "var(--sd-muted)",
        "sd-card": "var(--sd-card)",
      },
      boxShadow: {
        "surface-lg": "0 30px 60px -32px rgba(15, 151, 144, 0.4)",
        "surface-md": "0 18px 40px -28px rgba(252, 138, 123, 0.4)",
        "surface-sm": "0 12px 25px -20px rgba(17, 24, 39, 0.22)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, rgba(252, 138, 123, 0.25), rgba(220, 246, 244, 0.92))",
        "confetti-pattern":
          "radial-gradient(circle at 10% 20%, rgba(252, 138, 123, 0.15) 0, rgba(252, 138, 123, 0) 45%), radial-gradient(circle at 80% 10%, rgba(15, 151, 144, 0.2) 0, rgba(15, 151, 144, 0) 45%), radial-gradient(circle at 50% 80%, rgba(255, 203, 5, 0.25) 0, rgba(255, 203, 5, 0) 55%)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
        times: "var(--font-times)",
      },
      maxWidth: {
        content: "980px",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
