import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { router } from "expo-router";


type Props = {
  title?: string;
  onPress?: () => void;
};

export function RequestButton({ title = "Solicitar veículo", }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={() => router.push("/addrequest")}>
      <Text style={styles.icon}>＋</Text>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#F4A62A",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 16,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});