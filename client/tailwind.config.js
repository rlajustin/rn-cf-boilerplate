/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./shared-components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        surface: "var(--color-surface)",
        background: "var(--color-background)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        accentLight: "var(--color-accent-light)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
      },
    },
  },
  plugins: [
    ({ addBase }) =>
      addBase({
        ":root": {
          "--color-primary": "#2C3E50",
          "--color-secondary": "#7F8C8D",
          "--color-surface": "#ECF0F1",
          "--color-background": "#F5F6FA",
          "--color-border": "#BDC3C7",
          "--color-accent": "#3498DB",
          "--color-accent-light": "#5DADE2",
          "--color-success": "#27AE60",
          "--color-warning": "#F39C12",
          "--color-error": "#E74C3C",
        },
      }),
  ],
};
