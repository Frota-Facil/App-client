import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, BellRing } from "lucide-react-native";
import { colors } from "../../constants/colors";
import { styles } from '../../styles/globalStyles';

type NotificationBadgeProps = {
  count: number;
  onPress?: () => void;
}

export const NotificationBadge = ({ count, onPress }: NotificationBadgeProps) => (
  <TouchableOpacity onPress={onPress} style={styles.bellWrapper}>
    {count > 0 ? (
      <BellRing size={22} color={colors.textLight} />
    ) : (
      <Bell size={22} color={colors.textLight} />
    )}
    
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);
