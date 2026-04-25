import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/globalStyles';

type NotificationBadgeProps = {
  count: number
}

export const NotificationBadge = ({ count }: NotificationBadgeProps) => (
  <TouchableOpacity style={styles.bellWrapper}>
    <Text>🔔</Text>
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);