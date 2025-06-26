/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/shared-components/**/*.{js,jsx,ts,tsx}"],
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
