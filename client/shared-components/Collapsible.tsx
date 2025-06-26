import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { IconSymbol } from "@/client/shared-components/ui/IconSymbol";
import { useTheme } from "contexts/ThemeContext";

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <View>
      <TouchableOpacity style={styles.heading} onPress={() => setIsOpen((value) => !value)} activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme.primary}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />

        <Text className="font-semibold">{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
