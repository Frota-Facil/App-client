import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { NotificationFilter } from "../../constants/notifications";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationRequestError,
  type AppNotification,
} from "../../services/notifications";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../constants/colors";

const getNotificationCardType = (type: AppNotification["type"]) => {
  if (type === "REQUEST_REJECTED") {
    return "rejected";
  }

  if (type === "REQUEST_CREATED") {
    return "created";
  }

  return "approved";
};

const formatNotificationDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AvisosScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [filter, setFilter] = useState<NotificationFilter>("Todas");
  const [notificationItems, setNotificationItems] = useState<AppNotification[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters: NotificationFilter[] = ["Todas", "Aprovadas", "Recusadas"];

  useEffect(() => {
    let isCurrent = true;

    const loadNotifications = async () => {
      if (!token) {
        setNotificationItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextNotifications = await fetchNotifications(token);

        if (isCurrent) {
          setNotificationItems(nextNotifications);
        }
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        if (error instanceof NotificationRequestError) {
          setError(error.message);
          return;
        }

        setError("Não foi possível carregar as notificações.");
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isCurrent = false;
    };
  }, [token]);

  const handleMarkAllAsRead = async () => {
    if (!token) {
      return;
    }

    setError(null);

    try {
      const updatedNotifications = await markAllNotificationsAsRead(token);

      if (updatedNotifications.length > 0) {
        setNotificationItems(updatedNotifications);
        return;
      }

      setNotificationItems((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );
    } catch (error) {
      if (error instanceof NotificationRequestError) {
        setError(error.message);
        return;
      }

      setError("Não foi possível marcar as notificações como lidas.");
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!token) {
      return;
    }

    setError(null);

    try {
      const updatedNotification = await markNotificationAsRead(
        notificationId,
        token
      );

      setNotificationItems((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                ...updatedNotification,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      if (error instanceof NotificationRequestError) {
        setError(error.message);
        return;
      }

      setError("Não foi possível marcar a notificação como lida.");
    }
  };

  const filteredNotifications =
    filter === "Todas"
      ? notificationItems
      : notificationItems.filter((item) =>
          filter === "Aprovadas"
            ? item.type === "REQUEST_APPROVED"
            : item.type === "REQUEST_REJECTED"
        );

  const renderNotificationContent = () => {
    if (loading) {
      return (
        <View style={screenStyles.listState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={screenStyles.listStateText}>Carregando notificações...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={screenStyles.listState}>
          <Text style={screenStyles.listStateText}>{error}</Text>
        </View>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <View style={screenStyles.listState}>
          <Text style={screenStyles.listStateText}>
            Nenhuma notificação encontrada.
          </Text>
        </View>
      );
    }

    return filteredNotifications.map((item) => (
      <NotificationCard
        key={item.id}
        title={item.title}
        message={item.message}
        date={formatNotificationDate(item.createdAt)}
        type={getNotificationCardType(item.type)}
        read={item.read}
        onPress={() => handleMarkNotificationAsRead(item.id)}
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
            (loading || error || filteredNotifications.length === 0) &&
              screenStyles.stateListContent,
            { paddingBottom: getTabBarContentPadding(insets.bottom) + 72 },
          ]}
        >
          {renderNotificationContent()}
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
});
