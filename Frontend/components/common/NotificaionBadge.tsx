import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, BellRing } from "lucide-react-native";
import { styles } from '../../styles/globalStyles';

type NotificationBadgeProps = {
  count: number;
  onPress?: () => void;
}

export const NotificationBadge = ({ count, onPress }: NotificationBadgeProps) => (
  <TouchableOpacity onPress={onPress} style={styles.bellWrapper}>
    {count > 0 ? (
      <BellRing size={22} color="#FFFFFF" />
    ) : (
      <Bell size={22} color="#FFFFFF" />
    )}
    
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);
