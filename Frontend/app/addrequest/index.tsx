import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";





export default function MakeRequest() {
 

  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [destination, setDestination] = useState("");
  const [reason, setReason] = useState("");
  const [passengers, setPassengers] = useState("1");

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/seta-esquerda.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Nova solicitação</Text>
          <Text style={styles.subtitle}>Preencha os dados da viagem</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* DATA */}
        <Text style={styles.label}>Data de uso</Text>
        <TextInput
          placeholder="dd/mm/aaaa"
          value={date}
          onChangeText={setDate}
          style={styles.input}
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
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.label}>Término previsto</Text>
            <TextInput
              placeholder="--:--"
              value={end}
              onChangeText={setEnd}
              style={styles.input}
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
        />

        {/* FINALIDADE */}
        <Text style={styles.label}>Finalidade</Text>
        <TextInput
          placeholder="Motivo da solicitação"
          value={reason}
          onChangeText={setReason}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        {/* VEÍCULO (mockado por enquanto) */}
        <Text style={styles.label}>Veículo preferido</Text>
        <View style={styles.input}>
          <Text>Fiat Strada — BRA-2E19</Text>
        </View>

        {/* PASSAGEIROS */}
        <Text style={styles.label}>Passageiros</Text>
        <TextInput
          value={passengers}
          onChangeText={setPassengers}
          style={styles.input}
          keyboardType="numeric"
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
    backgroundColor: "#F9FAFB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  body: {
    padding: 20,
  },

  label: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 12,
    color: "#374151",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  flex: {
    flex: 1,
  },

  buttons: {

    flexDirection: "row",
    marginTop: 20,
    gap: 10,
    
  },
  

button: {
  flex: 1,
  padding: 14,
  borderRadius: 30,
  alignItems: "center",
},

cancelButton: {
  backgroundColor: "#E5E7EB",
},

saveButton: {
  backgroundColor: "#2563EB",
},

cancelText: {
  color: "#374151",
  fontWeight: "bold",
},

saveText: {
  color: "#FFF",
  fontWeight: "bold",
},



backIcon: {
  width: 20,
  height: 20,
  marginLeft: 5,
  marginRight: 10,
},
 
  
});