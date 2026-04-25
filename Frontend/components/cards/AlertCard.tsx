import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/globalStyles';

interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tint: string;
}

export const AlertCard = ({ icon, title, subtitle, tint }: AlertCardProps) => (
  <TouchableOpacity style={[styles.alertCard, { backgroundColor: tint }]}>
    <View style={styles.alertIcon}>{icon}</View>

    <View style={styles.alertText}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertSubtitle}>{subtitle}</Text>
    </View>

    <Text>›</Text>
  </TouchableOpacity>
);