import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from '../../styles/globalStyles';

type NotificationBadgeProps = {
  count: number
}

export const NotificationBadge = ({ count }: NotificationBadgeProps) => (
  <TouchableOpacity style={styles.bellWrapper}>
    <Text>
      <Image
        source={require("../../assets/images/notificacaobranco.png")}
        style={{ width: 22, height: 22 }}
      />
    </Text>
    
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);