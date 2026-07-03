import { useCallback } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '../ui/Avatar';
import { NotificationBadge } from '../common/NotificaionBadge';
import { styles } from '../../styles/globalStyles';
import { RequestButton } from '../../components/ui/RequestButton';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications } from '../../services/notifications';
import {
  queryKeys,
  queryRefreshIntervals,
} from '../../services/queryKeys';

export const Header = () => {
  const isFocused = useIsFocused();
  const { token, user } = useAuth();
  const { data: notifications = [], refetch } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => fetchNotifications(token ?? ""),
    enabled: Boolean(token),
    staleTime: 0,
    refetchInterval: isFocused ? queryRefreshIntervals.fast : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
  const driverName = user?.name?.trim() || "Motorista";
  const initials = driverName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useFocusEffect(
    useCallback(() => {
      if (token) {
        void refetch();
      }
    }, [refetch, token])
  );

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Avatar initials={initials || "M"} />

          <View>
            <Text style={styles.headerSubtitle}>Olá, motorista</Text>
            <Text style={styles.headerName}>{driverName}</Text>
          </View>
        </View>

        <NotificationBadge
          count={unreadCount}
          onPress={() => router.push("/avisos")}
        />
      </View>

      <Text style={styles.heroText}>
        Pronto para a{'\n'}próxima viagem?
      </Text>


      <RequestButton />
    </View>
  );
};
