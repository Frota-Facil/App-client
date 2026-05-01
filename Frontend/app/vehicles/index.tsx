import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { styles } from "../../styles/globalStyles";
import { TabBar } from "../../components/layout/TabBar";
import { vehicles } from "../../constants/data";

export default function VehiclesScreen() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const filters = [
    "Todos",
    "Disponíveis",
    "Em uso",
    "Indisponíveis",
    "Manutenção",
  ];

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "Todos" ||
      (filter === "Disponíveis" && v.status === "available") ||
      (filter === "Em uso" && v.status === "in_use") ||
      (filter === "Indisponíveis" && v.status === "unavailable") ||
      (filter === "Manutenção" && v.status === "maintenance");

    return matchSearch && matchFilter;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "available":
        return { bg: "#DCFCE7", text: "#166534", label: "Disponível" };
      case "in_use":
        return { bg: "#DBEAFE", text: "#1E3A8A", label: "Em uso" };
      case "maintenance":
        return { bg: "#FEF3C7", text: "#92400E", label: "Manutenção" };
      default:
        return { bg: "#FEE2E2", text: "#991B1B", label: "Indisponível" };
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/seta-esquerda.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Veículos
          </Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            Frota municipal
          </Text>
        </View>
      </View>

      {/* BUSCA COM ÍCONE */}
      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>

          <TextInput
            placeholder="Buscar por modelo ou placa"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, padding: 10 }}
          />
        </View>
      </View>

      {/* FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10, maxHeight: 40 }}
      >
        <View style={{ flexDirection: "row", paddingHorizontal: 10 }}>
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor:
                  filter === item ? "#2563EB" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: filter === item ? "#fff" : "#374151",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* LISTA */}
      <ScrollView style={{ marginTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          {filteredVehicles.map((v) => {
            const status = getStatusStyle(v.status);

            return (
              <View
                key={v.id}
                style={{
                  width: "48%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                {/* IMAGEM */}
                <View
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderRadius: 12,
                    height: 80,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>🚗</Text>
                </View>

                {/* INFO */}
                <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                  {v.name}
                </Text>

                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  {v.plate}
                </Text>

                {/* STATUS */}
                <View
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-start",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: status.bg,
                  }}
                >
                  <Text style={{ fontSize: 12, color: status.text }}>
                    {status.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}