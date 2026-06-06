import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { styles } from "../../styles/globalStyles";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { FilterTabs } from "../../components/layout/FilterTabs";
import {
  getVehicleDisplayName,
  normalizeVehicleStatus,
  vehicles,
} from "../../constants/data";
import { colors } from "../../constants/colors";
import { VehicleCard } from "../../components/cards/VehicleCard";

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
    const normalizedStatus = normalizeVehicleStatus(v.status);
    const displayName = getVehicleDisplayName(v);
    const matchSearch =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "Todos" ||
      (filter === "Disponíveis" && normalizedStatus === "available") ||
      (filter === "Em uso" && normalizedStatus === "in_use") ||
      (filter === "Indisponíveis" && normalizedStatus === "unavailable") ||
      (filter === "Manutenção" && normalizedStatus === "maintenance");

    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={screenStyles.root} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.surface}
        style="dark"
        translucent={false}
      />

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

      <View style={screenStyles.contentArea}>
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
            {filteredVehicles.map((v) => (
              <VehicleCard key={v.id} {...v} variant="grid" />
            ))}
          </View>
        </ScrollView>
      </View>

      <TabBar />

    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
