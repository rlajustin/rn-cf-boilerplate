import React, { createContext, useContext } from "react";
import { useColorScheme, View } from "react-native";
import { vars } from "nativewind";
import { Colors, ColorTypes } from "@/client/constants/Colors";

const themes = {
  light: {
    "--color-primary": Colors.light.primary,
    "--color-secondary": Colors.light.secondary,
    "--color-surface": Colors.light.surface,
    "--color-background": Colors.light.background,
    "--color-border": Colors.light.border,
    "--color-accent": Colors.light.accent,
    "--color-accent-light": Colors.light.accentLight,
    "--color-success": Colors.light.success,
    "--color-warning": Colors.light.warning,
    "--color-error": Colors.light.error,
  },
  dark: {
    "--color-primary": Colors.dark.primary,
    "--color-secondary": Colors.dark.secondary,
    "--color-surface": Colors.dark.surface,
    "--color-background": Colors.dark.background,
    "--color-border": Colors.dark.border,
    "--color-accent": Colors.dark.accent,
    "--color-accent-light": Colors.dark.accentLight,
    "--color-success": Colors.dark.success,
    "--color-warning": Colors.dark.warning,
    "--color-error": Colors.dark.error,
  },
};

type ThemeContextType = {
  theme: ColorTypes;
  colorScheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme() ?? "light";
  return (
    <ThemeContext.Provider value={{ colorScheme, theme: Colors[colorScheme] }}>
      <View style={[{ flex: 1 }, vars(themes[colorScheme])]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
