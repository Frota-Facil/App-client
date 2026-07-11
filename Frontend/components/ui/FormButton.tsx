import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors } from "../../constants/colors";

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
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: colors.background,
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
  },

  textPrimary: {
    color: colors.textLight,
  },

  textSecondary: {
    color: colors.textPrimary,
  },
});
