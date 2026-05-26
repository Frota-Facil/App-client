import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { styles } from "../../styles/globalStyles";
import { getTabBarContentPadding, TabBar } from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
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
        rightText="✓ Todas"
        onBackPress={() => router.back()}
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
