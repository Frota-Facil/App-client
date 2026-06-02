import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { styles } from "../../styles/globalStyles";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { FilterTabs } from "../../components/layout/FilterTabs";
import { NotificationCard } from "../../components/cards/NotificationCard";
import {
  notifications,
  NotificationFilter,
} from "../../constants/notifications";

export default function AvisosScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<NotificationFilter>("Todas");

  const filters: NotificationFilter[] = ["Todas", "Aprovadas", "Recusadas"];

  const filteredNotifications =
    filter === "Todas"
      ? notifications
      : notifications.filter((item) => item.category === filter);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <PageHeader
        title="Notificações"
        leftIconSource={require("../../assets/images/seta-esquerda.png")}
        onBackPress={() => router.back()}
        rightContent={
          <View style={screenStyles.headerActions}>
            <HeaderHelpButton
              title="Como usar Avisos"
              message="Nesta tela você acompanha notificações e comunicados importantes. Você pode filtrar os avisos e marcar todos como visualizados."
            />

            <TouchableOpacity disabled style={screenStyles.allButton}>
              <Text style={styles.markAllText}>✓ Todas</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FilterTabs options={filters} value={filter} onChange={setFilter} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.notificationsListContent,
          { paddingBottom: getTabBarContentPadding(insets.bottom) },
        ]}
      >
        {filteredNotifications.map((item) => (
          <NotificationCard
            key={item.id}
            title={item.title}
            message={item.message}
            date={item.date}
            type={item.type}
          />
        ))}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  allButton: {
    minHeight: 44,
    justifyContent: "center",
  },
});
