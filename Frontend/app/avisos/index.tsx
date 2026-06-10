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
import { StatusBar } from "expo-status-bar";
import { CheckCheck } from "lucide-react-native";

import { styles } from "../../styles/globalStyles";
import {
  getTabBarContentPadding,
  getTabBarHeight,
} from "../../components/layout/TabBar";
import { PageHeader } from "../../components/layout/PageHeader";
import { HeaderHelpButton } from "../../components/layout/HeaderHelpButton";
import { FilterTabs } from "../../components/layout/FilterTabs";
import { NotificationCard } from "../../components/cards/NotificationCard";
import {
  notifications,
  NotificationFilter,
} from "../../constants/notifications";
import { colors } from "../../constants/colors";

export default function AvisosScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<NotificationFilter>("Todas");
  const [notificationItems, setNotificationItems] = useState(notifications);

  const filters: NotificationFilter[] = ["Todas", "Aprovadas", "Recusadas"];

  const handleMarkAllAsRead = () => {
    setNotificationItems((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const filteredNotifications =
    filter === "Todas"
      ? notificationItems
      : notificationItems.filter((item) => item.category === filter);

  return (
    <SafeAreaView style={screenStyles.root} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.surface}
        style="dark"
        translucent={false}
      />

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
          </View>
        }
      />

      <View style={screenStyles.contentArea}>
        <FilterTabs options={filters} value={filter} onChange={setFilter} />

        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.notificationsListContent,
            { paddingBottom: getTabBarContentPadding(insets.bottom) + 72 },
          ]}
        >
          {filteredNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              title={item.title}
              message={item.message}
              date={item.date}
              type={item.type}
              read={item.read}
            />
          ))}
        </ScrollView>
      </View>

      <View
        style={[
          screenStyles.markAllFloatingButtonWrapper,
          {
            bottom: getTabBarHeight(insets.bottom) + 16,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleMarkAllAsRead}
          style={screenStyles.markAllFloatingButton}
        >
          <CheckCheck color="#111827" size={18} strokeWidth={2.4} />
          <Text style={screenStyles.markAllFloatingButtonText}>
            Marcar todos
          </Text>
        </TouchableOpacity>
      </View>

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

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  markAllFloatingButtonWrapper: {
    position: "absolute",
    right: 20,
  },

  markAllFloatingButton: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  markAllFloatingButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
});
