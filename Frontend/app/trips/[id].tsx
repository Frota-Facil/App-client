import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Car, Clock3, MapPin, Play, Square } from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "../../components/layout/PageHeader";
import {
  getTabBarContentPadding,
  getTabBarHeight,
} from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import {
  formatTripFullDate,
  formatTripTime,
  getTripStatusMeta,
  type Trip,
} from "../../constants/trips";
import { useAuth } from "../../contexts/AuthContext";
import {
  finishMyTrip,
  getMyTrip,
  startMyTrip,
  TripRequestError,
} from "../../services/trips";
import {
  queryKeys,
  queryRefreshIntervals,
} from "../../services/queryKeys";
import {
  baseCard,
  CARD_BORDER_COLOR,
  CARD_SPACING,
  SCREEN_PADDING,
  styles,
} from "../../styles/globalStyles";

const TRIP_ACTION_FOOTER_HEIGHT = 86;
const START_WINDOW_ERROR_MESSAGE =
  "A viagem só pode ser iniciada até 15 minutos antes do horário previsto.";

const getLoadErrorMessage = (error: unknown) => {
  if (error instanceof TripRequestError) {
    if (error.status === 403) {
      return "Você não tem permissão para acessar esta viagem.";
    }

    if (error.status === 404) {
      return "Viagem não encontrada.";
    }

    if (error.isConnectionError) {
      return "Não foi possível conectar ao servidor.";
    }
  }

  return "Não foi possível carregar a viagem.";
};

const getActionErrorMessage = (
  error: unknown,
  action: "iniciar" | "finalizar"
) => {
  if (error instanceof TripRequestError) {
    if (error.status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }

    if (error.isConnectionError) {
      return "Não foi possível conectar ao servidor.";
    }

    if (
      action === "iniciar" &&
      (error.status === 400 || error.status === 409)
    ) {
      const message = error.message.trim();

      if (
        message &&
        /15|minut|antes|hor.rio|iniciad|iniciar|permitid|previst/i.test(
          message
        )
      ) {
        return message.includes("15") ? message : START_WINDOW_ERROR_MESSAGE;
      }

      return message || START_WINDOW_ERROR_MESSAGE;
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  return `Não foi possível ${action} a viagem.`;
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
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const { id: idParam } = useLocalSearchParams<{
    id?: string | string[];
  }>();
  const routeId = Array.isArray(idParam) ? idParam[0] : idParam;
  const { signOut, token } = useAuth();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const [actionError, setActionError] = useState("");
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [description, setDescription] = useState("");
  const [finishError, setFinishError] = useState("");
  const tripQueryKey = routeId
    ? queryKeys.trip(routeId)
    : queryKeys.trip("unknown");
  const {
    data: trip = null,
    error: loadQueryError,
    isLoading,
  } = useQuery({
    queryKey: tripQueryKey,
    queryFn: () => getMyTrip(token ?? "", routeId ?? ""),
    enabled: Boolean(token && routeId),
    staleTime: 1000 * 5,
    refetchInterval: isFocused ? queryRefreshIntervals.standard : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (loadQueryError instanceof TripRequestError && loadQueryError.status === 401) {
      void signOut();
    }
  }, [loadQueryError, signOut]);

  const invalidateTripQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.trips }),
      queryClient.invalidateQueries({ queryKey: queryKeys.requests }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles }),
      queryClient.invalidateQueries({ queryKey: queryKeys.home }),
      routeId
        ? queryClient.invalidateQueries({ queryKey: queryKeys.trip(routeId) })
        : Promise.resolve(),
    ]);
  }, [queryClient, routeId]);

  const startTripMutation = useMutation({
    mutationFn: () => startMyTrip(token ?? "", routeId ?? ""),
    onSuccess: async (updatedTrip) => {
      queryClient.setQueryData<Trip>(tripQueryKey, updatedTrip);
      setActionError("");
      await invalidateTripQueries();
    },
  });

  const finishTripMutation = useMutation({
    mutationFn: (nextDescription: string) =>
      finishMyTrip(token ?? "", routeId ?? "", nextDescription),
    onSuccess: async (updatedTrip) => {
      queryClient.setQueryData<Trip>(tripQueryKey, updatedTrip);
      await invalidateTripQueries();
    },
  });

  const isStarting = startTripMutation.isPending;
  const isFinishing = finishTripMutation.isPending;
  const loadError = !routeId
    ? "Viagem não encontrada."
    : loadQueryError
      ? getLoadErrorMessage(loadQueryError)
      : "";

  const handleStartTrip = async () => {
    if (!token || !routeId || isStarting) {
      return;
    }

    setActionError("");

    try {
      await startTripMutation.mutateAsync();
    } catch (error) {
      if (error instanceof TripRequestError && error.status === 401) {
        await signOut();
        return;
      }

      setActionError(getActionErrorMessage(error, "iniciar"));
    }
  };

  const closeFinishModal = () => {
    if (isFinishing) {
      return;
    }

    setShowFinishModal(false);
    setDescription("");
    setFinishError("");
  };

  const handleFinishTrip = async () => {
    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      setFinishError("Informe uma descrição para finalizar a viagem.");
      return;
    }

    if (!token || !routeId || isFinishing) {
      return;
    }

    setFinishError("");

    try {
      await finishTripMutation.mutateAsync(trimmedDescription);
      setShowFinishModal(false);
      setDescription("");
      setActionError("");
      router.replace("/trips");
    } catch (error) {
      if (error instanceof TripRequestError && error.status === 401) {
        await signOut();
        return;
      }

      setFinishError(getActionErrorMessage(error, "finalizar"));
    }
  };

  const isScheduled = Boolean(
    trip && trip.routeStatus !== "STARTED" && trip.routeStatus !== "FINISHED"
  );
  const isInProgress = trip?.routeStatus === "STARTED";
  const hasAction = isScheduled || isInProgress;
  const status = trip ? getTripStatusMeta(trip.routeStatus) : null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={localStyles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={localStyles.stateText}>Carregando viagem...</Text>
        </View>
      );
    }

    if (loadError || !trip || !status) {
      return (
        <View style={localStyles.stateContainer}>
          <Text style={localStyles.errorText}>
            {loadError || "Viagem não encontrada."}
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={localStyles.card}>
          <View style={localStyles.summaryTop}>
            <View style={localStyles.summaryDestination}>
              <Text style={localStyles.sectionLabel}>DESTINO</Text>

              <View style={localStyles.destinationRow}>
                <MapPin size={22} color={colors.primary} />
                <Text style={localStyles.destinationText}>
                  {trip.destination}
                </Text>
              </View>
            </View>

            <View
              style={[
                localStyles.statusBadge,
                { backgroundColor: status.bg },
              ]}
            >
              <View
                style={[
                  localStyles.statusDot,
                  { backgroundColor: status.color },
                ]}
              />
              <Text style={[localStyles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <View style={localStyles.divider} />

          <Text style={localStyles.sectionLabel}>FINALIDADE</Text>
          <Text style={localStyles.purposeText}>{trip.reason}</Text>

          {trip.description ? (
            <>
              <View style={localStyles.divider} />
              <Text style={localStyles.sectionLabel}>
                DESCRIÇÃO DE ENCERRAMENTO
              </Text>
              <Text style={localStyles.purposeText}>{trip.description}</Text>
            </>
          ) : null}
        </View>

        <View style={[localStyles.card, localStyles.gapCard]}>
          <DetailRow
            icon={<Car size={18} color={colors.primary} />}
            label="Veículo"
            value={`${trip.vehicle.model} • ${trip.vehicle.plate}`}
          />

          <DetailRow
            icon={<Clock3 size={18} color={colors.primary} />}
            label="Horário de início previsto"
            value={formatTripTime(trip.predictedStartDate)}
          />

          <DetailRow
            icon={<Clock3 size={18} color={colors.primary} />}
            label="Horário previsto de término"
            value={formatTripTime(trip.predictedEndDate)}
          />
        </View>

        {actionError ? (
          <Text style={localStyles.actionError}>{actionError}</Text>
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <PageHeader
        title="Detalhes da viagem"
        subtitle={trip ? formatTripFullDate(trip.predictedStartDate) : undefined}
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          (isLoading || loadError || !trip) && localStyles.stateContent,
          {
            paddingBottom:
              getTabBarContentPadding(insets.bottom) +
              (hasAction ? TRIP_ACTION_FOOTER_HEIGHT : 0),
          },
        ]}
      >
        {renderContent()}
      </ScrollView>

      {hasAction && trip ? (
        <View style={[localStyles.footer, { bottom: tabBarHeight }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isStarting}
            onPress={
              isInProgress
                ? () => {
                    setActionError("");
                    setShowFinishModal(true);
                  }
                : handleStartTrip
            }
            style={[
              localStyles.actionButton,
              isStarting && localStyles.actionButtonDisabled,
            ]}
          >
            {isStarting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : isInProgress ? (
              <Square size={17} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" />
            )}
            <Text style={localStyles.actionButtonText}>
              {isStarting
                ? "Iniciando..."
                : isInProgress
                  ? "Finalizar viagem"
                  : "Iniciar viagem"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={closeFinishModal}
        transparent
        visible={showFinishModal}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Finalizar viagem</Text>
            <Text style={localStyles.modalLabel}>Descrição</Text>
            <TextInput
              editable={!isFinishing}
              multiline
              onChangeText={(value) => {
                setDescription(value);
                setFinishError("");
              }}
              placeholder="Descreva como foi a viagem"
              placeholderTextColor={colors.textMuted}
              style={localStyles.descriptionInput}
              textAlignVertical="top"
              value={description}
            />

            {finishError ? (
              <Text style={localStyles.modalError}>{finishError}</Text>
            ) : null}

            <View style={localStyles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isFinishing}
                onPress={closeFinishModal}
                style={[localStyles.modalButton, localStyles.cancelButton]}
              >
                <Text style={localStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!description.trim() || isFinishing}
                onPress={handleFinishTrip}
                style={[
                  localStyles.modalButton,
                  localStyles.finishButton,
                  (!description.trim() || isFinishing) &&
                    localStyles.actionButtonDisabled,
                ]}
              >
                {isFinishing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={localStyles.finishButtonText}>Finalizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  card: {
    ...baseCard,
    marginBottom: CARD_SPACING,
  },
  gapCard: {
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
    backgroundColor: colors.background,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 14,
  },
  actionButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  actionError: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
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
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.58)",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  modalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },
  descriptionInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: CARD_BORDER_COLOR,
    borderRadius: 14,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalError: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  finishButton: {
    backgroundColor: colors.primary,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
