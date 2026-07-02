import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { TripCard } from "../../components/cards/TripCard";
import { PageHeader } from "../../components/layout/PageHeader";
import { getTabBarContentPadding } from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import {
  isTripFinished,
  sortTripsByStartDate,
  type Trip,
} from "../../constants/trips";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTrips, TripRequestError } from "../../services/trips";
import { SCREEN_PADDING, styles } from "../../styles/globalStyles";

const getLoadErrorMessage = (error: unknown) => {
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

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      const loadTrips = async () => {
        if (!token) {
          if (isCurrent) {
            setTrips([]);
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
          const nextTrips = await getMyTrips(token);

          if (isCurrent) {
            setTrips(
              sortTripsByStartDate(
                nextTrips.filter((trip) => !isTripFinished(trip))
              )
            );
          }
        } catch (error) {
          if (error instanceof TripRequestError && error.status === 401) {
            await signOut();
            return;
          }

          if (isCurrent) {
            setTrips([]);
            setErrorMessage(getLoadErrorMessage(error));
          }
        } finally {
          if (isCurrent) {
            setIsLoading(false);
          }
        }
      };

      void loadTrips();

      return () => {
        isCurrent = false;
      };
    }, [signOut, token])
  );

  const openTripDetails = (id: string) => {
    router.push({
      pathname: "/trips/[id]",
      params: { id },
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={screenStyles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={screenStyles.stateText}>Carregando viagens...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={screenStyles.stateContainer}>
          <Text style={screenStyles.errorText}>{errorMessage}</Text>
        </View>
      );
    }

    if (trips.length === 0) {
      return (
        <View style={screenStyles.stateContainer}>
          <Text style={screenStyles.stateText}>
            Você ainda não possui viagens.
          </Text>
        </View>
      );
    }

    return trips.map((trip) => (
      <TripCard
        key={trip.id}
        trip={trip}
        onPress={() => openTripDetails(trip.id)}
      />
    ));
  };

  const isShowingState = isLoading || Boolean(errorMessage) || trips.length === 0;

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
          isShowingState && screenStyles.stateContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) },
        ]}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  stateContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 40,
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: "center",
  },
});
