import React, { useCallback, useState } from "react";
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
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import {
  queryKeys,
  queryRefreshIntervals,
} from "../../services/queryKeys";
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
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [filter, setFilter] = useState<NotificationFilter>("Todas");
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    data: notificationItems = [],
    error: queryError,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => fetchNotifications(token ?? ""),
    enabled: Boolean(token),
    staleTime: 0,
    refetchInterval: isFocused ? queryRefreshIntervals.fast : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  const filters: NotificationFilter[] = ["Todas", "Aprovadas", "Recusadas"];

  useFocusEffect(
    useCallback(() => {
      if (token) {
        void refetch();
      }
    }, [refetch, token])
  );

  const invalidateNotificationQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
      queryClient.invalidateQueries({ queryKey: queryKeys.home }),
    ]);
  }, [queryClient]);

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(token ?? ""),
    onSuccess: async (updatedNotifications) => {
      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications,
        (currentNotifications = []) =>
          updatedNotifications.length > 0
            ? updatedNotifications
            : currentNotifications.map((item) => ({
                ...item,
                read: true,
              }))
      );
      await invalidateNotificationQueries();
    },
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId, token ?? ""),
    onSuccess: async (updatedNotification) => {
      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications,
        (currentNotifications = []) =>
          currentNotifications.map((item) =>
            item.id === updatedNotification.id
              ? {
                  ...item,
                  ...updatedNotification,
                  read: true,
                }
              : item
          )
      );
      await invalidateNotificationQueries();
    },
  });

  const handleMarkAllAsRead = async () => {
    if (!token) {
      return;
    }

    setActionError(null);

    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      if (error instanceof NotificationRequestError) {
        setActionError(error.message);
        return;
      }

      setActionError("Não foi possível marcar as notificações como lidas.");
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!token) {
      return;
    }

    setActionError(null);

    try {
      await markNotificationAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      if (error instanceof NotificationRequestError) {
        setActionError(error.message);
        return;
      }

      setActionError("Não foi possível marcar a notificação como lida.");
    }
  };

  const queryErrorMessage =
    queryError instanceof NotificationRequestError
      ? queryError.message
      : queryError
        ? "Não foi possível carregar as notificações."
        : null;
  const error = actionError ?? queryErrorMessage;

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
