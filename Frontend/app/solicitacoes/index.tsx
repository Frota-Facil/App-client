import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "../../styles/globalStyles";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { FilterTabs } from "../../components/layout/FilterTabs";
import { RequestCard } from "../../components/cards/RequestCard";
import { requests } from "../../constants/requests";
import { FormButton } from "../../components/ui/FormButton";
import { router } from "expo-router";

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
    <SafeAreaView style={styles.root} edges={["top"]}>
      <PageHeader
        title="Minhas solicitações"
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
        rightContent={
          <FormButton
            title="+"
            onPress={() => router.push("/addrequest")}
            variant="primary"
          />
        }
      />

      <FilterTabs options={filters} value={filter} onChange={setFilter} />

      {/* LISTA */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) },
        ]}
      >
        {filteredRequests.map((item) => (
          <RequestCard key={item.id} {...item} />
        ))}
      </ScrollView>

      <TabBar />
     
    </SafeAreaView>
  );
}
