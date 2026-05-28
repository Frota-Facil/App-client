import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { TripCard } from "../../components/cards/TripCard";
import { PageHeader } from "../../components/layout/PageHeader";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { trips } from "../../constants/trips";
import { styles } from "../../styles/globalStyles";

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const activeTrips = trips.filter(
    (trip) => trip.status === "scheduled" || trip.status === "in_progress"
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <PageHeader
        title="Minhas Viagens"
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) },
        ]}
      >
        {activeTrips.map((trip) => (
          <TripCard key={trip.id} {...trip} />
        ))}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}
