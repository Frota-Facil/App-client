import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { baseCard, styles } from "../../styles/globalStyles";
import {
  getTabBarContentPadding,
  getTabBarHeight,
} from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { FilterTabs } from "../../components/layout/FilterTabs";
import { RequestCard } from "../../components/cards/RequestCard";
import { requests } from "../../constants/requests";
import { router } from "expo-router";
import { colors } from "../../constants/colors";

type RequestFilter = "Todas" | "Pendentes" | "Aprovadas" | "Recusadas";

const filters: RequestFilter[] = [
  "Todas",
  "Pendentes",
  "Aprovadas",
  "Recusadas",
];

type RequestDetailRowProps = {
  label: string;
  value: string;
};

type RequestDetail = {
  label: string;
  value?: string;
};

const formatRequestDate = (value: string) => {
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const RequestDetailRow = ({ label, value }: RequestDetailRowProps) => (
  <View style={screenStyles.modalDetailRow}>
    <Text style={screenStyles.modalDetailLabel}>{label}</Text>
    <Text style={screenStyles.modalDetailValue}>{value}</Text>
  </View>
);

const getRequestPurpose = (request: (typeof requests)[number]) =>
  request.reason ?? request.finalidade ?? request.purpose ?? request.motivo;

export default function SolicitaçõesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<RequestFilter>("Todas");
  const [selectedRequest, setSelectedRequest] = useState<
    (typeof requests)[number] | null
  >(null);

  const filteredRequests = requests.filter((request) => {
    return (
      filter === "Todas" ||
      (filter === "Pendentes" && request.status === "Pendente") ||
      (filter === "Aprovadas" && request.status === "Aprovada") ||
      (filter === "Recusadas" && request.status === "Recusada")
    );
  });
  const selectedRequestDetails = selectedRequest
    ? ([
        { label: "Status", value: selectedRequest.status },
        { label: "Veículo", value: selectedRequest.name },
        { label: "Placa", value: selectedRequest.plate },
        { label: "Data", value: formatRequestDate(selectedRequest.date) },
        { label: "Início", value: selectedRequest.startTime },
        { label: "Término previsto", value: selectedRequest.endTime },
        { label: "Destino/local", value: selectedRequest.location },
        { label: "Finalidade", value: getRequestPurpose(selectedRequest) },
        {
          label: "Data de criação",
          value: selectedRequest.createdAt
            ? formatRequestDate(selectedRequest.createdAt)
            : undefined,
        },
      ] satisfies RequestDetail[]).filter(
        (detail): detail is RequestDetailRowProps => Boolean(detail.value)
      )
    : [];

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
            message="Nesta tela você acompanha suas solicitações de veículos. Use os filtros para ver solicitações pendentes, aprovadas, recusadas, concluídas ou em andamento. Para criar uma nova solicitação, use o botão Solicitar veículo."
          />
        }
      />

      <View style={screenStyles.contentArea}>
        <FilterTabs options={filters} value={filter} onChange={setFilter} />

        {/* LISTA */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.bodyContent,
            { paddingBottom: getTabBarContentPadding(insets.bottom) + 72 },
          ]}
        >
          {filteredRequests.map((item) => (
            <RequestCard
              key={item.id}
              {...item}
              onPress={() => setSelectedRequest(item)}
            />
          ))}
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
