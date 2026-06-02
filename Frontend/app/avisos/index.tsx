import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CheckCheck } from "lucide-react-native";

import { styles } from "../../styles/globalStyles";
import {
  getTabBarContentPadding,
  getTabBarHeight,
  TabBar,
} from "../../components/layout/TabBar";
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
  const [notificationItems, setNotificationItems] = useState(notifications);
  const [showMarkAllButton, setShowMarkAllButton] = useState(true);
  const markAllButtonAnimation = useRef(new Animated.Value(1)).current;

  const filters: NotificationFilter[] = ["Todas", "Aprovadas", "Recusadas"];

  const animateMarkAllButton = (visible: boolean) => {
    setShowMarkAllButton(visible);

    Animated.timing(markAllButtonAnimation, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

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
          </View>
        }
      />

      <FilterTabs options={filters} value={filter} onChange={setFilter} />

      <ScrollView
        style={styles.body}
        onScrollBeginDrag={() => animateMarkAllButton(false)}
        onMomentumScrollBegin={() => animateMarkAllButton(false)}
        onMomentumScrollEnd={() => animateMarkAllButton(true)}
        onScrollEndDrag={() => animateMarkAllButton(true)}
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

      <Animated.View
        pointerEvents={showMarkAllButton ? "auto" : "none"}
        style={[
          screenStyles.markAllFloatingButtonWrapper,
          {
            bottom: getTabBarHeight(insets.bottom) + 16,
            opacity: markAllButtonAnimation,
            transform: [
              {
                translateY: markAllButtonAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
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
      </Animated.View>

      <TabBar />
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
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
