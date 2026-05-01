import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/globalStyles";

interface VehicleCardProps {
  name: string;
  plate: string;
  status: string; // novo padrão
}

export const VehicleCard = ({
  name,
  plate,
  status,
}: VehicleCardProps) => {
  const getStatus = () => {
    switch (status) {
      case "available":
        return {
          label: "Disponível",
          bg: "#DCFCE7",
          color: "#16A34A",
        };
      case "in_use":
        return {
          label: "Em uso",
          bg: "#DBEAFE",
          color: "#2563EB",
        };
      case "maintenance":
        return {
          label: "Manutenção",
          bg: "#FEF3C7",
          color: "#CA8A04",
        };
      default:
        return {
          label: "Indisponível",
          bg: "#FEE2E2",
          color: "#DC2626",
        };
    }
  };

  const s = getStatus();

  return (
    <TouchableOpacity style={styles.vehicleCard}>
      <Text style={{ fontSize: 28 }}>🚗</Text>

      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{name}</Text>
        <Text style={styles.vehiclePlate}>{plate}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: s.bg,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 10,
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: s.color,
            marginRight: 5,
          }}
        />

        <Text style={{ color: s.color, fontSize: 12 }}>
          {s.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};