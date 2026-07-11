import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

import { colors } from "../../constants/colors";

type HeaderHelpButtonProps = {
  title: string;
  message: string;
};

export function HeaderHelpButton({ title, message }: HeaderHelpButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={title}
      activeOpacity={0.7}
      onPress={() => Alert.alert(title, message)}
      style={styles.button}
    >
      <Text style={styles.text}>?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  text: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
  },
});
