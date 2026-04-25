import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/globalStyles';

interface VehicleCardProps {
  name: string;
  plate: string;
  available: boolean;
}

export const VehicleCard = ({ name, plate, available }: VehicleCardProps) => (
  <TouchableOpacity style={styles.vehicleCard}>
    <Text style={{ fontSize: 28 }}>🚗</Text>

    <View style={styles.vehicleInfo}>
      <Text style={styles.vehicleName}>{name}</Text>
      <Text style={styles.vehiclePlate}>{plate}</Text>
    </View>

    {available && (
      <View style={styles.availableBadge}>
        <View style={styles.dot} />
        <Text style={styles.availableText}>Disponível</Text>
      </View>
    )}
  </TouchableOpacity>
);