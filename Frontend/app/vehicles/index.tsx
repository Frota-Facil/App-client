import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { styles } from "../../styles/globalStyles";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { FilterTabs } from "../../components/layout/FilterTabs";
import { vehicles } from "../../constants/data";

type VehicleFilter =
  | "Todos"
  | "Disponíveis"
  | "Em uso"
  | "Indisponíveis"
  | "Manutenção";

const filters: VehicleFilter[] = [
  "Todos",
  "Disponíveis",
  "Em uso",
  "Indisponíveis",
  "Manutenção",
];

const getFilterFromParam = (
  filterParam: string | string[] | undefined
): VehicleFilter => {
  const value = Array.isArray(filterParam) ? filterParam[0] : filterParam;

  if (value === "available") {
    return "Disponíveis";
  }

  return "Todos";
};

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { filter: filterParam } = useLocalSearchParams<{
    filter?: string | string[];
  }>();
  const [filter, setFilter] = useState<VehicleFilter>(() =>
    getFilterFromParam(filterParam)
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFilter(getFilterFromParam(filterParam));
  }, [filterParam]);

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
    <SafeAreaView style={styles.root} edges={["top"]}>
      <PageHeader
        title="Veículos"
        subtitle="Frota municipal"
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
        rightContent={
          <HeaderHelpButton
            title="Como usar Veículos"
            message="Nesta tela você pode visualizar os veículos cadastrados, conferir a disponibilidade e usar os filtros para encontrar veículos disponíveis, em uso ou em manutenção."
          />
        }
      />

      <FilterTabs options={filters} value={filter} onChange={setFilter} />

      {/* BUSCA COM ÍCONE */}
      <View style={styles.vehicleSearchArea}>
        <View style={styles.vehicleSearchInputWrapper}>
          <Image
            source={require("../../assets/images/lupa.png")}
            style={styles.vehicleSearchIcon}
          />

          <TextInput
            placeholder="Buscar por modelo ou placa"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.vehicleSearchInput}
          />
        </View>
      </View>

      {/* LISTA */}
      <ScrollView
        style={styles.vehicleList}
        contentContainerStyle={[
          styles.screenContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) },
        ]}
      >
        <View style={styles.vehicleGrid}>
          {filteredVehicles.map((v) => {
            const status = getStatusStyle(v.status);

            return (
              <View key={v.id} style={styles.vehicleGridCard}>
                {/* IMAGEM */}
                <View style={styles.vehicleGridImage}>
                  <Text>🚗</Text>
                </View>

                {/* INFO */}
                <Text style={styles.vehicleGridName}>{v.name}</Text>

                <Text style={styles.vehicleGridPlate}>{v.plate}</Text>

                {/* STATUS */}
                <View
                  style={[
                    styles.vehicleGridStatus,
                    { backgroundColor: status.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.vehicleGridStatusText,
                      { color: status.text },
                    ]}
                  >
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
