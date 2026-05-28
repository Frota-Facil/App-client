import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Header } from "../../components/layout/Hearder";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { VehicleCard } from "../../components/cards/VehicleCard";
import { TripCard } from "../../components/cards/TripCard";

import { vehicles } from "../../constants/data";
import { trips } from "../../constants/trips";
import { styles } from "../../styles/globalStyles";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const todayTrips = trips.filter((trip) => trip.period === "today");
  const nextTrips = trips.filter((trip) => trip.period === "next");
  const activeTrips = trips.filter(
    (trip) => trip.status === "scheduled" || trip.status === "in_progress"
  );
  const nextTripsPreview = nextTrips.slice(0, 2);

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available"
  );

  const openTripDetails = (id: number) => {
    router.push({
      pathname: "/trips/[id]",
      params: { id: String(id) },
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Header />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas Viagens</Text>
        </View>

        <View style={styles.tripGroupHeader}>
          <Text style={styles.tripGroupTitle}>HOJE</Text>
          <Text style={styles.tripGroupCount}>
            {todayTrips.length} viagem(ns)
          </Text>
        </View>

        {todayTrips.map((trip) => (
          <TripCard
            key={trip.id}
            {...trip}
            onPress={() => openTripDetails(trip.id)}
          />
        ))}

        <View style={styles.tripGroupHeader}>
          <Text style={styles.tripGroupTitle}>PRÓXIMAS</Text>
          <TouchableOpacity onPress={() => router.push("/trips")}>
            <Text style={styles.tripGroupCount}>
              Ver todas ({activeTrips.length} viagens)
            </Text>
          </TouchableOpacity>
        </View>

        {nextTripsPreview.map((trip) => (
          <TripCard
            key={trip.id}
            {...trip}
            onPress={() => openTripDetails(trip.id)}
          />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Veículos recentes</Text>

          <TouchableOpacity
            onPress={() => router.push("/vehicles?filter=available")}
          >
            <Text style={styles.sectionLink}>
              Ver todos ({availableVehicles.length} disponíveis)
            </Text>
          </TouchableOpacity>
        </View>

        {availableVehicles.map((v) => (
          <VehicleCard key={v.id} {...v} />
        ))}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}
