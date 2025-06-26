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
};
