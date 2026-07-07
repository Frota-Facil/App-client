import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { Header } from "../../components/layout/Hearder";
import { getTabBarContentPadding } from "../../components/layout/TabBar";
import { VehicleCard } from "../../components/cards/VehicleCard";
import { TripCard } from "../../components/cards/TripCard";

import {
  isTripFinished,
  isTripToday,
  isUpcomingTrip,
  sortTripsByStartDate,
} from "../../constants/trips";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTrips, TripRequestError } from "../../services/trips";
import {
  getAvailableVehicles,
  VehicleRequestError,
} from "../../services/vehicles";
import {
  queryKeys,
  queryRefreshIntervals,
} from "../../services/queryKeys";
import { styles } from "../../styles/globalStyles";

const HOME_TRIP_LIMIT = 2;
const HOME_VEHICLE_LIMIT = 2;

const getTripLoadError = (error: unknown) => {
  if (error instanceof TripRequestError) {
    if (error.status === 403) {
      return "Você não tem permissão para acessar as viagens.";
    }

    if (error.isConnectionError) {
      return "Não foi possível conectar ao servidor.";
    }
  }

  return "Não foi possível carregar as viagens.";
};

const getVehicleLoadError = (error: unknown) => {
  if (error instanceof VehicleRequestError) {
    if (error.status === 403) {
      return "Você não tem permissão para acessar os veículos.";
    }

    if (error.isConnectionError) {
      return "Não foi possível conectar ao servidor.";
    }
  }

  return "Não foi possível carregar os veículos.";
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { signOut, token } = useAuth();
  const {
    data: tripsData = [],
    error: tripsError,
    isLoading: isLoadingTrips,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: queryKeys.trips,
    queryFn: () => getMyTrips(token ?? ""),
    enabled: Boolean(token),
    staleTime: 1000 * 5,
    refetchInterval: isFocused ? queryRefreshIntervals.standard : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
  const {
    data: availableVehicles = [],
    error: vehiclesError,
    isLoading: isLoadingVehicles,
    refetch: refetchAvailableVehicles,
  } = useQuery({
    queryKey: queryKeys.availableVehicles,
    queryFn: () => getAvailableVehicles(token ?? ""),
    enabled: Boolean(token),
    staleTime: 1000 * 5,
    refetchInterval: isFocused ? queryRefreshIntervals.standard : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (token) {
        void refetchTrips();
        void refetchAvailableVehicles();
      }
    }, [refetchAvailableVehicles, refetchTrips, token])
  );

  useEffect(() => {
    const hasUnauthorizedError =
      (tripsError instanceof TripRequestError && tripsError.status === 401) ||
      (vehiclesError instanceof VehicleRequestError &&
        vehiclesError.status === 401);

    if (hasUnauthorizedError) {
      void signOut();
    }
  }, [signOut, tripsError, vehiclesError]);

  const trips = useMemo(
    () =>
      sortTripsByStartDate(
        tripsData.filter((trip) => !isTripFinished(trip))
      ),
    [tripsData]
  );
  const isLoading = isLoadingTrips || isLoadingVehicles;
  const tripError = tripsError ? getTripLoadError(tripsError) : "";
  const vehicleError = vehiclesError ? getVehicleLoadError(vehiclesError) : "";
  const todayTrips = useMemo(
    () => trips.filter(isTripToday),
    [trips]
  );
  const upcomingTrips = useMemo(
    () => trips.filter(isUpcomingTrip),
    [trips]
  );
  const todayTripsPreview = todayTrips.slice(0, HOME_TRIP_LIMIT);
  const upcomingTripsPreview = upcomingTrips.slice(0, HOME_TRIP_LIMIT);
  const vehiclesPreview = availableVehicles.slice(0, HOME_VEHICLE_LIMIT);

  const openTripDetails = (id: string) => {
    router.push({
      pathname: "/trips/[id]",
      params: { id },
    });
  };

  return (
    <SafeAreaView style={homeStyles.root} edges={["top"]}>
      {isFocused && (
        <StatusBar
          backgroundColor={colors.primary}
          style="light"
          translucent={false}
        />
      )}

      <View style={homeStyles.headerArea}>
        <Header />
      </View>

      <ScrollView
        style={[styles.body, homeStyles.body]}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) + 24 },
        ]}
      >
        <View style={homeStyles.section}>
          <View style={[styles.sectionHeader, homeStyles.sectionHeader]}>
            <Text style={styles.sectionTitle}>Minhas Viagens</Text>
            <TouchableOpacity
              hitSlop={{ top: 10, right: 8, bottom: 10, left: 8 }}
              onPress={() => router.push("/trips")}
            >
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={homeStyles.stateContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={homeStyles.stateText}>Carregando dados...</Text>
            </View>
          ) : tripError ? (
            <View style={homeStyles.stateBlock}>
              <Text style={homeStyles.errorText}>{tripError}</Text>
            </View>
          ) : (
            <>
              <View style={homeStyles.tripGroup}>
                <View
                  style={[
                    styles.tripGroupHeader,
                    homeStyles.tripGroupHeader,
                  ]}
                >
                  <Text style={styles.tripGroupTitle}>HOJE</Text>
                  <Text style={styles.tripGroupCount}>
                    {todayTrips.length} viagem(ns)
                  </Text>
                </View>

                {todayTripsPreview.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onPress={() => openTripDetails(trip.id)}
                  />
                ))}

                {todayTripsPreview.length === 0 && (
                  <View style={homeStyles.emptyBlock}>
                    <Text style={homeStyles.emptyText}>
                      Nenhuma viagem para hoje.
                    </Text>
                  </View>
                )}
              </View>

              <View style={homeStyles.tripGroup}>
                <View
                  style={[
                    styles.tripGroupHeader,
                    homeStyles.tripGroupHeader,
                  ]}
                >
                  <Text style={styles.tripGroupTitle}>PRÓXIMAS</Text>
                  <Text style={styles.tripGroupCount}>
                    {upcomingTrips.length} viagem(ns)
                  </Text>
                </View>

                {upcomingTripsPreview.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onPress={() => openTripDetails(trip.id)}
                  />
                ))}

                {upcomingTripsPreview.length === 0 && (
                  <View style={homeStyles.emptyBlock}>
                    <Text style={homeStyles.emptyText}>
                      Nenhuma próxima viagem.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {!isLoading && (
          <>
            <View style={[homeStyles.section, homeStyles.vehicleSection]}>
              <View style={[styles.sectionHeader, homeStyles.sectionHeader]}>
                <Text style={styles.sectionTitle}>Veículos recentes</Text>

                <TouchableOpacity
                  onPress={() => router.push("/vehicles?filter=available")}
                >
                  <Text style={styles.sectionLink}>
                    Ver todos ({availableVehicles.length} disponíveis)
                  </Text>
                </TouchableOpacity>
              </View>

              {vehicleError ? (
                <View style={homeStyles.stateBlock}>
                  <Text style={homeStyles.errorText}>{vehicleError}</Text>
                </View>
              ) : vehiclesPreview.length > 0 ? (
                vehiclesPreview.map((vehicle) => (
                  <VehicleCard key={String(vehicle.id)} {...vehicle} />
                ))
              ) : (
                <View style={homeStyles.emptyBlock}>
                  <Text style={homeStyles.emptyText}>
                    Nenhum veículo disponível no momento.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const homeStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerArea: {
    backgroundColor: colors.background,
  },
  body: {
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 26,
  },
  vehicleSection: {
    marginTop: 8,
    marginBottom: 0,
  },
  sectionHeader: {
    marginTop: 0,
    marginBottom: 12,
  },
  tripGroup: {
    marginBottom: 18,
  },
  tripGroupHeader: {
    marginTop: 0,
    marginBottom: 8,
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  stateBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
  },
});
