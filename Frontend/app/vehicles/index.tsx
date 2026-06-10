import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  ScrollView,
  Text,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { styles } from "../../styles/globalStyles";
import { getTabBarContentPadding } from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { FilterTabs } from "../../components/layout/FilterTabs";
import {
  getVehicleDisplayName,
  normalizeVehicleStatus,
  type Vehicle,
} from "../../constants/data";
import { colors } from "../../constants/colors";
import { VehicleCard } from "../../components/cards/VehicleCard";
import { useAuth } from "../../contexts/AuthContext";
import { getVehicles, VehicleRequestError } from "../../services/vehicles";

type VehicleFilter =
  | "Todos"
  | "Disponíveis"
  | "Em uso"
  | "Indisponíveis ou Manutenção";

const filters: VehicleFilter[] = [
  "Todos",
  "Disponíveis",
  "Em uso",
  "Indisponíveis ou Manutenção",
];

const getFilterFromParam = (
  filterParam: string | string[] | undefined
): VehicleFilter => {
  const value = Array.isArray(filterParam) ? filterParam[0] : filterParam;

  if (value === "available") {
    return "Disponíveis";
  }

  if (value === "in_use") {
    return "Em uso";
  }

  if (value === "maintenance" || value === "unavailable") {
    return "Indisponíveis ou Manutenção";
  }

  return "Todos";
};

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, token } = useAuth();
  const { filter: filterParam } = useLocalSearchParams<{
    filter?: string | string[];
  }>();
  const [filter, setFilter] = useState<VehicleFilter>(() =>
    getFilterFromParam(filterParam)
  );
  const [search, setSearch] = useState("");
  const [fleetVehicles, setFleetVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFilter(getFilterFromParam(filterParam));
  }, [filterParam]);

  useEffect(() => {
    let isCurrent = true;

    const loadVehicles = async () => {
      if (!token) {
        setFleetVehicles([]);
        setIsLoadingVehicles(false);
        return;
      }

      setIsLoadingVehicles(true);
      setErrorMessage("");

      try {
        const nextVehicles = await getVehicles(token);

        if (isCurrent) {
          setFleetVehicles(nextVehicles);
        }
      } catch (error) {
        if (error instanceof VehicleRequestError && error.status === 401) {
          await signOut();
          return;
        }

        if (!isCurrent) {
          return;
        }

        if (error instanceof VehicleRequestError) {
          if (error.status === 403 || error.isConnectionError) {
            setErrorMessage(error.message);
            return;
          }
        }

        setErrorMessage("Não foi possível carregar os veículos.");
      } finally {
        if (isCurrent) {
          setIsLoadingVehicles(false);
        }
      }
    };

    loadVehicles();

    return () => {
      isCurrent = false;
    };
  }, [signOut, token]);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return fleetVehicles.filter((vehicle) => {
      const normalizedStatus = normalizeVehicleStatus(vehicle.status);
      const displayName = getVehicleDisplayName(vehicle);
      const matchSearch =
        !normalizedSearch ||
        displayName.toLowerCase().includes(normalizedSearch) ||
        vehicle.plate.toLowerCase().includes(normalizedSearch);

      const matchFilter =
        filter === "Todos" ||
        (filter === "Disponíveis" && normalizedStatus === "available") ||
        (filter === "Em uso" && normalizedStatus === "in_use") ||
        (filter === "Indisponíveis ou Manutenção" &&
          normalizedStatus === "maintenance");

      return matchSearch && matchFilter;
    });
  }, [filter, fleetVehicles, search]);

  const isShowingListState =
    isLoadingVehicles || Boolean(errorMessage) || filteredVehicles.length === 0;
  const emptyMessage =
    fleetVehicles.length === 0
      ? "Nenhum veículo cadastrado."
      : "Nenhum veículo encontrado para os filtros selecionados.";

  const renderVehicleContent = () => {
    if (isLoadingVehicles) {
      return (
        <View style={screenStyles.listState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={screenStyles.listStateText}>Carregando veículos...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={screenStyles.listState}>
          <Text style={screenStyles.listStateText}>{errorMessage}</Text>
        </View>
      );
    }

    if (filteredVehicles.length === 0) {
      return (
        <View style={screenStyles.listState}>
          <Text style={screenStyles.listStateText}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.vehicleGrid}>
        {filteredVehicles.map((vehicle) => (
          <VehicleCard key={String(vehicle.id)} {...vehicle} variant="grid" />
        ))}
      </View>
    );
  };

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
            isShowingListState && screenStyles.stateListContent,
            { paddingBottom: getTabBarContentPadding(insets.bottom) },
          ]}
        >
          {renderVehicleContent()}
        </ScrollView>
      </View>

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

  stateListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  listState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  listStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
});
