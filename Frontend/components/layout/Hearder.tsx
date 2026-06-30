import { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Avatar } from '../ui/Avatar';
import { NotificationBadge } from '../common/NotificaionBadge';
import { styles } from '../../styles/globalStyles';
import { RequestButton } from '../../components/ui/RequestButton';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications } from '../../services/notifications';

export const Header = () => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const driverName = user?.name?.trim() || "Motorista";
  const initials = driverName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      const loadUnreadNotifications = async () => {
        if (!token) {
          setUnreadCount(0);
          return;
        }

        try {
          const notifications = await fetchNotifications(token);
          const nextUnreadCount = notifications.filter(
            (notification) => !notification.read
          ).length;

          if (isCurrent) {
            setUnreadCount(nextUnreadCount);
          }
        } catch {
          if (isCurrent) {
            setUnreadCount(0);
          }
        }
      };

      loadUnreadNotifications();

      return () => {
        isCurrent = false;
      };
    }, [token])
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
