import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { styles } from "../../styles/globalStyles";
import {
  getTabBarContentPadding,
  getTabBarHeight,
  TabBar,
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

export default function SolicitaçõesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<RequestFilter>("Todas");

  const filteredRequests = requests.filter((request) => {
    return (
      filter === "Todas" ||
      (filter === "Pendentes" && request.status === "Pendente") ||
      (filter === "Aprovadas" && request.status === "Aprovada") ||
      (filter === "Recusadas" && request.status === "Recusada")
    );
  });

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
            <RequestCard key={item.id} {...item} />
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

      <TabBar />
     
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
});
