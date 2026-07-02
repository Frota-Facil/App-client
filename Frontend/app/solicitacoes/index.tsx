import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { RequestCard } from "../../components/cards/RequestCard";
import { FilterTabs } from "../../components/layout/FilterTabs";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { PageHeader } from "../../components/layout/PageHeader";
import {
  getTabBarContentPadding,
  getTabBarHeight,
} from "../../components/layout/TabBar";
import { colors } from "../../constants/colors";
import {
  getRequestStatusLabel,
  type RequestStatus,
  type VehicleRequest,
} from "../../constants/requests";
import { useAuth } from "../../contexts/AuthContext";
import {
  getMyRequests,
  RequestRequestError,
} from "../../services/requests";
import { baseCard, styles } from "../../styles/globalStyles";
import { formatDateToPtBr, formatTimeToPtBr } from "../../utils/dateTime";

type RequestFilter =
  | "Todas"
  | "Pendentes"
  | "Aprovadas"
  | "Recusadas"
  | "Concluídas";

const filters: RequestFilter[] = [
  "Todas",
  "Pendentes",
  "Aprovadas",
  "Recusadas",
  "Concluídas",
];

const filterStatus: Partial<Record<RequestFilter, RequestStatus>> = {
  Pendentes: "PENDING",
  Aprovadas: "APPROVED",
  Recusadas: "REJECTED",
  Concluídas: "COMPLETED",
};

type RequestDetailRowProps = {
  label: string;
  value: string;
};

const RequestDetailRow = ({ label, value }: RequestDetailRowProps) => (
  <View style={screenStyles.modalDetailRow}>
    <Text style={screenStyles.modalDetailLabel}>{label}</Text>
    <Text style={screenStyles.modalDetailValue}>{value}</Text>
  </View>
);

const getLoadErrorMessage = (error: unknown) => {
  if (!(error instanceof RequestRequestError)) {
    return "Não foi possível carregar as solicitações.";
  }

  if (error.status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (error.isConnectionError) {
    return "Não foi possível conectar ao servidor.";
  }

  return "Não foi possível carregar as solicitações.";
};

export default function SolicitacoesScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, token } = useAuth();
  const [filter, setFilter] = useState<RequestFilter>("Todas");
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<VehicleRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      const loadRequests = async () => {
        if (!token) {
          setRequests([]);
          setIsLoading(false);
          router.replace("/");
          return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
          const nextRequests = await getMyRequests(token);

          if (isCurrent) {
            setRequests(nextRequests);
          }
        } catch (error) {
          if (error instanceof RequestRequestError && error.status === 401) {
            await signOut();
            return;
          }

          if (isCurrent) {
            setErrorMessage(getLoadErrorMessage(error));
          }
        } finally {
          if (isCurrent) {
            setIsLoading(false);
          }
        }
      };

      void loadRequests();

      return () => {
        isCurrent = false;
      };
    }, [signOut, token])
  );

  const filteredRequests = useMemo(() => {
    const status = filterStatus[filter];

    return status
      ? requests.filter((request) => request.status === status)
      : requests;
  }, [filter, requests]);

  const selectedRequestDetails = selectedRequest
    ? [
        {
          label: "Status",
          value: getRequestStatusLabel(selectedRequest.status),
        },
        { label: "Veículo", value: selectedRequest.vehicle.model },
        { label: "Placa", value: selectedRequest.vehicle.plate },
        {
          label: "Data",
          value: formatDateToPtBr(selectedRequest.predictedStartDate),
        },
        {
          label: "Início",
          value: formatTimeToPtBr(selectedRequest.predictedStartDate),
        },
        {
          label: "Término previsto",
          value: formatTimeToPtBr(selectedRequest.predictedEndDate),
        },
        { label: "Destino/local", value: selectedRequest.destination },
        { label: "Finalidade", value: selectedRequest.reason },
      ]
    : [];

  const openEditRequest = (request: VehicleRequest) => {
    if (request.status !== "PENDING") {
      return;
    }

    router.push({
      pathname: "/addrequest",
      params: { requestId: request.id, mode: "edit" },
    });
  };

  const isShowingListState =
    isLoading || Boolean(errorMessage) || filteredRequests.length === 0;

  const renderRequestContent = () => {
    if (isLoading) {
      return (
        <View style={screenStyles.listState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={screenStyles.listStateText}>
            Carregando solicitações...
          </Text>
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

    if (filteredRequests.length === 0) {
      return (
        <View style={screenStyles.listState}>
          <Text style={screenStyles.listStateText}>
            {requests.length === 0
              ? "Você ainda não possui solicitações."
              : "Nenhuma solicitação encontrada para o filtro selecionado."}
          </Text>
        </View>
      );
    }

    return filteredRequests.map((request) => (
      <RequestCard
        key={request.id}
        name={request.vehicle.model}
        plate={request.vehicle.plate}
        date={formatDateToPtBr(request.predictedStartDate)}
        location={request.destination}
        status={getRequestStatusLabel(request.status)}
        onPress={() => setSelectedRequest(request)}
        onEditPress={
          request.status === "PENDING"
            ? () => openEditRequest(request)
            : undefined
        }
      />
    ));
  };

  return (
    <SafeAreaView style={screenStyles.root} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.surface}
        style="dark"
        translucent={false}
      />

      <PageHeader
        title="Minhas solicitações"
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
        rightContent={
          <HeaderHelpButton
            title="Como usar Solicitações"
            message="Nesta tela você acompanha suas solicitações de veículos. Use os filtros para ver solicitações pendentes, aprovadas, recusadas ou concluídas. Para criar uma nova solicitação, use o botão Solicitar veículo."
          />
        }
      />

      <View style={screenStyles.contentArea}>
        <FilterTabs options={filters} value={filter} onChange={setFilter} />

        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.bodyContent,
            isShowingListState && screenStyles.stateListContent,
            { paddingBottom: getTabBarContentPadding(insets.bottom) + 72 },
          ]}
        >
          {renderRequestContent()}
        </ScrollView>
      </View>

      <View
        style={[
          screenStyles.requestFloatingButtonWrapper,
          {
            bottom: getTabBarHeight(insets.bottom) + 16,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/addrequest")}
          style={screenStyles.requestFloatingButton}
        >
          <Text style={screenStyles.requestFloatingButtonText}>
            + Solicitar veículo
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={Boolean(selectedRequest)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={screenStyles.modalOverlay}>
          <View style={screenStyles.modalCard}>
            <Text style={screenStyles.modalTitle}>Detalhes da solicitação</Text>

            <View style={screenStyles.modalRows}>
              {selectedRequestDetails.map((detail) => (
                <RequestDetailRow
                  key={detail.label}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedRequest(null)}
              style={screenStyles.modalCloseButton}
            >
              <Text style={screenStyles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  requestFloatingButtonWrapper: {
    position: "absolute",
    right: 20,
  },

  requestFloatingButton: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  requestFloatingButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  modalCard: {
    ...baseCard,
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  modalRows: {
    marginTop: 2,
  },

  modalDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalDetailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  modalDetailValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  modalCloseButton: {
    width: "100%",
    height: 52,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  modalCloseButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
});
