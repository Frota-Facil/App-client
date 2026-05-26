import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available"
  );

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
          <TripCard key={trip.id} {...trip} />
        ))}

        <View style={styles.tripGroupHeader}>
          <Text style={styles.tripGroupTitle}>PRÓXIMAS</Text>
          <Text style={styles.tripGroupCount}>
            {nextTrips.length} viagem(ns)
          </Text>
        </View>

        {nextTrips.map((trip) => (
          <TripCard key={trip.id} {...trip} />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Veículos recentes</Text>

          <Text style={styles.sectionLink}>
            Ver todos ({availableVehicles.length} disponíveis)
          </Text>
        </View>

        {vehicles.map((v) => (
          <VehicleCard key={v.id} {...v} />
        ))}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}
