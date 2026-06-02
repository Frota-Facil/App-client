import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { PageHeader } from "../../components/layout/PageHeader";
import { colors } from "../../constants/colors";
import { SCREEN_PADDING } from "../../styles/globalStyles";

const ACTION_PRIMARY = colors.primary;

export default function MakeRequest() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [destination, setDestination] = useState("");
  const [reason, setReason] = useState("");
  const [passengers, setPassengers] = useState("1");

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Nova solicitação"
        subtitle="Preencha os dados da viagem"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.body}>
        {/* DATA */}
        <Text style={styles.label}>Data de uso</Text>
        <TextInput
          placeholder="dd/mm/aaaa"
          value={date}
          onChangeText={setDate}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        {/* HORÁRIOS */}
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.label}>Início</Text>
            <TextInput
              placeholder="--:--"
              value={start}
              onChangeText={setStart}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.label}>Término previsto</Text>
            <TextInput
              placeholder="--:--"
              value={end}
              onChangeText={setEnd}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* DESTINO */}
        <Text style={styles.label}>Destino</Text>
        <TextInput
          placeholder="Local de destino"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        {/* FINALIDADE */}
        <Text style={styles.label}>Finalidade</Text>
        <TextInput
          placeholder="Motivo da solicitação"
          value={reason}
          onChangeText={setReason}
          style={[styles.input, styles.textArea]}
          multiline
          placeholderTextColor={colors.textMuted}
        />

        {/* VEÍCULO (mockado por enquanto) */}
        <Text style={styles.label}>Veículo preferido</Text>
        <View style={styles.selectBox}>
          <Text style={styles.selectText}>Fiat Strada — BRA-2E19</Text>
        </View>

        {/* PASSAGEIROS */}
        <Text style={styles.label}>Passageiros</Text>
        <TextInput
          value={passengers}
          onChangeText={setPassengers}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={colors.textMuted}
        />

        {/* BOTÕES */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => {
              console.log({
                date,
                start,
                end,
                destination,
                reason,
                passengers,
              });
            }}
          >
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  body: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 20,
    paddingBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: colors.textSecondary,
  },

  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 15,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  selectBox: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },

  selectText: {
    color: colors.textPrimary,
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  flex: {
    flex: 1,
  },

  buttons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },

  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  cancelButton: {
    backgroundColor: "#E5E7EB",
  },

  saveButton: {
    backgroundColor: ACTION_PRIMARY,
  },

  cancelText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
