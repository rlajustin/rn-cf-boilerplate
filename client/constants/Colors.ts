export type ColorTypes = {
  primary: string;
  secondary: string;
  surface: string;
  background: string;
  border: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;
};

export const Colors: { light: ColorTypes; dark: ColorTypes } = {
  light: {
    primary: "#2C3E50",
    secondary: "#7F8C8D",
    surface: "#ECF0F1",
    background: "#F5F6FA",
    border: "#BDC3C7",

    accent: "#3498DB",
    accentLight: "#5DADE2",

    success: "#27AE60",
    warning: "#F39C12",
    error: "#E74C3C",
  },
  dark: {
    primary: "#ECF0F1",
    secondary: "#95A5A6",
    surface: "#34495E",
    background: "#2C3E50",
    border: "#4A6278",

    accent: "#3498DB",
    accentLight: "#5DADE2",

    success: "#2ECC71",
    warning: "#F1C40F",
    error: "#E74C3C",
  },
};
