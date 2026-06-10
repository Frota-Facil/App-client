import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export function FormButton({
  title,
  onPress,
  variant = "primary",
  style,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "primary"
            ? styles.textPrimary
            : styles.textSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    maxHeight: 40,
    maxWidth: 40,
    height: 40,
    width: 40,
    flex: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  primary: {
    backgroundColor: "#0F766E",
  },

  secondary: {
    backgroundColor: "#F3F4F6",
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
  },

  textPrimary: {
    color: "#fff",
  },

  textSecondary: {
    color: "#111827",
  },
});