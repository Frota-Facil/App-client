import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Car, Clock3, MapPin, Play  } from "lucide-react-native";

import { PageHeader } from "../../components/layout/PageHeader";
import {
  getTabBarContentPadding,
  getTabBarHeight,
  TabBar,
} from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import { TripStatus, trips } from "../../constants/trips";
import {
  CARD_BORDER_COLOR,
  CARD_RADIUS,
  SCREEN_PADDING,
  styles,
} from "../../styles/globalStyles";

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
const TRIP_ACTION_FOOTER_HEIGHT = 86;

const canStartTrip = (startDateTime: string) => {
  const start = new Date(startDateTime);

  if (Number.isNaN(start.getTime())) {
    return false;
  }

  return start.getTime() - Date.now() <= TEN_MINUTES_IN_MS;
};

const getStatus = (status: TripStatus) => {
  switch (status) {
    case "in_progress":
      return {
        label: "Em andamento",
        bg: "#CCFBF1",
        color: "#0F766E",
      };

    case "finished":
      return {
        label: "Finalizada",
        bg: "#DCFCE7",
        color: "#16A34A",
      };

    default:
      return {
        label: "Agendada",
        bg: "#FEF3C7",
        color: "#92400E",
      };
  }
};

type DetailRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <View style={localStyles.detailRow}>
    <View style={localStyles.detailIconWrapper}>{icon}</View>

    <View style={localStyles.detailTextArea}>
      <Text style={localStyles.detailLabel}>{label}</Text>
      <Text style={localStyles.detailValue}>{value}</Text>
    </View>
  </View>
);

export default function TripDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const trip = trips.find((item) => String(item.id) === id);

  if (!trip) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <PageHeader
          title="Detalhes da viagem"
          subtitle="Viagem não encontrada"
          leftIconSource={require("../../assets/images/seta-esquerda.png")}
          onBackPress={() => router.back()}
        />

        <View style={localStyles.emptyState}>
          <Text style={localStyles.emptyStateText}>Viagem não encontrada.</Text>
        </View>

        <TabBar />
      </SafeAreaView>
    );
  }

  const status = getStatus(trip.status);
  const isInProgress = trip.status === "in_progress";
  const isActionEnabled = isInProgress || canStartTrip(trip.startDateTime);
  const actionLabel = isInProgress ? "Finalizar viagem" : "Iniciar viagem";

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <PageHeader
        title="Detalhes da viagem"
        subtitle={trip.fullDate}
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          {
            paddingBottom:
              getTabBarContentPadding(insets.bottom) +
              TRIP_ACTION_FOOTER_HEIGHT,
          },
        ]}
      >
        <View style={localStyles.card}>
          <View style={localStyles.summaryTop}>
            <View style={localStyles.summaryDestination}>
              <Text style={localStyles.sectionLabel}>DESTINO</Text>

              <View style={localStyles.destinationRow}>
                <MapPin size={22} color="#006D77" />
                <Text style={localStyles.destinationText}>
                  {trip.destination}
                </Text>
              </View>
            </View>

            <View style={[localStyles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[localStyles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[localStyles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <View style={localStyles.divider} />

          <Text style={localStyles.sectionLabel}>FINALIDADE</Text>
          <Text style={localStyles.purposeText}>{trip.purpose}</Text>
        </View>

        <View style={[localStyles.card, localStyles.gapcard]}>
          <DetailRow
            icon={<Car size={18} color="#006D77" />}
            label="Veículo"
            value={`${trip.vehicle} • ${trip.plate}`}
          />

          <DetailRow
            icon={<Clock3 size={18} color="#006D77" />}
            label="Horário de início"
            value={trip.startTime}
          />

          <DetailRow
            icon={<Clock3 size={18} color="#006D77" />}
            label="Horário previsto de término"
            value={trip.endTime}
          />

          
        </View>
      </ScrollView>

      <View style={[localStyles.footer, { bottom: tabBarHeight }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isActionEnabled}
          onPress={() => console.log(actionLabel)}
          style={[
            localStyles.actionButton,
            !isActionEnabled && localStyles.actionButtonDisabled,
          ]}
        >
          <Play
            size={18}
            color={isActionEnabled ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            style={[
              localStyles.actionButtonText,
              !isActionEnabled && localStyles.actionButtonTextDisabled,
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: CARD_BORDER_COLOR,
    padding: 20,
  
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },


  gapcard: {
    gap: 20,
  },




  summaryTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  summaryDestination: {
    flex: 1,
    minWidth: 0,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },

  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  destinationText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: CARD_BORDER_COLOR,
    marginVertical: 18,
  },

  purposeText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E6F6FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailTextArea: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },

  detailValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: TRIP_ACTION_FOOTER_HEIGHT,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER_COLOR,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 14,
  },

  actionButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#005C6B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  actionButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  actionButtonTextDisabled: {
    color: "#6B7280",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SCREEN_PADDING,
  },

  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
